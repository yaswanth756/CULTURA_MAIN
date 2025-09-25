// routes/analyticsRoutes.js
import express from 'express';
import { authenticateVendor } from '../../middleware/vendor/vendor.auth.middleware.js';
import { 
  getVendorAnalytics, 
  getAnalyticsReport, 
  trackListingView 
} from '../../controllers/vendors/vendor.analytics.controller.js';

const router = express.Router();

// Apply auth middleware
router.use(authenticateVendor);

router.get('/', getVendorAnalytics);              // GET /api/vendor/analytics
router.get('/report', getAnalyticsReport);        // GET /api/vendor/analytics/report
router.post('/views/:listingId', trackListingView); // POST /api/vendor/analytics/views/:listingId

export default router;
