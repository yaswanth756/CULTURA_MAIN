import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  getPaymentDetails,
  getUserPayments,
  initiateRefund
} from '../../controllers/users/payment.controller.js';

const router = express.Router();

/**
 * @route   POST /api/payments/create-order
 * @desc    Create a new Razorpay order for payment
 * @access  Public (requires bookingId)
 */
router.post('/create-order', createPaymentOrder);

/**
 * @route   POST /api/payments/verify
 * @desc    Verify Razorpay payment signature
 * @access  Public
 */
router.post('/verify', verifyPayment);

/**
 * @route   POST /api/payments/failure
 * @desc    Record payment failure
 * @access  Public
 */
router.post('/failure', handlePaymentFailure);

/**
 * @route   GET /api/payments/:paymentId
 * @desc    Get payment details by ID
 * @access  Private (requires auth)
 */
router.get('/:paymentId', getPaymentDetails);

/**
 * @route   GET /api/payments/user/:userId
 * @desc    Get user's payment history
 * @access  Private (requires auth)
 */
router.get('/user/:userId', getUserPayments);

/**
 * @route   POST /api/payments/refund
 * @desc    Initiate payment refund
 * @access  Private (admin/vendor)
 */
router.post('/refund', initiateRefund);

export default router;
