import  mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    index: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^\+91-[0-9]{10}$/, 'Please provide a valid phone number format: +91-1234567890']
  },
  role: {
    type: String,
    enum: ['vendor', 'customer', 'admin'],
    required: [true, 'Role is required'],
    default: 'customer'
  },
  profile: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [30, 'First name cannot exceed 30 characters']
    },
    businessName: {
      type: String,
      trim: true,
      maxlength: [100, 'Business name cannot exceed 100 characters'],
      // Only required for vendors
      validate: {
        validator: function(value) {
          if (this.role === 'vendor') {
            return value && value.trim().length > 0;
          }
          return true;
        },
        message: 'Business name is required for vendors'
      }
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  location: {
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;    // latitude
        },
        message: 'Coordinates must be [longitude, latitude] with valid values'
      }
    }
  },
  vendorInfo: {
    verified: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  // For customers - favorite vendors
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  }],
  // Tracking fields
  lastLogin: {
    type: Date
  },
  loginCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true, // This adds createdAt and updatedAt
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ 'vendorInfo.rating': -1 });
userSchema.index({ status: 1 });

// Virtual for full name
userSchema.virtual('profile.fullName').get(function() {
  return this.profile.firstName;
});

// Virtual for display name (business name for vendors, first name for others)
userSchema.virtual('displayName').get(function() {
  if (this.role === 'vendor' && this.profile.businessName) {
    return this.profile.businessName;
  }
  return this.profile.firstName;
});

// Method to update rating (for vendors)
userSchema.methods.updateRating = function(newRating) {
  if (this.role !== 'vendor') return;
  
  const totalRating = (this.vendorInfo.rating * this.vendorInfo.reviewCount) + newRating;
  this.vendorInfo.reviewCount += 1;
  this.vendorInfo.rating = totalRating / this.vendorInfo.reviewCount;
  
  return this.save();
};

// Method to check if user is vendor
userSchema.methods.isVendor = function() {
  return this.role === 'vendor';
};

// Method to check if user is customer
userSchema.methods.isCustomer = function() {
  return this.role === 'customer';
};

// Method to check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Static method to find vendors by location
userSchema.statics.findVendorsByLocation = function(coordinates, maxDistance = 10000) {
  return this.find({
    role: 'vendor',
    status: 'active',
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    }
  });
};

// Static method to find top rated vendors
userSchema.statics.findTopRatedVendors = function(limit = 10) {
  return this.find({
    role: 'vendor',
    status: 'active',
    'vendorInfo.verified': true
  })
  .sort({ 'vendorInfo.rating': -1, 'vendorInfo.reviewCount': -1 })
  .limit(limit);
};

// Pre-save middleware
userSchema.pre('save', function(next) {
  // Update lastLogin when user logs in
  if (this.isModified('loginCount')) {
    this.lastLogin = new Date();
  }
  
  // Ensure vendorInfo is null for non-vendors
  if (this.role !== 'vendor') {
    this.vendorInfo = {
      verified: false,
      rating: 0,
      reviewCount: 0
    };
  }
  
  // Ensure businessName is null for non-vendors
  if (this.role !== 'vendor') {
    this.profile.businessName = undefined;
  }
  
  next();
});

// Pre-validate middleware
userSchema.pre('validate', function(next) {
  // Auto-format phone number
  if (this.phone && !this.phone.startsWith('+91-')) {
    // If phone is just 10 digits, add +91- prefix
    if (/^[0-9]{10}$/.test(this.phone)) {
      this.phone = `+91-${this.phone}`;
    }
  }
  
  next();
});


const User=mongoose.model("User",userSchema);
export default User;