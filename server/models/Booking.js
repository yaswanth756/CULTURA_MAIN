import mongoose from 'mongoose';
const { Schema } = mongoose;

const BookingSchema = new Schema(
  {
    bookingNumber: { type: String, required: true, unique: true, index: true, trim: true },

    // Relations
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vendorId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    listingId:  { type: Schema.Types.ObjectId, ref: 'Listing', required: true },

    // Service details
    serviceDate: { type: Date, required: true },

    // Location
    location: {
      address: { type: String, trim: true },
    },

    // Pricing
    pricing: {
      baseAmount:  { type: Number, required: true, min: 0 },
      depositeAmount: { type: Number, required: true, min: 0 },
      currency:    { type: String, uppercase: true, trim: true },
    },

    // Statuses
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },

    // Timestamps
    cancelledAt: { type: Date },
    confirmedAt: { type: Date },
    completedAt: { type: Date }, // 🔥 NEW

    // 🔥 NEW: Review System Fields
    reviewStatus: {
      type: String, 
      enum: ['not_eligible', 'pending', 'completed', 'skipped'], 
      default: 'not_eligible'
    },

    reviewPrompts: {
      nextPromptDate: { type: Date },
      promptCount: { type: Number, default: 0 },
      firstPromptDate: { type: Date },
      maxPrompts: { type: Number, default: 8 }
    },

    reviewId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Review' 
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Existing indexes
BookingSchema.index({ serviceDate: 1, vendorId: 1 });
BookingSchema.index({ customerId: 1, serviceDate: -1 });

// 🔥 NEW: Review-related index
BookingSchema.index({ customerId: 1, reviewStatus: 1, 'reviewPrompts.nextPromptDate': 1 });

// Add this to your Booking schema (before export)
BookingSchema.pre('save', function(next) {
  // If booking is being marked as completed for the first time
  if (this.isModified('status') && 
      this.status === 'completed' && 
      this.reviewStatus === 'not_eligible') {
    
    console.log(`🎉 Setting up review system for booking: ${this.bookingNumber}`);
    
    // Automatically set up review system
    this.reviewStatus = 'pending';
    this.completedAt = new Date();
    this.reviewPrompts = {
      nextPromptDate: new Date(), // Show immediately
      promptCount: 0,
      firstPromptDate: new Date(),
      maxPrompts: 8
    };
  }
  next();
});


const Booking = mongoose.model('Booking', BookingSchema);
export default Booking;
