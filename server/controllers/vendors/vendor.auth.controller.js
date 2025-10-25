// controllers/authController.js
import User from '../../models/User.js';
import jwt from 'jsonwebtoken';
import { sendVendorOTP } from '../../utils/emailService.js';
import rateLimit from 'express-rate-limit';

// Temporary OTP storage (in production use Redis)
const otpStore = new Map();

// Helper function to clean up expired OTPs from the store
const cleanExpiredOTPs = () => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email);
    }
  }
};

// Rate limiting for OTP requests
export const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 OTP requests per 15 minutes per IP
  message: { success: false, message: "Too many OTP requests. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Controller 1: Send OTP
// Controller 1: Send OTP vendors
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Basic validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required"
      });
    }

    const emailLower = email.toLowerCase();

    // Check if user exists
    const existingUser = await User.findOne({ email: emailLower });
    
    // Check if user is already a customer
    if (existingUser && existingUser.role === 'customer') {
      return res.status(400).json({
        success: false,
        message: "This email is already registered as a customer. Please try a different email or contact support."
      });
    }

    // Check if user is admin
    if (existingUser && existingUser.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: "This email is not available for vendor registration."
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP temporarily with expiry
    const otpData = {
      otp: otp,
      email: emailLower,
      userType: (existingUser && existingUser.role === 'vendor') ? 'existing' : 'new',
      createdAt: Date.now(),
      expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
    };
    console.log('Vendor OTP:', otp);
    otpStore.set(emailLower, otpData);

    // Clean up expired OTPs
    cleanExpiredOTPs();
    console.log(otp);
    // 🔥 Send vendor OTP with proper type
await sendVendorOTP(emailLower, otp, otpData.userType === 'existing' ? 'login' : 'signup');

    // Response
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      userType: otpData.userType,
      expiresIn: 300 // 5 minutes in seconds
    });

  } catch (error) {
    console.error('Send Vendor OTP error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again."
    });
  }
};

  

// Controller 2: Verify OTP and Handle Login/Signup
export const verifyOTPAndAuth = async (req, res) => {
  try {
    const { email, otp, vendorDetails } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    const emailLower = email.toLowerCase();
    const otpData = otpStore.get(emailLower);

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new one."
      });
    }

    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(emailLower);
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one."
      });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again."
      });
    }

    let user;

    if (otpData.userType === 'existing') {
      // EXISTING VENDOR
      user = await User.findOne({ email: emailLower });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      user.loginCount += 1;
      user.lastLogin = new Date();
      await user.save();

    } else {
      // NEW VENDOR - Enhanced validation
      if (
        !vendorDetails || 
        !vendorDetails.firstName || 
        !vendorDetails.businessName || 
        !vendorDetails.city || 
        !vendorDetails.address || 
        !vendorDetails.services || 
        vendorDetails.services.length === 0 || 
        !vendorDetails.phone
      ) {
        return res.status(400).json({
          success: false,
          message: "All vendor details (including phone) are required for new registration"
        });
      }

      // 🔥 NEW: Validate document uploads
      if (!vendorDetails.panImage || !vendorDetails.aadhaarImage || !vendorDetails.businessRegImage) {
        return res.status(400).json({
          success: false,
          message: "All documents (PAN, Aadhaar, Business Registration) are required"
        });
      }

      // Require terms agreement
      if (req.body.agreedToTerms !== true) {
        return res.status(400).json({
          success: false,
          message: "You must agree to the Terms and Conditions to sign up"
        });
      }

      // Format phone number
      let phone = vendorDetails.phone;
      if (/^\+91\d{10}$/.test(phone)) {
        phone = phone.replace(/^\+91/, "+91-");
      }

      user = new User({
        email: emailLower,
        phone,
        role: "vendor",
        profile: {
          firstName: vendorDetails.firstName,
          businessName: vendorDetails.businessName,
          avatar: vendorDetails.avatar || ""
        },
        location: {
          city: vendorDetails.city,
          address: vendorDetails.address,
          coordinates: vendorDetails.coordinates || []
        },
        vendorInfo: {
          services: vendorDetails.services,
          verified: false,
          rating: 0,
          reviewCount: 0,
          // 🔥 NEW: Save document URLs
          documents: {
            panImage: vendorDetails.panImage,
            aadhaarImage: vendorDetails.aadhaarImage,
            businessRegImage: vendorDetails.businessRegImage,
            uploadedAt: new Date()
          },
          onboardingCompleted: true
        },
        status: 'active',
        agreedToTerms: true,
        loginCount: 1,
        lastLogin: new Date()
      });

      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    otpStore.delete(emailLower);

    res.status(200).json({
      success: true,
      message: otpData.userType === 'existing' ? "Login successful" : "Account created successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        firstName: user.profile.firstName,
        businessName: user.profile.businessName,
        avatar: user.profile.avatar,
        verified: user.vendorInfo.verified,
        onboardingCompleted: user.vendorInfo.onboardingCompleted,
        // 🔥 NEW: Include documents status in response
        documentsUploaded: !!(user.vendorInfo.documents?.panImage && 
                             user.vendorInfo.documents?.aadhaarImage && 
                             user.vendorInfo.documents?.businessRegImage)
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: "Authentication failed. Please try again."
    });
  }
};


  

export const getVendorProfile = async (req, res) => {
    try {
      // req.user is set by the authenticateVendor middleware
      const vendor = req.user;

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor profile not found'
        });
      }
      
     
      // Return vendor profile data
      res.status(200).json({
        success: true,
        data: {
          id: vendor._id,
          email: vendor.email,
          phone: vendor.phone,
          role: vendor.role,
          profile: {
            firstName: vendor.profile.firstName,
            businessName: vendor.profile.businessName,
            avatar: vendor.profile.avatar
          },
          location: vendor.location,
          vendorInfo: {
            verified: vendor.vendorInfo.verified,
            rating: vendor.vendorInfo.rating,
            reviewCount: vendor.vendorInfo.reviewCount,
            services: vendor.vendorInfo.services,
            onboardingCompleted: vendor.vendorInfo.onboardingCompleted,
            // Include verification status for frontend
            verificationStatus: getVerificationStatus(vendor.vendorInfo)
          },
          status: vendor.status,
          lastLogin: vendor.lastLogin,
          createdAt: vendor.createdAt,
          updatedAt: vendor.updatedAt
        }
      });
   
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile'
      });
    }
};
  
  // Helper function to determine verification status for frontend
  const getVerificationStatus = (vendorInfo) => {
    if (vendorInfo.verified) return 'verified';
    if (!vendorInfo.onboardingCompleted) return 'incomplete';
    return 'pending'; // Admin needs to verify
  };