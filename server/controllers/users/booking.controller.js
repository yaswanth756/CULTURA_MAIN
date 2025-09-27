import Booking from '../../models/Booking.js';
import { generateBookingNumber } from '../../utils/bookingUtils.js';
import User from '../../models/User.js';
import Listing from '../../models/Listing.js';
// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const {
      customerId,
      vendorId,
      listingId,
      serviceDate,
      location,
      pricing,

    } = req.body;
    

    // Validate required fields
    if (!customerId || !vendorId || !listingId || !serviceDate || !pricing?.baseAmount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Generate unique booking number
    const bookingNumber = await generateBookingNumber();

    // Create booking
    const booking = new Booking({
      bookingNumber,
      customerId,
      vendorId,
      listingId,
      serviceDate: new Date(serviceDate),
      location: {
        address: location?.address || location
      },
      pricing: {
        baseAmount: pricing.baseAmount,
        depositeAmount: pricing.depositeAmount ,
        currency: pricing.currency || 'INR'
      },
      status: 'pending',
      paymentStatus: 'paid'
    });

    await booking.save();

    // Populate related data for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name phone email')
      .populate('vendorId', 'businessName phone email')
      .populate('listingId', 'title category');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking: populatedBooking,
        bookingNumber,
        nextStep: 'payment_processing'
      }
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// Get user's bookings with filters
// Updated getUserBookings controller
export const getUserBookings = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status, paymentStatus, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = { customerId };
    if (status && status !== 'all') {
      if (status === 'upcoming') {
        filter.status = { $in: ['pending', 'confirmed'] };
        filter.serviceDate = { $gte: new Date() };
      } else {
        filter.status = status;
      }
    }
    if (paymentStatus && paymentStatus !== 'all') {
      filter.paymentStatus = paymentStatus;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Get bookings with populated data including reviews
    const bookings = await Booking.find(filter)
      .populate('vendorId', 'profile phone email role vendorInfo')
      .populate('listingId', 'title category images pricing')
      .populate('reviewId', 'rating comment createdAt') // 🔥 NEW: Populate review if exists
      .sort({ serviceDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Booking.countDocuments(filter);

    // 🔥 NEW: Check for pending reviews that need prompting
    const now = new Date();
    const pendingReviews = bookings.filter(booking => 
      booking.reviewStatus === 'pending' && 
      booking.reviewPrompts?.nextPromptDate && 
      booking.reviewPrompts.nextPromptDate <= now &&
      booking.reviewPrompts.promptCount < booking.reviewPrompts.maxPrompts
    );

    // Format response data with review information
    const formattedBookings = bookings.map(booking => {
      const baseAmount = booking.pricing.baseAmount || 0;
      const depositAmount = booking.pricing.depositeAmount || 0;
      const payableAmount = baseAmount - depositAmount;

      // Correctly access vendor information from User schema
      const getVendorName = (vendor) => {
        if (!vendor) return 'Vendor';
        if (vendor.role === 'vendor' && vendor.profile?.businessName) {
          return vendor.profile.businessName;
        }
        return vendor.profile?.firstName || 'Vendor';
      };

      // 🔥 NEW: Calculate review eligibility and status
      const canReview = booking.status === 'completed' && 
                       booking.reviewStatus === 'pending' && 
                       !booking.reviewId;

      const daysSinceCompletion = booking.completedAt ? 
        Math.floor((now - new Date(booking.completedAt)) / (1000 * 60 * 60 * 24)) : null;

      const needsReviewPrompt = booking.reviewStatus === 'pending' && 
                               booking.reviewPrompts?.nextPromptDate && 
                               booking.reviewPrompts.nextPromptDate <= now &&
                               booking.reviewPrompts.promptCount < booking.reviewPrompts.maxPrompts;

      return {
        id: booking._id,
        bookingNumber: booking.bookingNumber,
        vendor: getVendorName(booking.vendorId),
        serviceDate: booking.serviceDate,
        location: booking.location?.address ? 
          (booking.location.address.length > 30 ? 
            booking.location.address.substring(0, 30) + '...' : 
            booking.location.address) : 'Location TBD',
        vendorPhone: booking.vendorId?.phone || 'Not provided',
        baseAmount: baseAmount,
        depositAmount: depositAmount,
        payableAmount: payableAmount,
        paymentStatus: booking.paymentStatus || 'pending',
        bookingStatus: booking.status || 'pending',
        canCancel: booking.status === 'pending' || booking.status === 'confirmed',

        vendorRating: booking.vendorId?.vendorInfo?.rating || 0,
        vendorVerified: booking.vendorId?.vendorInfo?.verified || false,

        // 🔥 NEW: Review-related fields
        reviewStatus: booking.reviewStatus || 'not_eligible',
        canReview: canReview,
        hasReview: !!booking.reviewId,
        daysSinceCompletion: daysSinceCompletion,
        needsReviewPrompt: needsReviewPrompt,
        reviewPromptCount: booking.reviewPrompts?.promptCount || 0,
        maxReviewPrompts: booking.reviewPrompts?.maxPrompts || 8,
        nextReviewPromptDate: booking.reviewPrompts?.nextPromptDate,
        
        // Include existing review data if available
        existingReview: booking.reviewId ? {
          rating: booking.reviewId.rating,
          comment: booking.reviewId.comment,
          createdAt: booking.reviewId.createdAt
        } : null
      };
    });

    console.log(formattedBookings);

    res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: {
        bookings: formattedBookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalBookings: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        // 🔥 NEW: Review summary for profile redirect logic
        reviewSummary: {
          hasPendingReviews: pendingReviews.length > 0,
          pendingReviewCount: pendingReviews.length,
          nextReviewDue: pendingReviews.length > 0 ? 
            pendingReviews[0].reviewPrompts.nextPromptDate : null,
          oldestPendingReview: pendingReviews.length > 0 ? 
            pendingReviews.sort((a, b) => 
              new Date(a.completedAt) - new Date(b.completedAt)
            )[0] : null
        }
      }
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};




// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { customerId } = req.user; // From auth middleware

    const booking = await Booking.findOne({ 
      _id: bookingId, 
      customerId 
    })
    .populate('vendorId', 'name businessName phone email')
    .populate('listingId', 'title category images pricing description');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking retrieved successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const customerId = req.user._id; // From auth middleware

    // Find the booking
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Check if booking belongs to the customer
    if (booking.customerId.toString() !== customerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking"
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled"
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel completed booking"
      });
    }

    // Update booking status
    await Booking.findByIdAndUpdate(
      bookingId,
      {
        status: 'cancelled',
        cancelledAt: new Date()
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully"
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking"
    });
  }
};


