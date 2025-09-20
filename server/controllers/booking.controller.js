/* controllers/booking.controller.js */
import Booking from '../models/Booking.js';
import { nanoid } from 'nanoid';

export const createBooking = async (req, res) => {
  try {
    const {
      listingId,
      serviceDate,
      location,
      baseAmount,
      totalAmount,
      currency = 'INR'
    } = req.body;
    
    const customerId = req.user.userId;

    // Generate unique booking number
    const bookingNumber = `BK-${nanoid(10)}`;

    const booking = new Booking({
      bookingNumber,
      customerId,
      vendorId: req.body.vendorId, // From listing
      listingId,
      serviceDate: new Date(serviceDate),
      location: {
        address: location
      },
      pricing: {
        baseAmount,
        totalAmount,
        currency: currency.toUpperCase()
      },
      status: 'pending',
      paymentStatus: 'pending'
    });

    await booking.save();

    return res.status(201).json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Create Booking Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
};

export const getBookings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, paymentStatus } = req.query;

    const filter = { customerId: userId };
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const bookings = await Booking.find(filter)
      .populate('listingId', 'title category images price')
      .populate('vendorId', 'profile.businessName profile.firstName')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error('Get Bookings Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};
