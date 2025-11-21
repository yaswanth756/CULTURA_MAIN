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
      enum: ['fixed', 'per_person', 'per_event', 'per_day', 'per_hour'],
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
  
  // Features/amenities offered by the service
  features: [{
    type: String,
    trim: true,
    maxlength: 100,  // Limit individual feature length
    index: 'text'    // For search functionality
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
  },
  
  // Track how many times this listing was viewed
  views: {
    type: Number,
    default: 0,
    min: 0,
    index: true  // For analytics queries
  },
  dynamicPricing: {
    enabled: {
      type: Boolean,
      default: false // vendor can opt in
    },
    minPrice: {
      type: Number,
      default: 0
    },
    maxPrice: {
      type: Number,
      default: 0
    },
    recommendedPrice: {
      type: Number,
      default: 0,
      index: true
    },
    lastUpdated: {
      type: Date
    },
    
  },
  
  
}, {
  timestamps: true,
  versionKey: false
});

// Essential indexes for UI filters and performance
listingSchema.index({ category: 1, status: 1 });
listingSchema.index({ 'price.base': 1, status: 1 });
listingSchema.index({ serviceAreas: 1, status: 1 });
listingSchema.index({ 'ratings.average': -1, status: 1 });
listingSchema.index({ vendorId: 1, status: 1 });
listingSchema.index({ views: -1, status: 1 }); // For analytics - most viewed listings

// Compound index for common queries
listingSchema.index({ category: 1, serviceAreas: 1, status: 1 });
listingSchema.index({ vendorId: 1, category: 1, status: 1 });

// Text search index with proper weights
listingSchema.index({
  title: 'text',
  description: 'text',
  features: 'text',
  tags: 'text',
  serviceAreas: 'text',
  subcategory: 'text'
}, {
  weights: {
    title: 10,           // Highest priority
    serviceAreas: 8,     // Location is important
    features: 7,         // What they offer
    tags: 5,             // Keywords
    subcategory: 3,      // Service type
    description: 1       // Lowest priority
  },
  name: 'listing_search_index'
});

// Instance methods
listingSchema.methods.incrementViews = function() {
  this.views = (this.views || 0) + 1;
  return this.save();
};

// Static methods for analytics
listingSchema.statics.getMostViewed = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ views: -1 })
    .limit(limit)
    .populate('vendorId', 'businessName profile.firstName profile.lastName');
};

listingSchema.statics.getViewStats = function(vendorId) {
  return this.aggregate([
    { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
    {
      $group: {
        _id: '$category',
        totalViews: { $sum: '$views' },
        avgViews: { $avg: '$views' },
        listingCount: { $sum: 1 }
      }
    },
    { $sort: { totalViews: -1 } }
  ]);
};

// Virtual for display
listingSchema.virtual('formattedViews').get(function() {
  const views = this.views || 0;
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return views.toString();
});

// Ensure virtual fields are serialized
listingSchema.set('toJSON', { virtuals: true });
listingSchema.set('toObject', { virtuals: true });

export default mongoose.model('Listing', listingSchema);
