// controllers/analyticsController.js
import Booking from '../../models/Booking.js';
import Listing from '../../models/Listing.js';
import mongoose from 'mongoose';

// Platform commission rate (10%)
const COMMISSION_RATE = 0.10;

// Get vendor analytics dashboard
// controllers/analyticsController.js
export const getVendorAnalytics = async (req, res) => {
    try {
      const vendorId = req.user._id;
      const { range = '30d' } = req.query;
  
      // Calculate date range
      const now = new Date();
      let startDate;
      
      switch (range) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
  
      // ✅ OPTIMIZED: Use aggregation pipeline instead of populate
      const bookings = await Booking.aggregate([
        {
          $match: {
            vendorId: new mongoose.Types.ObjectId(vendorId),
            createdAt: { $gte: startDate, $lte: now }
          }
        },
        {
          $lookup: {
            from: 'listings',
            localField: 'listingId',
            foreignField: '_id',
            as: 'listing',
            pipeline: [{ $project: { category: 1, title: 1, views: 1 } }]
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'customerId',
            foreignField: '_id',
            as: 'customer',
            pipeline: [{ $project: { 'profile.firstName': 1 } }]
          }
        },
        {
          $addFields: {
            listingId: { $arrayElemAt: ['$listing', 0] },
            customerId: { $arrayElemAt: ['$customer', 0] }
          }
        },
        {
          $project: {
            listing: 0,
            customer: 0
          }
        },
        {
          $sort: { createdAt: 1 }
        }
      ]);
  
      // ✅ GET ALL VENDOR LISTINGS WITH VIEWS - This aggregates all listing views
      const listingViewsAggregation = await Listing.aggregate([
        { 
          $match: { 
            vendorId: new mongoose.Types.ObjectId(vendorId),
            status: 'active' // Only count active listings
          } 
        },
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$views' },
            listingCount: { $sum: 1 },
            avgViewsPerListing: { $avg: '$views' },
            topViews: { $max: '$views' }
          }
        }
      ]);
  
      // Extract view stats
      const viewStats = listingViewsAggregation[0] || {
        totalViews: 0,
        listingCount: 0,
        avgViewsPerListing: 0,
        topViews: 0
      };
  
      // Also get individual listing performance for additional insights
      const topListings = await Listing.find({ vendorId, status: 'active' })
        .sort({ views: -1 })
        .limit(5)
        .select('title views category')
        .lean();
  
      // Calculate totals
      const totalViews = viewStats.totalViews; // ✅ Sum of all listing views
      const totalInquiries = bookings.length;
      const completedBookings = bookings.filter(b => b.status === 'completed');
      const totalBookings = completedBookings.length;
      const conversionRate = totalInquiries > 0 ? ((totalBookings / totalInquiries) * 100).toFixed(1) : 0;
      
      // Calculate revenue after commission
      const revenueAfterCommission = completedBookings.reduce((sum, booking) => {
        const baseAmount = booking.pricing?.baseAmount || 0;
        return sum + Math.round(baseAmount * (1 - COMMISSION_RATE));
      }, 0);
  
      // Generate time series data
      const timeseries = [];
      const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        
        const dayBookings = bookings.filter(b => {
          const bookingDate = new Date(b.createdAt);
          return bookingDate >= dayStart && bookingDate < dayEnd;
        });
        
        const dayRevenue = dayBookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => {
            const baseAmount = b.pricing?.baseAmount || 0;
            return sum + Math.round(baseAmount * (1 - COMMISSION_RATE));
          }, 0);
  
        timeseries.push({
          date: dayStart.toISOString().split('T')[0],
          bookings: dayBookings.length,
          revenue: dayRevenue
        });
      }
  
      // Bookings by status
      const statusCounts = {};
      bookings.forEach(booking => {
        statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;
      });
  
      const bookingsByStatus = Object.keys(statusCounts).map(status => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count: statusCounts[status]
      }));
  
      // Category earnings share (completed bookings only)
      const categoryEarnings = {};
      completedBookings.forEach(booking => {
        const category = booking.listingId?.category || 'other';
        const earnings = Math.round((booking.pricing?.baseAmount || 0) * (1 - COMMISSION_RATE));
        categoryEarnings[category] = (categoryEarnings[category] || 0) + earnings;
      });
  
      const categoryShare = Object.keys(categoryEarnings).map(category => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        value: categoryEarnings[category]
      }));
  
      // Response data
      const analyticsData = {
        range,
        dateRange: {
          from: startDate.toISOString(),
          to: now.toISOString()
        },
        totals: {
          views: totalViews, // ✅ Total views across ALL listings
          inquiries: totalInquiries,
          bookings: totalBookings,
          conversionRate: parseFloat(conversionRate),
          revenueAfterCommission
        },
        timeseries,
        bookingsByStatus,
        categoryShare,
        insights: {
          averageBookingValue: totalBookings > 0 ? Math.round(revenueAfterCommission / totalBookings) : 0,
          topPerformingCategory: categoryShare.length > 0 
            ? categoryShare.reduce((prev, current) => prev.value > current.value ? prev : current).category
            : null,
          viewToInquiryRate: totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) : 0,
          // ✅ Additional view insights
          avgViewsPerListing: Math.round(viewStats.avgViewsPerListing),
          totalListings: viewStats.listingCount,
          topViewedListing: topListings[0] || null
        },
        // ✅ Top performing listings by views
        topListings: topListings.map(listing => ({
          id: listing._id,
          title: listing.title,
          views: listing.views,
          category: listing.category
        }))
      };
  
      res.status(200).json({
        success: true,
        data: analyticsData
      });
  
    } catch (error) {
      console.error('Get vendor analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics data'
      });
    }
  };
  

// Get detailed analytics report (optional)
export const getAnalyticsReport = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { startDate, endDate, category } = req.query;

    let matchQuery = {
      vendorId: new mongoose.Types.ObjectId(vendorId)
    };

    // Add date range filter
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'listings',
          localField: 'listingId',
          foreignField: '_id',
          as: 'listing'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$listing' },
      { $unwind: '$customer' },
      {
        $addFields: {
          vendorEarnings: {
            $multiply: ['$pricing.baseAmount', (1 - COMMISSION_RATE)]
          },
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' }
        }
      }
    ];

    // Add category filter if provided
    if (category) {
      pipeline.push({
        $match: { 'listing.category': category }
      });
    }

    pipeline.push({
      $group: {
        _id: {
          year: '$year',
          month: '$month',
          status: '$status',
          category: '$listing.category'
        },
        count: { $sum: 1 },
        totalEarnings: { $sum: '$vendorEarnings' },
        avgEarnings: { $avg: '$vendorEarnings' }
      }
    });

    pipeline.push({ $sort: { '_id.year': -1, '_id.month': -1 } });

    const detailedReport = await Booking.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: detailedReport,
      filters: { startDate, endDate, category }
    });

  } catch (error) {
    console.error('Get analytics report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate analytics report'
    });
  }
};

// Track listing view (to be called when someone views a listing)
export const trackListingView = async (req, res) => {
  try {
    const { listingId } = req.params;
    
    // Increment view count
    await Listing.findByIdAndUpdate(
      listingId,
      { $inc: { views: 1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'View tracked'
    });

  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track view'
    });
  }
};
