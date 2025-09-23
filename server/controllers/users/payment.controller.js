/* controllers/payment.controller.js */
import { stripe } from '../../middleware/stripe.middleware.js';
import Payment from '../../models/Payment.js';
import Booking from '../../models/Booking.js';
import User from '../../models/User.js';
import { validationResult } from 'express-validator';

// Create Payment Intent
export const createPaymentIntent = async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { bookingId, amount, currency = 'inr', metadata = {} } = req.body;
    const userId = req.user.userId; // from auth middleware

    // Verify booking exists and belongs to user
    const booking = await Booking.findOne({
      _id: bookingId,
      customerId: userId,
      paymentStatus: 'pending'
    }).populate('listingId vendorId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or already paid'
      });
    }

    // Verify amount matches booking
    if (amount !== booking.pricing.totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Amount mismatch'
      });
    }

    // Get or create Stripe customer
    const user = await User.findById(userId);
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.profile.firstName,
        phone: user.phone,
        metadata: {
          userId: userId.toString()
        }
      });
      stripeCustomerId = customer.id;
      
      // Save Stripe customer ID
      await User.findByIdAndUpdate(userId, {
        stripeCustomerId: customer.id
      });
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency.toLowerCase(),
      customer: stripeCustomerId,
      automatic_payment_methods: { enabled: true },
      metadata: {
        bookingId: bookingId.toString(),
        customerId: userId.toString(),
        vendorId: booking.vendorId._id.toString(),
        listingId: booking.listingId._id.toString(),
        serviceType: booking.listingId.category,
        eventDate: booking.serviceDate.toISOString(),
        ...metadata
      },
      receipt_email: user.email,
      description: `Booking payment for ${booking.listingId.title}`,
    });

    // Save payment record
    const payment = new Payment({
      bookingId,
      customerId: userId,
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId,
      amount,
      currency: currency.toLowerCase(),
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret,
      receiptEmail: user.email,
      metadata: {
        serviceType: booking.listingId.category,
        eventDate: booking.serviceDate.toISOString(),
        location: booking.location.address
      }
    });

    await payment.save();

    return res.status(201).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
        currency
      }
    });

  } catch (error) {
    console.error('Create Payment Intent Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Confirm Payment
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user.userId;

    // Get payment record
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntentId,
      customerId: userId
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Update local payment status
    payment.status = paymentIntent.status;
    if (paymentIntent.status === 'succeeded') {
      payment.paidAt = new Date();
      
      // Update booking status
      await Booking.findByIdAndUpdate(payment.bookingId, {
        paymentStatus: 'paid',
        status: 'confirmed',
        confirmedAt: new Date()
      });
    }

    await payment.save();

    return res.json({
      success: true,
      data: {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert back from paise
        currency: paymentIntent.currency
      }
    });

  } catch (error) {
    console.error('Confirm Payment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to confirm payment'
    });
  }
};

// Handle Webhook Events
export const handleWebhook = async (req, res) => {
  try {
    const event = req.stripeEvent; // Set by middleware

    console.log(`🔔 Webhook received: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      case 'payment_intent.requires_action':
        await handlePaymentRequiresAction(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });

  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({
      error: 'Webhook handler failed'
    });
  }
};

// Helper functions for webhook handlers
const handlePaymentSucceeded = async (paymentIntent) => {
  try {
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (payment) {
      payment.status = 'succeeded';
      payment.paidAt = new Date();
      await payment.save();

      // Update booking
      await Booking.findByIdAndUpdate(payment.bookingId, {
        paymentStatus: 'paid',
        status: 'confirmed',
        confirmedAt: new Date()
      });

      console.log(`✅ Payment succeeded for booking ${payment.bookingId}`);
      
      // TODO: Send confirmation emails, notifications, etc.
    }
  } catch (error) {
    console.error('Handle payment succeeded error:', error);
  }
};

const handlePaymentFailed = async (paymentIntent) => {
  try {
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (payment) {
      payment.status = 'failed';
      payment.failureReason = paymentIntent.last_payment_error?.message;
      await payment.save();

      console.log(`❌ Payment failed for booking ${payment.bookingId}`);
      
      // TODO: Send failure notifications
    }
  } catch (error) {
    console.error('Handle payment failed error:', error);
  }
};

const handlePaymentRequiresAction = async (paymentIntent) => {
  try {
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (payment) {
      payment.status = 'requires_action';
      await payment.save();

      console.log(`⚠️ Payment requires action for booking ${payment.bookingId}`);
    }
  } catch (error) {
    console.error('Handle payment requires action error:', error);
  }
};

// Get Payment Status
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    const userId = req.user.userId;

    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntentId,
      customerId: userId
    }).populate('bookingId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    return res.json({
      success: true,
      data: {
        id: payment.stripePaymentIntentId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        booking: payment.bookingId,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt
      }
    });

  } catch (error) {
    console.error('Get Payment Status Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get payment status'
    });
  }
};
