/* routes/payment.routes.js */
import express from 'express';
import { body, param } from 'express-validator';
import {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getPaymentStatus
} from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  paymentRateLimit,
  webhookRateLimit,
  paymentSecurity,
  verifyWebhookSignature
} from '../middleware/stripe.middleware.js';

const router = express.Router();

// Apply security headers to all payment routes
router.use(paymentSecurity);

// Create Payment Intent
router.post('/create-intent',
  paymentRateLimit,
  authenticate,
  [
    body('bookingId')
      .isMongoId()
      .withMessage('Invalid booking ID'),
    body('amount')
      .isNumeric()
      .withMessage('Amount must be a number')
      .custom(value => value > 0)
      .withMessage('Amount must be greater than 0'),
    body('currency')
      .optional()
      .isIn(['inr', 'usd'])
      .withMessage('Currency must be INR or USD')
  ],
  createPaymentIntent
);

// Confirm Payment
router.post('/confirm',
  paymentRateLimit,
  authenticate,
  [
    body('paymentIntentId')
      .matches(/^pi_/)
      .withMessage('Invalid payment intent ID')
  ],
  confirmPayment
);

// Get Payment Status
router.get('/status/:paymentIntentId',
  authenticate,
  [
    param('paymentIntentId')
      .matches(/^pi_/)
      .withMessage('Invalid payment intent ID')
  ],
  getPaymentStatus
);

// Webhook Endpoint (No auth required, but signature verified)
router.post('/webhook',
  webhookRateLimit,
  express.raw({ type: 'application/json' }),
  verifyWebhookSignature,
  handleWebhook
);

export default router;
