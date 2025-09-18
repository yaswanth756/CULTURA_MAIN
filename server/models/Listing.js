/* models/Listing.js */
import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150,
    index: 'text'  // For search
  },
  
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
    index: 'text'  // For search
  },
  
  category: {
    type: String,
    required: true,
    enum: ['venues', 'catering', 'photography', 'videography', 'music', 'makeup', 'decorations', 'cakes', 'mandap', 'hosts'],
    index: true
  },
  
  subcategory: {
    type: String,
    required: true,
    trim: true
  },
  
  price: {
    base: {
      type: Number,
      required: true,
      min: 0,
      index: true
    },
    type: {
      type: String,
      enum: ['fixed', 'per_person', 'per_event'],
      default: 'fixed'
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  
  images: [{
    type: String  // Just URLs for now
  }],
  
  serviceAreas: [{
    type: String,
    required: true,
    trim: true,
    index: true
  }],
  
  tags: [{
    type: String,
    lowercase: true,
    trim: true,
    index: 'text'  // For search
  }],
  
  // For rating filter
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true
  }
  
}, {
  timestamps: true
});

// Essential indexes for your UI filters
listingSchema.index({ category: 1, status: 1 });
listingSchema.index({ 'price.base': 1, status: 1 });
listingSchema.index({ serviceAreas: 1, status: 1 });
listingSchema.index({ 'ratings.average': -1, status: 1 });
listingSchema.index({ vendorId: 1, status: 1 });

// Text search index for search filter
listingSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,
    tags: 5,
    description: 1
  }
});

export default mongoose.model('Listing', listingSchema);
