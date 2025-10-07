import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../../models/Payment.js';
import Booking from '../../models/Booking.js';
import User from '../../models/User.js';

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Razorpay Order
 * POST /api/payments/create-order
 */
export const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId, amount, currency = 'INR' } = req.body;

    // Validate required fields
    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: bookingId and amount are required'
      });
    }

    // Validate amount
    if (amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be at least ₹1'
      });
    }

    // Fetch booking details
    const booking = await Booking.findById(bookingId)
      .populate('customerId', 'profile phone email')
      .populate('vendorId', '_id');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already paid'
      });
    }

    // Convert amount to paise (Razorpay works in smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    // Generate short receipt ID (max 40 chars for Razorpay)
    const shortBookingId = bookingId.toString().slice(-8);
    const timestamp = Date.now().toString().slice(-8);
    const receiptId = `rcpt_${shortBookingId}_${timestamp}`;

    // Create Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: currency,
      receipt: receiptId,
      notes: {
        bookingId: bookingId.toString(),
        bookingNumber: booking.bookingNumber,
        customerId: booking.customerId._id.toString(),
        vendorId: booking.vendorId._id.toString(),
      }
    });

    // Save payment record in database
    const payment = new Payment({
      razorpayOrderId: razorpayOrder.id,
      bookingId: booking._id,
      customerId: booking.customerId._id,
      vendorId: booking.vendorId._id,
      amount: amount,
      currency: currency,
      status: 'created',
      paymentType: 'deposit'
    });

    await payment.save();

    // Return order details to frontend
    res.status(201).json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        customerDetails: {
          name: booking.customerId.profile?.firstName || 'Customer',
          email: booking.customerId.email,
          contact: booking.customerId.phone || ''
        },
        notes: razorpayOrder.notes
      }
    });

  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verify Razorpay Payment
 * POST /api/payments/verify
 */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      bookingId
    } = req.body;

    // Validate required fields
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification fields'
      });
    }

    // Verify signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpaySignature;

    if (!isAuthentic) {
      // Update payment as failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        {
          status: 'failed',
          errorCode: 'SIGNATURE_VERIFICATION_FAILED',
          errorDescription: 'Payment signature verification failed',
          failedAt: new Date()
        }
      );

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - Invalid signature'
      });
    }

    // Fetch payment details from Razorpay to get payment method info
    let paymentDetails = null;
    try {
      paymentDetails = await razorpayInstance.payments.fetch(razorpayPaymentId);
    } catch (fetchError) {
      console.error('Error fetching payment details:', fetchError);
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'captured',
        paymentMethod: paymentDetails?.method,
        bank: paymentDetails?.bank,
        wallet: paymentDetails?.wallet,
        vpa: paymentDetails?.vpa,
        cardId: paymentDetails?.card_id,
        paidAt: new Date()
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Update booking status
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: 'paid',
        status: 'confirmed',
        confirmedAt: new Date()
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        payment: {
          id: payment._id,
          razorpayPaymentId: payment.razorpayPaymentId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
          paidAt: payment.paidAt
        },
        booking: {
          id: booking._id,
          bookingNumber: booking.bookingNumber,
          paymentStatus: booking.paymentStatus,
          status: booking.status
        }
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Handle Payment Failure
 * POST /api/payments/failure
 */
export const handlePaymentFailure = async (req, res) => {
  try {
    const { razorpayOrderId, error } = req.body;

    if (!razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Update payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        status: 'failed',
        errorCode: error?.code || 'UNKNOWN_ERROR',
        errorDescription: error?.description || 'Payment failed',
        failedAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: 'Payment failure recorded'
    });

  } catch (error) {
    console.error('Payment failure handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record payment failure',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get Payment Details
 * GET /api/payments/:paymentId
 */
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate('bookingId', 'bookingNumber serviceDate status')
      .populate('customerId', 'profile email phone')
      .populate('vendorId', 'profile email phone');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment details retrieved successfully',
      data: { payment }
    });

  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get User's Payment History
 * GET /api/payments/user/:userId
 */
export const getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Build filter
    const filter = { customerId: userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Fetch payments
    const payments = await Payment.find(filter)
      .populate('bookingId', 'bookingNumber serviceDate')
      .populate('vendorId', 'profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Payment history retrieved successfully',
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPayments: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Initiate Refund
 * POST /api/payments/refund
 */
export const initiateRefund = async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    // Fetch payment
    const payment = await Payment.findById(paymentId)
      .populate('bookingId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: 'Only captured payments can be refunded'
      });
    }

    // Calculate refund amount
    const refundAmount = amount || payment.amount;
    const refundAmountPaise = Math.round(refundAmount * 100);

    // Initiate refund with Razorpay
    const refund = await razorpayInstance.payments.refund(
      payment.razorpayPaymentId,
      {
        amount: refundAmountPaise,
        notes: {
          reason: reason || 'Customer refund request',
          bookingNumber: payment.bookingId?.bookingNumber
        }
      }
    );

    // Update payment record
    payment.status = 'refunded';
    payment.refundAmount = refundAmount;
    payment.refundReason = reason;
    payment.refundedAt = new Date();
    await payment.save();

    // Update booking
    await Booking.findByIdAndUpdate(payment.bookingId, {
      paymentStatus: 'refunded',
      status: 'cancelled'
    });

    res.status(200).json({
      success: true,
      message: 'Refund initiated successfully',
      data: {
        refund: {
          id: refund.id,
          amount: refundAmount,
          status: refund.status
        }
      }
    });

  } catch (error) {
    console.error('Refund initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate refund',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
