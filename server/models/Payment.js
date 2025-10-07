import mongoose from 'mongoose';
const { Schema } = mongoose;

const PaymentSchema = new Schema(
  {
    // Razorpay IDs
    razorpayOrderId: { 
      type: String, 
      required: true,
      unique: true,
      index: true 
    },
    razorpayPaymentId: { 
      type: String,
      sparse: true,
      index: true 
    },
    razorpaySignature: { 
      type: String 
    },

    // Relations
    bookingId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Booking', 
      required: true,
      index: true 
    },
    customerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    vendorId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },

    // Payment Details
    amount: { 
      type: Number, 
      required: true,
      min: 0 
    },
    currency: { 
      type: String, 
      default: 'INR',
      uppercase: true 
    },
    
    // Status
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
      default: 'created',
      index: true
    },

    // Payment Type
    paymentType: {
      type: String,
      enum: ['deposit', 'full_payment', 'remaining_payment'],
      default: 'deposit'
    },

    // Metadata
    paymentMethod: { 
      type: String 
    },
    bank: { 
      type: String 
    },
    wallet: { 
      type: String 
    },
    vpa: { 
      type: String 
    },
    cardId: { 
      type: String 
    },
    
    // Error tracking
    errorCode: { 
      type: String 
    },
    errorDescription: { 
      type: String 
    },
    
    // Refund details
    refundAmount: { 
      type: Number,
      default: 0 
    },
    refundReason: { 
      type: String 
    },
    refundedAt: { 
      type: Date 
    },

    // Timestamps
    paidAt: { 
      type: Date 
    },
    failedAt: { 
      type: Date 
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for common queries
PaymentSchema.index({ bookingId: 1, status: 1 });
PaymentSchema.index({ customerId: 1, createdAt: -1 });
PaymentSchema.index({ razorpayOrderId: 1, status: 1 });

const Payment = mongoose.model('Payment', PaymentSchema);
export default Payment;
