// controllers/earningsController.js
import Booking from '../../models/Booking.js';
import mongoose from 'mongoose';

// Platform commission rate (10%)
const COMMISSION_RATE = 0.10;

// Calculate vendor earnings after commission
const calculateVendorEarnings = (baseAmount) => {
  return Math.round(baseAmount * (1 - COMMISSION_RATE));
};

// Get vendor earnings dashboard data
export const getVendorEarnings = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const currentDate = new Date();
    const startOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Get all completed bookings for this vendor
    const completedBookings = await Booking.find({
      vendorId,
      status: 'completed'
    })
    .populate('customerId', 'profile.firstName phone')
    .populate('listingId', 'title category images')
    .sort({ createdAt: -1 })
    .exec();

    // Get booking counts by status
    const bookingCounts = await Booking.aggregate([
      { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert counts to object
    const counts = {};
    bookingCounts.forEach(item => {
      counts[item._id] = item.count;
    });

    // Calculate total earnings (after commission)
    const totalEarnings = completedBookings.reduce((sum, booking) => {
      return sum + calculateVendorEarnings(booking.pricing?.baseAmount || 0);
    }, 0);

    // Calculate this month's earnings
    const thisMonthBookings = completedBookings.filter(booking => 
      new Date(booking.createdAt) >= startOfCurrentMonth
    );
    const thisMonthEarnings = thisMonthBookings.reduce((sum, booking) => {
      return sum + calculateVendorEarnings(booking.pricing?.baseAmount || 0);
    }, 0);

    // Calculate last month's earnings
    const lastMonthBookings = completedBookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= startOfLastMonth && bookingDate <= endOfLastMonth;
    });
    const lastMonthEarnings = lastMonthBookings.reduce((sum, booking) => {
      return sum + calculateVendorEarnings(booking.pricing?.baseAmount || 0);
    }, 0);

    // Group by service category
    const serviceBreakdown = {};
    completedBookings.forEach(booking => {
      const category = booking.listingId?.category || 'other';
      const earningsAfterCommission = calculateVendorEarnings(booking.pricing?.baseAmount || 0);
      
      if (!serviceBreakdown[category]) {
        serviceBreakdown[category] = {
          category,
          serviceName: category.charAt(0).toUpperCase() + category.slice(1),
          totalEarnings: 0,
          bookingsCount: 0,
          completedCount: 0,
          cancelledCount: 0,
          totalRevenue: 0 // before commission
        };
      }
      
      serviceBreakdown[category].totalEarnings += earningsAfterCommission;
      serviceBreakdown[category].totalRevenue += (booking.pricing?.baseAmount || 0);
      serviceBreakdown[category].bookingsCount += 1;
      serviceBreakdown[category].completedCount += 1;
    });

    // Add cancelled bookings to service breakdown
    const cancelledBookings = await Booking.find({
      vendorId,
      status: 'cancelled'
    }).populate('listingId', 'category').exec();

    cancelledBookings.forEach(booking => {
      const category = booking.listingId?.category || 'other';
      if (!serviceBreakdown[category]) {
        serviceBreakdown[category] = {
          category,
          serviceName: category.charAt(0).toUpperCase() + category.slice(1),
          totalEarnings: 0,
          bookingsCount: 0,
          completedCount: 0,
          cancelledCount: 0,
          totalRevenue: 0
        };
      }
      serviceBreakdown[category].bookingsCount += 1;
      serviceBreakdown[category].cancelledCount += 1;
    });

    // Calculate average booking values
    Object.values(serviceBreakdown).forEach(service => {
      service.avgBookingValue = service.completedCount > 0 
        ? Math.round(service.totalEarnings / service.completedCount)
        : 0;
    });

    // Recent transactions (last 10 completed bookings)
    const recentTransactions = completedBookings.slice(0, 10).map(booking => ({
      id: booking._id,
      bookingNumber: booking.bookingNumber,
      customerName: booking.customerId?.profile?.firstName || 'Unknown Customer',
      serviceName: booking.listingId?.title || 'Service',
      category: booking.listingId?.category || 'other',
      amount: calculateVendorEarnings(booking.pricing?.baseAmount || 0),
      grossAmount: booking.pricing?.baseAmount || 0,
      commission: Math.round((booking.pricing?.baseAmount || 0) * COMMISSION_RATE),
      status: booking.status,
      date: booking.createdAt
    }));

    // Response data
    const earningsData = {
      totalEarnings,
      thisMonth: thisMonthEarnings,
      lastMonth: lastMonthEarnings,
      completedBookings: counts.completed || 0,
      cancelledBookings: counts.cancelled || 0,
      totalBookings: Object.values(counts).reduce((sum, count) => sum + count, 0),
      serviceBreakdown: Object.values(serviceBreakdown),
      recentTransactions,
      commissionRate: COMMISSION_RATE * 100, // Send as percentage
      summary: {
        totalGrossRevenue: completedBookings.reduce((sum, b) => sum + (b.pricing?.baseAmount || 0), 0),
        totalCommissionPaid: completedBookings.reduce((sum, b) => sum + Math.round((b.pricing?.baseAmount || 0) * COMMISSION_RATE), 0),
        avgBookingValue: completedBookings.length > 0 
          ? Math.round(totalEarnings / completedBookings.length) 
          : 0
      }
    };

    res.status(200).json({
      success: true,
      data: earningsData
    });

  } catch (error) {
    console.error('Get vendor earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings data'
    });
  }
};

// Get detailed earnings report (optional - for future use)
export const getEarningsReport = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { startDate, endDate, category } = req.query;

    let matchQuery = {
      vendorId: new mongoose.Types.ObjectId(vendorId),
      status: 'completed'
    };

    // Add date range filter if provided
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $lookup: {
          from: 'listings',
          localField: 'listingId',
          foreignField: '_id',
          as: 'listing'
        }
      },
      { $unwind: '$customer' },
      { $unwind: '$listing' },
      {
        $addFields: {
          vendorEarnings: {
            $multiply: ['$pricing.baseAmount', (1 - COMMISSION_RATE)]
          },
          commission: {
            $multiply: ['$pricing.baseAmount', COMMISSION_RATE]
          }
        }
      },
      {
        $project: {
          bookingNumber: 1,
          customerName: '$customer.profile.firstName',
          customerPhone: '$customer.phone',
          serviceTitle: '$listing.title',
          serviceCategory: '$listing.category',
          serviceDate: 1,
          grossAmount: '$pricing.baseAmount',
          vendorEarnings: { $round: '$vendorEarnings' },
          commission: { $round: '$commission' },
          createdAt: 1,
          location: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ];

    // Add category filter if provided
    if (category) {
      pipeline.splice(3, 0, {
        $match: { 'listing.category': category }
      });
    }

    const detailedReport = await Booking.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: detailedReport,
      filters: { startDate, endDate, category },
      total: detailedReport.length
    });

  } catch (error) {
    console.error('Get earnings report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate earnings report'
    });
  }
};
