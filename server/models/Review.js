import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    // Relationships
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    
    // Review Content
    rating: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 5 
    },
    comment: { 
      type: String, 
      required: true, 
      trim: true, 
      minlength: 10,
      maxlength: 500 
    },
    
    // Future Image Support (ready but unused at launch)
    images: [{
      type: String,
      default: []
    }],
    
    // Reward Tracking
    coinsAwarded: { 
      type: Number, 
      default: 25 
    },
    
    // Moderation & Status
    status: { 
      type: String, 
      enum: ['active', 'hidden', 'flagged'], 
      default: 'active' 
    },
    
    // Engagement
    helpfulVotes: { 
      type: Number, 
      default: 0 
    }
  }, {
    timestamps: true,
    versionKey: false
  });
  
  // Performance Indexes
  reviewSchema.index({ vendorId: 1, status: 1, createdAt: -1 });
  reviewSchema.index({ listingId: 1, status: 1, rating: -1 });
  reviewSchema.index({ bookingId: 1 }, { unique: true });
  reviewSchema.index({ customerId: 1, createdAt: -1 });
export default mongoose.model("Review", reviewSchema);