import { errorResponse } from '../utils/responseHandler.js';

export const validateSendOTP = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return errorResponse(res, 'Email is required', 400);
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return errorResponse(res, 'Please provide a valid email address', 400);
  }

  next();
};

export const validateVerifyOTP = (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return errorResponse(res, 'Email and OTP are required', 400);
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return errorResponse(res, 'Please provide a valid email address', 400);
  }

  if (!/^\d{6}$/.test(otp)) {
    return errorResponse(res, 'OTP must be a 6-digit number', 400);
  }

  next();
};
