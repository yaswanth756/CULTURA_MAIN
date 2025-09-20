/* routes/booking.routes.js */
import express from 'express';
import { body } from 'express-validator';
import { createBooking, getBookings } from '../controllers/booking.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create Booking
router.post('/',
  authMiddleware,
  [
    body('listingId').isMongoId().withMessage('Invalid listing ID'),
    body('vendorId').isMongoId().withMessage('Invalid vendor ID'),
    body('serviceDate').isISO8601().withMessage('Invalid service date'),
    body('baseAmount').isNumeric().withMessage('Base amount must be numeric'),
    body('totalAmount').isNumeric().withMessage('Total amount must be numeric'),
    body('location').notEmpty().withMessage('Location is required')
  ],
  createBooking
);

// Get User Bookings
router.get('/', authMiddleware, getBookings);

export default router;
