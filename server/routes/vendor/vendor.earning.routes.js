// routes/earningsRoutes.js
import express from 'express';
import { authenticateVendor } from '../../middleware/vendor/vendor.auth.middleware.js';
import { getVendorEarnings, getEarningsReport } from "../../controllers/vendors/vendor.earning.controller.js";

const router = express.Router();

// Apply auth middleware
router.use(authenticateVendor);

router.get('/', getVendorEarnings);        // GET /api/vendor/earnings
router.get('/report', getEarningsReport);  // GET /api/vendor/earnings/report

export default router;
