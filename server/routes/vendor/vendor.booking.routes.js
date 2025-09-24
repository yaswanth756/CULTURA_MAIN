// routes/bookingRoutes.js
import express from 'express';
import { authenticateVendor } from '../../middleware/vendor/vendor.auth.middleware.js';
import { getVendorBookings, updateBookingStatus } from '../../controllers/vendors/vendor.booking.controller.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateVendor);

router.get('/', getVendorBookings);               // GET /api/vendor/bookings
router.patch('/:id/status', updateBookingStatus); // PATCH /api/vendor/bookings/:id/status

export default router;
