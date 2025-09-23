import express from "express";
import { sendOTP,verifyOTPAndAuth,getVendorProfile } from "../../controllers/vendors/vendor.auth.controller.js";
import {authenticateVendor} from "../../middleware/vendor/vendor.auth.middleware.js";


const router = express.Router();

// Step 1: Send OTP to email
router.post("/send-otp", sendOTP);

// Step 2: Verify OTP and authenticate (login/signup)
router.post("/verify-otp", verifyOTPAndAuth);

router.get("/profile", authenticateVendor,getVendorProfile);

export default router;
