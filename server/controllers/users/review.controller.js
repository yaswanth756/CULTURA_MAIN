import Review from '../../models/Review.js';
import Booking from '../../models/Booking.js';
import User from '../../models/User.js';
import Listing from '../../models/Listing.js';

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const customerId = req.user._id; // 🔥 GET FROM MIDDLEWARE

    // Validate input
    if (!bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: bookingId, rating, comment'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    if (comment.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Review comment must be at least 10 characters'
      });
    }

    // Find and validate booking
    const booking = await Booking.findById(bookingId)
      .populate('customerId', '_id')
      .populate('vendorId', '_id profile vendorInfo')
      .populate('listingId', '_id ratings');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // 🔥 SECURITY: Verify booking belongs to authenticated user
    if (booking.customerId._id.toString() !== customerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: This booking does not belong to you'
      });
    }

    // Validate booking is completed and eligible for review
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    if (booking.reviewId) {
      return res.status(400).json({
        success: false,
        message: 'Booking already has a review'
      });
    }

    // Calculate coin reward based on review quality
    let coinsAwarded = 25; // Base reward
    if (comment.trim().length > 100) {
      coinsAwarded += 10; // Bonus for detailed review
    }
    if (booking.vendorId.vendorInfo.reviewCount < 5) {
      coinsAwarded += 20; // Early adopter bonus
    }

    // Create review
    const review = new Review({
      customerId: customerId, // 🔥 USE MIDDLEWARE USER ID
      vendorId: booking.vendorId._id,
      listingId: booking.listingId._id,
      bookingId: booking._id,
      rating,
      comment: comment.trim(),
      coinsAwarded
    });

    await review.save();

    // Update booking with review reference and status
    booking.reviewId = review._id;
    booking.reviewStatus = 'completed';
    await booking.save();

    // Update vendor rating using existing method
    await booking.vendorId.updateRating(rating);

    // Update listing rating
    const existingReviews = await Review.find({ 
      listingId: booking.listingId._id,
      status: 'active'
    });
    
    const totalRating = existingReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / existingReviews.length;
    
    await Listing.findByIdAndUpdate(booking.listingId._id, {
      'ratings.average': Math.round(averageRating * 10) / 10, // Round to 1 decimal
      'ratings.count': existingReviews.length
    });

    // Award coins to customer
    await User.findByIdAndUpdate(customerId, { // 🔥 USE MIDDLEWARE USER ID
      $inc: {
        'coins.balance': coinsAwarded,
        'coins.totalEarned': coinsAwarded
      },
      'coins.lastActivity': new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: {
        review: {
          _id: review._id,
          rating: review.rating,
          comment: review.comment,
          coinsAwarded: review.coinsAwarded,
          createdAt: review.createdAt
        },
        coinsAwarded,
        updatedRatings: {
          vendorRating: booking.vendorId.vendorInfo.rating,
          listingRating: averageRating
        }
      }
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Skip review (update prompt timing)
export const skipReview = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const customerId = req.user._id; // 🔥 GET FROM MIDDLEWARE

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // 🔥 SECURITY: Verify booking belongs to authenticated user
    if (booking.customerId.toString() !== customerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: This booking does not belong to you'
      });
    }

    if (booking.reviewStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking is not eligible for review'
      });
    }

    // Update review prompt - skip this prompt and set next one
    await booking.updateReviewPrompt();

    res.status(200).json({
      success: true,
      message: 'Review skipped, will remind later',
      data: {
        nextPromptDate: booking.reviewPrompts.nextPromptDate,
        promptCount: booking.reviewPrompts.promptCount
      }
    });

  } catch (error) {
    console.error('Skip review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to skip review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get reviews for a vendor (public - no auth needed)
export const getVendorReviews = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      vendorId,
      status: 'active'
    })
      .populate('customerId', 'profile.firstName')
      .populate('listingId', 'title category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ vendorId, status: 'active' });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get vendor reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get vendor reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get reviews for a listing (public - no auth needed)
export const getListingReviews = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      listingId,
      status: 'active'
    })
      .populate('customerId', 'profile.firstName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ listingId, status: 'active' });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get listing reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get listing reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get customer's own reviews
export const getCustomerReviews = async (req, res) => {
  try {
    const customerId = req.user._id; // 🔥 GET FROM MIDDLEWARE
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      customerId: customerId, // 🔥 USE MIDDLEWARE USER ID
      status: 'active'
    })
      .populate('vendorId', 'profile.businessName profile.firstName')
      .populate('listingId', 'title category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ customerId: customerId, status: 'active' });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get customer reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
