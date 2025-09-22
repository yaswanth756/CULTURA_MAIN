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
      enum: ['pending', 'confirmed', 'completed', 'cancelled'], // ✅ ADDED cancelled
      default: 'pending',
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'], // ✅ ADDED refunded
      default: 'pending',
    },

    // Additional fields for UI
    
    cancelledAt: { type: Date },
    confirmedAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Helpful indexes
BookingSchema.index({ serviceDate: 1, vendorId: 1 });
BookingSchema.index({ customerId: 1, serviceDate: -1 });

const Booking = mongoose.model('Booking', BookingSchema);
export default Booking;
