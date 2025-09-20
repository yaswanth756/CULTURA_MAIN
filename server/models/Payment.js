/* models/Payment.js */
import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  // Relations
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true,
    unique: true,
    index: true 
  },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Stripe Data
  stripePaymentIntentId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  stripePaymentMethodId: { type: String },
  stripeCustomerId: { type: String, index: true },
  
  // Payment Details
  amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  currency: { 
    type: String, 
    default: 'inr', 
    uppercase: true 
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: [
      'requires_payment_method',
      'requires_confirmation', 
      'requires_action',
      'processing',
      'succeeded',
      'requires_capture',
      'canceled',
      'failed'
    ],
    default: 'requires_payment_method',
    index: true
  },
  
  // Metadata
  metadata: {
    serviceType: String,
    eventDate: String,
    location: String
  },
  
  // Security & Audit
  clientSecret: { type: String, required: true },
  receiptEmail: String,
  failureReason: String,
  
  // Timestamps
  paidAt: Date,
  refundedAt: Date,
  
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for performance
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ customerId: 1, status: 1 });

export default mongoose.model('Payment', PaymentSchema);