// Update booking status (for vendors/admins)
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, paymentStatus } = req.body;
    const { role } = req.user; // From auth middleware

    // Validate permissions
    if (role !== 'vendor' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update fields if provided
    if (status) {
      booking.status = status;
      if (status === 'confirmed') {
        booking.confirmedAt = new Date();
      }
    }
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get booking statistics
export const getBookingStats = async (req, res) => {
  try {
    const { customerId } = req.params;

    const stats = await Booking.aggregate([
      { $match: { customerId: mongoose.Types.ObjectId(customerId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$pricing.totalAmount' }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      totalSpent: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
      if (stat._id !== 'cancelled') {
        formattedStats.totalSpent += stat.totalAmount;
      }
    });

    res.status(200).json({
      success: true,
      message: 'Booking statistics retrieved successfully',
      data: { stats: formattedStats }
    });

  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get booking by ID


// Add this new controller function
export const checkPendingReviews = async (req, res) => {
  try {
    const customerId = req.user._id;

    // Find pending reviews that need prompting
    const now = new Date();
    const pendingReviews = await Booking.find({
      customerId: customerId,
      reviewStatus: 'pending',
      'reviewPrompts.nextPromptDate': { $lte: now },
      'reviewPrompts.promptCount': { $lt: 8 }
    })
    .populate('vendorId', 'profile')
    .populate('listingId', 'title')
    .sort({ 'reviewPrompts.nextPromptDate': 1 }); // Oldest pending first

    if (pendingReviews.length > 0) {
      // Return the first pending review for modal display
      const nextReview = pendingReviews[0];
      
      return res.status(200).json({
        success: true,
        hasPendingReviews: true,
        shouldRedirect: true,
        redirectTo: '/profile/bookings',
        nextReview: {
          bookingId: nextReview._id,
          bookingNumber: nextReview.bookingNumber,
          title: nextReview.listingId?.title || 'Service Booking',
          vendorName: nextReview.vendorId?.profile?.businessName || 
                     nextReview.vendorId?.profile?.firstName || 'Vendor',
          serviceDate: nextReview.serviceDate,
          daysSinceCompletion: Math.floor((now - new Date(nextReview.completedAt)) / (1000 * 60 * 60 * 24))
        },
        totalPendingReviews: pendingReviews.length
      });
    }

    res.status(200).json({
      success: true,
      hasPendingReviews: false,
      shouldRedirect: false
    });

  } catch (error) {
    console.error('Check pending reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check pending reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// Fix existing completed bookings - Run this in your backend
const fixExistingBookings = async () => {
  try {
    const completedBookings = await Booking.find({
      status: 'completed',
      reviewStatus: 'not_eligible' // Only fix bookings that haven't been processed
    });

    for (let booking of completedBookings) {
      // Set up review system for existing completed bookings
      booking.reviewStatus = 'pending';
      booking.completedAt = booking.updatedAt; // Use existing timestamp
      booking.reviewPrompts = {
        nextPromptDate: new Date(), // Show immediately
        promptCount: 0,
        firstPromptDate: new Date(),
        maxPrompts: 8
      };
      
      await booking.save();
      console.log(`Fixed booking: ${booking.bookingNumber}`);
    }

    console.log(`Fixed ${completedBookings.length} bookings`);
  } catch (error) {
    console.error('Fix bookings error:', error);
  }
};

// Run this once
fixExistingBookings();



