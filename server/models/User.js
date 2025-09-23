import mongoose from "mongoose";

/*────────────────────  SCHEMA  ────────────────────*/
const userSchema = new mongoose.Schema(
  {
    /*──────── core identity ────────*/
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"]
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: [/^\+91-[0-9]{10}$/, "Use +91-1234567890"]
    },
    role: {
      type: String,
      enum: ["vendor", "customer", "admin"],
      default: "customer",
      required: true
    },

    /*──────── profile ────────*/
    profile: {
      firstName:   { type: String, required: true, trim: true, maxlength: 30 },
      businessName:{ type: String, trim: true, maxlength: 100 }, // Required for vendors
      avatar:      { type: String, default: "" }
    },

    /*──────── geo & address ────────*/
    location: {
      city:    { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      coordinates: {
        type: [Number],   // [lng, lat]
        validate: {
          validator: v =>
            v.length === 2 &&
            v[0] >= -180 && v[0] <= 180 &&
            v[1] >=  -90 && v[1] <=  90,
          message: "Coordinates must be [lng, lat]"
        }
      }
    },

    /*──────── vendor-specific ────────*/
    vendorInfo: {
      verified:       { type: Boolean, default: false },
      rating:         { type: Number, min: 0, max: 5, default: 0 },
      reviewCount:    { type: Number, min: 0, default: 0 },
      
      // 🔥 NEW: Services they plan to list
      services: [{
        type: String,
        
      }],
      
      // 🔥 NEW: Onboarding completion status
      onboardingCompleted: { type: Boolean, default: false },
      
      // 🔥 NEW: Verification timestamps
      submittedAt:    { type: Date },
      verifiedAt:     { type: Date },
      rejectedAt:     { type: Date },
      rejectionReason: { type: String, trim: true }
    },

    status: { type: String, enum: ["active","inactive","suspended"], default: "active" },

    /*──────── prefs & relations ────────*/
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms:   { type: Boolean, default: true },
        push:  { type: Boolean, default: true }
      }
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],

    /*──────── analytics ────────*/
    lastLogin:  Date,
    loginCount: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true, transform },
    toObject: { virtuals: true }
  }
);

/*────────────────────  ROLE-AWARE JSON TRANSFORM  ────────────────────*/
function transform(doc, ret) {
  delete ret.__v;

  if (ret.role === "customer") {
    return {
      _id:        ret._id,
      email:      ret.email,
      phone:      ret.phone,
      role:       ret.role,
      firstName:  ret.profile?.firstName || "",
      avatar:     ret.profile?.avatar    || "",
      favorites:  ret.favorites,
      status:     ret.status,
      lastLogin:  ret.lastLogin,
      createdAt:  ret.createdAt,
      location:   ret.location
    };
  }

  // 🔥 UPDATED: Enhanced vendor response
  if (ret.role === "vendor") {
    return {
      _id:          ret._id,
      email:        ret.email,
      phone:        ret.phone,
      role:         ret.role,
      profile:      ret.profile,
      location:     ret.location,
      vendorInfo:   ret.vendorInfo,
      status:       ret.status,
      lastLogin:    ret.lastLogin,
      createdAt:    ret.createdAt,
      updatedAt:    ret.updatedAt
    };
  }

  return ret; // admin → full object
}

/*────────────────────  INDEXES  ────────────────────*/
userSchema.index({ role: 1 });
userSchema.index({ "location.coordinates": "2dsphere" });
userSchema.index({ "vendorInfo.rating": -1 });
userSchema.index({ "vendorInfo.verified": 1 }); // 🔥 NEW: For filtering verified vendors
userSchema.index({ "vendorInfo.services": 1 });  // 🔥 NEW: For service-based search
userSchema.index({ status: 1 });

/*────────────────────  VIRTUALS  ────────────────────*/
userSchema.virtual("profile.fullName").get(function () {
  return this.profile.firstName;
});

userSchema.virtual("displayName").get(function () {
  return this.role === "vendor" && this.profile.businessName
    ? this.profile.businessName
    : this.profile.firstName;
});

// 🔥 NEW: Verification status virtual
userSchema.virtual("vendorInfo.verificationStatus").get(function () {
  if (this.role !== "vendor") return null;
  
  if (this.vendorInfo.verifiedAt) return "verified";
  if (this.vendorInfo.rejectedAt) return "rejected";
  if (this.vendorInfo.submittedAt) return "pending";
  if (this.vendorInfo.onboardingCompleted) return "ready_to_submit";
  return "incomplete";
});

/*────────────────────  INSTANCE METHODS  ────────────────────*/
userSchema.methods.updateRating = function (newRating) {
  if (this.role !== "vendor") return;
  const total = this.vendorInfo.rating * this.vendorInfo.reviewCount + newRating;
  this.vendorInfo.reviewCount += 1;
  this.vendorInfo.rating = total / this.vendorInfo.reviewCount;
  return this.save();
};

