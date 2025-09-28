// controllers/bookingController.js
import Booking from '../../models/Booking.js';

// Get all bookings for a vendor
export const getVendorBookings = async (req, res) => {
  try {
    const vendorId = req.user._id;
    
    const bookings = await Booking.find({ vendorId })
      .populate('customerId', 'profile.firstName phone email')
      .populate('listingId', 'title images')
      .sort({ createdAt: -1 })
      .exec();

    // Transform data for frontend
    const transformedBookings = bookings.map(booking => ({
      _id: booking._id,
      bookingNumber: booking.bookingNumber,
      customer: {
        name: booking.customerId?.profile?.firstName || 'Unknown Customer',
        phone: booking.customerId?.phone || 'Not provided'
      },
      vendorId: booking.vendorId,
      listingId: booking.listingId?._id,
      serviceDate: booking.serviceDate,
      location: booking.location,
      pricing: booking.pricing,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      imageUrl: booking.listingId?.images?.[0] || null,
      createdAt: booking.createdAt,
      confirmedAt: booking.confirmedAt,
      cancelledAt: booking.cancelledAt,
    }));
    res.status(200).json({
      success: true,
      data: transformedBookings
    });

  } catch (error) {
    console.error('Get vendor bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, confirmed, completed, or cancelled'
      });
    }

    // Find booking and verify vendor ownership
    const booking = await Booking.findOne({ _id: id, vendorId });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or you do not have permission to modify it'
      });
    }

    // Update status and timestamps
    booking.status = status;
    
    if (status === 'confirmed' && !booking.confirmedAt) {
      booking.confirmedAt = new Date();
    }
    
    if (status === 'cancelled' && !booking.cancelledAt) {
      booking.cancelledAt = new Date();
    }

    await booking.save();

    // Populate for response
    await booking.populate('customerId', 'profile.firstName phone email');
    await booking.populate('listingId', 'title images');

    // Transform for frontend
    const transformedBooking = {
      _id: booking._id,
      bookingNumber: booking.bookingNumber,
      customer: {
        name: booking.customerId?.profile?.firstName || 'Unknown Customer',
        phone: booking.customerId?.phone || 'Not provided'
      },
      vendorId: booking.vendorId,
      listingId: booking.listingId?._id,
      serviceDate: booking.serviceDate,
      location: booking.location,
      pricing: booking.pricing,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      imageUrl: booking.listingId?.images?.[0] || null,
      createdAt: booking.createdAt,
      confirmedAt: booking.confirmedAt,
      cancelledAt: booking.cancelledAt,
    };

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: transformedBooking
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status'
    });
  }
};
