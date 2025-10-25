import User from "../../models/User.js";
import jwt from 'jsonwebtoken';
import { sendUserOTP } from '../../utils/emailService.js';
import { OAuth2Client } from 'google-auth-library'; // 🔥 NEW: Google OAuth

// 🔥 NEW: Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ================== OTP STORAGE ==================
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate JWT token
const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
});

// ================== STEP 1: SEND OTP users==================
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    const isExistingUser = !!existingUser;

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    console.log('User OTP:', otp);

    otpStore.set(email.toLowerCase(), { otp, expiry: otpExpiry, isExistingUser, attempts: 0 });

    // 🔥 Send user OTP with proper type
   //await sendUserOTP(email, otp, isExistingUser ? 'login' : 'signup');
console.log('User OTP:', otp);
    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      isExistingUser,
      email: email.toLowerCase()
    });
  } catch (error) {
    console.error('Send User OTP Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
};


// ================== STEP 2: VERIFY OTP ==================
export const verifyOTPAndAuth = async (req, res) => {
  try {
    const { email, otp, firstName, phone } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const emailLower = email.toLowerCase();
    const storedOTPData = otpStore.get(emailLower);
    if (!storedOTPData) {
      return res.status(400).json({ success: false, message: 'OTP not found or expired' });
    }

    if (new Date() > storedOTPData.expiry) {
      otpStore.delete(emailLower);
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    if (storedOTPData.attempts >= 3) {
      otpStore.delete(emailLower);
      return res.status(400).json({ success: false, message: 'Too many incorrect attempts. Please request a new OTP.' });
    }

    if (storedOTPData.otp !== otp) {
      storedOTPData.attempts += 1;
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    otpStore.delete(emailLower);

    let user;
    if (storedOTPData.isExistingUser) {
      user = await User.findOne({ email: emailLower });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      user.loginCount += 1;
      await user.save();
    } else {
      if (!firstName) {
        return res.status(400).json({ success: false, message: 'First name is required for signup' });
      }

      if (phone && !/^\+91-[0-9]{10}$/.test(phone) && !/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid phone number' });
      }

      user = new User({
        email: emailLower,
        phone: phone || `+91-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        role: 'customer',
        profile: { firstName: firstName.trim() },
        location: { city: 'Not specified', address: 'Not specified' },
        status: 'active',
        loginCount: 1
      });

      await user.save();
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: storedOTPData.isExistingUser ? 'Login successful' : 'Account created successfully',
      user: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile: user.profile,
        location: user.location,
        status: user.status,
        createdAt: user.createdAt
      },
      token,
      isNewUser: !storedOTPData.isExistingUser
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({ success: false, message: 'Authentication failed. Please try again.' });
  }
};

// export const resendOTP = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required' });
//     }

//     const emailLower = email.toLowerCase();
//     const existingOTPData = otpStore.get(emailLower);

//     // Prevent spam: allow resend only after 2 minutes
//     if (
//       existingOTPData &&
//       new Date() < new Date(existingOTPData.expiry.getTime() - 8 * 60 * 1000)
//     ) {
//       return res
//         .status(400)
//         .json({ success: false, message: 'Please wait before requesting a new OTP' });
//     }

//     const existingUser = await User.findOne({ email: emailLower });
//     const isExistingUser = !!existingUser;

//     const otp = generateOTP();
//     const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

//     otpStore.set(emailLower, {
//       otp,
//       expiry: otpExpiry,
//       isExistingUser,
//       attempts: 0,
//     });

//     await sendOTPEmail(email, otp, isExistingUser ? 'login' : 'signup');

//     return res.status(200).json({
//       success: true,
//       message: 'New OTP sent successfully',
//       isExistingUser,
//       email: emailLower,
//     });
//   } catch (error) {
//     console.error('Resend OTP Error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to resend OTP. Please try again.',
//     });
//   }
// };


// Update User Profile Controller
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { firstName, email, phone, avatar, location } = req.body;

    // Validate required fields
    if (!firstName || !email) {
      return res.status(400).json({
        success: false,
        message: "First name and email are required"
      });
    }

    // Prepare update object with only allowed fields
    const updateData = {
      firstName: firstName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      avatar: avatar ? avatar.trim() : "",
      location: {
        city: location?.city ? location.city.trim() : "Not specified",
        address: location?.address ? location.address.trim() : "Not specified"
      }
    };

    // Check if email already exists for another user
    if (email) {
      const existingUser = await User.findOne({ 
        email: updateData.email, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists"
        });
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { 
        new: true, // Return updated document
        runValidators: true // Run mongoose schema validators
      }
    ).select('-__v'); // Exclude version field

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });

  } catch (error) {
    console.error("Update profile error:", error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get User Profile Controller (existing)
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id); // keep as doc, not .lean()
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



export const getUserFavorites = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Convert ObjectIds to strings
    const favorites = (req.user.favorites || []).map(fav => fav.toString());
    

    return res.status(200).json({
      success: true,
      data: favorites,
    });
  } catch (err) {
    console.error("getUserFavorites error →", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Toggle favorite for a user
export const toggleFavorites = async (req, res) => {
  try {
    if (!req.user) return res.status(404).json({ message: "User not found" });

    const { listingId } = req.body;
    if (!listingId) return res.status(400).json({ message: "listingId is required" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Toggle: remove if exists, add if not
    const index = user.favorites.findIndex(fav => fav.toString() === listingId);
    if (index > -1) {
      user.favorites.splice(index, 1); // remove
    } else {
      user.favorites.push(listingId); // add
    }

    await user.save(); // save changes

    // No return data needed, just status
    res.sendStatus(200);
  } catch (err) {
    console.error("toggleFavorites error →", err);
    res.sendStatus(500);
  }
};

export const getUserFavoritesProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(404).json({ message: "User not found" });

    // 🚀 OPTIMIZED: Use aggregation pipeline instead of populate
    const result = await User.aggregate([
      { $match: { _id: req.user._id } },
      { $project: { favorites: 1 } },
      { $unwind: { path: '$favorites', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'listings',
          let: { favoriteId: '$favorites' },
          pipeline: [
            { 
              $match: { 
                $expr: { $eq: ['$_id', '$$favoriteId'] },
                status: 'active' 
              } 
            },
            {
              $lookup: {
                from: 'users',
                let: { vendorId: '$vendorId' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$vendorId'] } } },
                  { 
                    $project: { 
                      'profile.firstName': 1,
                      'profile.businessName': 1,
                      'vendorInfo.verified': 1,
                      'vendorInfo.rating': 1
                    } 
                  }
                ],
                as: 'vendor'
              }
            },
            {
              $project: {
                title: 1,
                category: 1,
                'price.base': 1,
                'price.type': 1,
                'ratings.average': 1,
                'ratings.count': 1,
                images: { $slice: ['$images', 1] }, // Only first image
                vendor: { $arrayElemAt: ['$vendor', 0] }
              }
            }
          ],
          as: 'listing'
        }
      },
      { $unwind: { path: '$listing', preserveNullAndEmptyArrays: true } },
      { $match: { listing: { $ne: null } } }, // Remove null listings
      {
        $group: {
          _id: '$_id',
          favorites: { $push: '$listing' }
        }
      }
    ]);

    const favorites = result[0]?.favorites || [];

    // 🚀 Format for frontend (simplified)
    const formattedFavorites = favorites.map(listing => ({
      id: listing._id,
      title: listing.title,
      category: listing.category,
      price: listing.price?.base || 0,
      priceType: listing.price?.type || 'fixed',
      rating: listing.ratings?.average || 0,
      reviews: listing.ratings?.count || 0,
      image: listing.images?.[0] || null,
      vendor: {
        name: listing.vendor?.profile?.businessName || 
               listing.vendor?.profile?.firstName || 
               'Unknown',
        verified: listing.vendor?.vendorInfo?.verified || false,
        rating: listing.vendor?.vendorInfo?.rating || 0
      }
    }));

    res.status(200).json({
      success: true,
      data: {
        favorites: formattedFavorites,
        count: formattedFavorites.length
      }
    });

  } catch (err) {
    console.error("getUserFavoritesProfile error →", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch favorites" 
    });
  }
};

// 🔥 NEW: Google OAuth Login
export const googleAuth = async (req, res) => {
  try {
    const { email, name, picture, googleId } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and Google ID are required' 
      });
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Existing user - just login
      user.loginCount += 1;
      
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
      }
      
      // Update avatar if not set and Google provides one
      if (!user.profile.avatar && picture) {
        user.profile.avatar = picture;
      }
      
      await user.save();
    } else {
      // New user - create account
      const [firstName, ...lastNameParts] = name.split(' ');
      
      user = new User({
        email: email.toLowerCase(),
        phone: `+91-${Math.floor(1000000000 + Math.random() * 9000000000)}`, // Temporary phone
        role: 'customer',
        profile: { 
          firstName: firstName || name,
          avatar: picture || ''
        },
        location: { city: 'Not specified', address: 'Not specified' },
        status: 'active',
        loginCount: 1,
        googleId: googleId // Store Google ID for future reference
      });

      await user.save();
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: user.loginCount === 1 ? 'Account created successfully' : 'Login successful',
      user: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile: user.profile,
        location: user.location,
        status: user.status,
        createdAt: user.createdAt
      },
      token,
      isNewUser: user.loginCount === 1
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to authenticate with Google. Please try again.' 
    });
  }
};









