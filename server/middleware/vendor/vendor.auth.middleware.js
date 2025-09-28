// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';

// Simple JWT Authentication middleware  
export const authenticateVendor = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header (Bearer token)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
    


      // Get user from the token
      req.user = await User.findById(decoded.userId).select('-__v');

      // Check if user exists
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user no longer exists'
        });
      }

      // Check if user is a vendor
      if (req.user.role !== 'vendor') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Vendor role required.'
        });
      }

      next(); // User authenticated, proceed
    } else {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

