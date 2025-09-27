// routes/reviewRoutes.js
import express from 'express';
import { 
  createReview, 
  skipReview,
  getVendorReviews,
  getListingReviews,
  getCustomerReviews
} from '../../controllers/users/review.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js'; // 🔥 YOUR AUTH MIDDLEWARE

const router = express.Router();

// 🔥 PROTECTED ROUTES (require authentication)
router.post('/create', authenticate, createReview);
router.patch('/skip/:bookingId', authenticate, skipReview);
router.get('/my-reviews', authenticate, getCustomerReviews); // 🔥 UPDATED ROUTE

// 🔥 PUBLIC ROUTES (no authentication needed)
router.get('/vendor/:vendorId', getVendorReviews);
router.get('/listing/:listingId', getListingReviews);

export default router;