// 🔥 NEW: Vendor verification methods
userSchema.methods.submitForVerification = function () {
  if (this.role !== "vendor" || !this.vendorInfo.onboardingCompleted) return false;
  
  this.vendorInfo.submittedAt = new Date();
  this.vendorInfo.rejectedAt = null;
  this.vendorInfo.rejectionReason = null;
  return this.save();
};

userSchema.methods.approveVendor = function () {
  if (this.role !== "vendor") return false;
  
  this.vendorInfo.verified = true;
  this.vendorInfo.verifiedAt = new Date();
  this.vendorInfo.rejectedAt = null;
  this.vendorInfo.rejectionReason = null;
  return this.save();
};

userSchema.methods.rejectVendor = function (reason) {
  if (this.role !== "vendor") return false;
  
  this.vendorInfo.verified = false;
  this.vendorInfo.verifiedAt = null;
  this.vendorInfo.rejectedAt = new Date();
  this.vendorInfo.rejectionReason = reason;
  return this.save();
};

// 🔥 NEW: Check if vendor can access features
userSchema.methods.canAccessFeature = function (feature) {
  if (this.role !== "vendor") return false;
  
  // Profile always accessible
  if (feature === "profile") return true;
  
  // Other features only for verified vendors
  return this.vendorInfo.verified === true;
};

userSchema.methods.isVendor    = function () { return this.role === "vendor";   };
userSchema.methods.isCustomer  = function () { return this.role === "customer"; };
userSchema.methods.isAdmin     = function () { return this.role === "admin";    };

/*────────────────────  STATIC METHODS  ────────────────────*/
userSchema.statics.findVendorsByLocation = function (coords, max=10_000) {
  return this.find({
    role: "vendor",
    status: "active",
    "vendorInfo.verified": true, // 🔥 UPDATED: Only verified vendors
    "location.coordinates": {
      $near: { $geometry: { type: "Point", coordinates: coords }, $maxDistance: max }
    }
  });
};

userSchema.statics.findTopRatedVendors = function (limit=10) {
  return this.find({
    role: "vendor",
    status: "active",
    "vendorInfo.verified": true
  })
    .sort({ "vendorInfo.rating": -1, "vendorInfo.reviewCount": -1 })
    .limit(limit);
};

// 🔥 NEW: Find vendors by service
userSchema.statics.findVendorsByService = function (service, limit=20) {
  return this.find({
    role: "vendor",
    status: "active",
    "vendorInfo.verified": true,
    "vendorInfo.services": service
  })
    .sort({ "vendorInfo.rating": -1 })
    .limit(limit);
};

// 🔥 NEW: Admin methods for vendor management
userSchema.statics.findPendingVendors = function () {
  return this.find({
    role: "vendor",
    "vendorInfo.submittedAt": { $exists: true },
    "vendorInfo.verifiedAt": { $exists: false },
    "vendorInfo.rejectedAt": { $exists: false }
  })
    .sort({ "vendorInfo.submittedAt": 1 });
};

/*────────────────────  HOOKS  ────────────────────*/
userSchema.pre("save", function (next) {
  if (this.isModified("loginCount")) this.lastLogin = new Date();

  // 🔥 UPDATED: Enhanced vendor-specific logic
  if (this.role !== "vendor") {
    this.vendorInfo = { 
      verified: false, 
      rating: 0, 
      reviewCount: 0,
      services: [],
      onboardingCompleted: false
    };
    this.profile.businessName = undefined;
  } else {
    // 🔥 NEW: Check if vendor onboarding is complete
    const requiredFields = [
      this.profile.firstName,
      this.profile.businessName,
      this.location.city,
      this.location.address,
      this.vendorInfo.services && this.vendorInfo.services.length > 0
    ];
    
    this.vendorInfo.onboardingCompleted = requiredFields.every(field => field);
  }
  
  next();
});

userSchema.pre("validate", function (next) {
  if (this.phone && !this.phone.startsWith("+91-") && /^[0-9]{10}$/.test(this.phone)) {
    this.phone = `+91-${this.phone}`;
  }
  
  // 🔥 NEW: Validate vendor-specific fields
  if (this.role === "vendor" && this.vendorInfo.onboardingCompleted) {
    if (!this.profile.businessName) {
      return next(new Error("Business name is required for vendors"));
    }
    if (!this.vendorInfo.services || this.vendorInfo.services.length === 0) {
      return next(new Error("At least one service is required for vendors"));
    }
  }
  
  next();
});

/*────────────────────  EXPORT  ────────────────────*/
export default mongoose.model("User", userSchema);
