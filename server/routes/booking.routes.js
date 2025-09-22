import express from 'express';
import {
  getUserBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
  getBookingStats,
  createBooking 
} from '../controllers/booking.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';


const router = express.Router();

// Create new booking
router.post('/createnew', authenticate, createBooking);

router.get('/user/:customerId', authenticate, getUserBookings);

router.patch('/:bookingId/cancel', authenticate, cancelBooking);

// Get booking statistics
router.get('/user/:customerId/stats', authenticate, getBookingStats);

// Get specific booking by ID
router.get('/:bookingId', authenticate, getBookingById);

// Cancel booking


// Update booking status (for vendors/admins)
//router.patch('/:bookingId/status', authenticate, updateBookingStatus);

// Update payment status (existing route)
//router.patch('/:bookingId/payment', authenticate, updatePaymentStatus);

// Get booking by ID
//router.get('/:bookingId', authenticateToken, getBooking);

// Update payment status
//outer.patch('/:bookingId/payment', authenticateToken, updatePaymentStatus);

// Get customer bookings
//router.get('/customer/:customerId', authenticateToken, getCustomerBookings);

// Get vendor bookings  
//router.get('/vendor/:vendorId', authenticateToken, getVendorBookings);

export default router;
