import express from "express";
import {
  sendOTP,
  verifyOTPAndAuth,
  resendOTP,
} from "../controllers/auth.controller.js";

const router = express.Router();

// Step 1: Send OTP to email
router.post("/send-otp", sendOTP);

// Step 2: Verify OTP and authenticate (login/signup)
router.post("/verify-otp", verifyOTPAndAuth);

// Resend OTP
router.post("/resend-otp", resendOTP);


export default router;
