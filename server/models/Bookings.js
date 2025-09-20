// models/booking.model.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const BookingSchema = new Schema(
  {
    bookingNumber: { type: String, required: true, unique: true, index: true, trim: true },

    // Relations
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    vendorId:   { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    listingId:  { type: Schema.Types.ObjectId, ref: 'Listing', required: true },

    // Service details
    serviceDate: { type: Date, required: true },   // e.g. 2024-12-25
     // e.g. "18:00"
   

    // Location
    location: {
      address: { type: String, trim: true },
    },

    // Pricing
    pricing: {
      baseAmount:  { type: Number, required: true, min: 0 },
      totalAmount: { type: Number, required: true, min: 0 },
      currency:    { type: String, uppercase: true, trim: true },
    },

    // Statuses
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed'],
      default: 'pending',
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },

    // Misc

    confirmedAt:     { type: Date },
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
