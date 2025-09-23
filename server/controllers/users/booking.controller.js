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
      status: 'confirmed',
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

    // Get bookings with populated data - Updated populate fields
    const bookings = await Booking.find(filter)
      .populate('vendorId', 'profile phone email role vendorInfo')
      .populate('listingId', 'title category images pricing')
      .sort({ serviceDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Booking.countDocuments(filter);

    // Format response data with correct vendor field access
    const formattedBookings = bookings.map(booking => {
      const baseAmount = booking.pricing.baseAmount || 0;
      const depositAmount = booking.pricing.depositeAmount || 0;
      const payableAmount = baseAmount - depositAmount;

      // Correctly access vendor information from User schema
      const getVendorName = (vendor) => {
        if (!vendor) return 'Vendor';
        // For vendors, prioritize businessName, fallback to firstName
        if (vendor.role === 'vendor' && vendor.profile?.businessName) {
          return vendor.profile.businessName;
        }
        return vendor.profile?.firstName || 'Vendor';
      };

      return {
        id: booking._id,
        bookingNumber: booking.bookingNumber,
        title: booking.listingId?.title || 'Service Booking',
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
        createdAt: booking.createdAt,
        category: booking.listingId?.category,
        // Additional vendor info
        vendorRating: booking.vendorId?.vendorInfo?.rating || 0,
        vendorVerified: booking.vendorId?.vendorInfo?.verified || false
      };
    });
    console.log(formattedBookings)

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




