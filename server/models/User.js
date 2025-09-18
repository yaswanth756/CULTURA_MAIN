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
      businessName:{ type: String, trim: true, maxlength: 100 },
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
      verified:    { type: Boolean, default: false },
      rating:      { type: Number, min: 0, max: 5, default: 0 },
      reviewCount: { type: Number, min: 0, default: 0 }
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
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }],

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
  delete ret.__v;                            // always hide

  if (ret.role === "customer") {
    // whitelist: expose only these keys
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
      createdAt:  ret.createdAt
    };
  }

  // vendors/admins → full object (or add similar whitelists later)
  return ret;
}

/*────────────────────  INDEXES  ────────────────────*/
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ "location.coordinates": "2dsphere" });
userSchema.index({ "vendorInfo.rating": -1 });
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

/*────────────────────  INSTANCE METHODS  ────────────────────*/
userSchema.methods.updateRating = function (newRating) {
  if (this.role !== "vendor") return;
  const total = this.vendorInfo.rating * this.vendorInfo.reviewCount + newRating;
  this.vendorInfo.reviewCount += 1;
  this.vendorInfo.rating = total / this.vendorInfo.reviewCount;
  return this.save();
};
userSchema.methods.isVendor    = function () { return this.role === "vendor";   };
userSchema.methods.isCustomer  = function () { return this.role === "customer"; };
userSchema.methods.isAdmin     = function () { return this.role === "admin";    };

/*────────────────────  STATIC METHODS  ────────────────────*/
userSchema.statics.findVendorsByLocation = function (coords, max=10_000) {
  return this.find({
    role: "vendor",
    status: "active",
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

/*────────────────────  HOOKS  ────────────────────*/
userSchema.pre("save", function (next) {
  if (this.isModified("loginCount")) this.lastLogin = new Date();

  if (this.role !== "vendor") {
    this.vendorInfo = { verified: false, rating: 0, reviewCount: 0 };
    this.profile.businessName = undefined;
  }
  next();
});

userSchema.pre("validate", function (next) {
  if (this.phone && !this.phone.startsWith("+91-") && /^[0-9]{10}$/.test(this.phone)) {
    this.phone = `+91-${this.phone}`;
  }
  next();
});

/*────────────────────  EXPORT  ────────────────────*/
export default mongoose.model("User", userSchema);
