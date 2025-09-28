import express from "express"
import { connectDB } from "./config/database.js"
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import compression from "compression"

// Import routes
import authRoutes from "./routes/users/auth.routes.js"
import listingRoutes from './routes/users/listing.routes.js'
import paymentRoutes from './routes/users/payment.routes.js'
import bookingRoutes from './routes/users/booking.routes.js'
import reviewRoutes from './routes/users/review.routes.js'

import vendorAuthRoutes from "./routes/vendor/vendor.auth.routes.js"
import vendorListingRoutes from "./routes/vendor/vendor.listing.routes.js"
import vendorBookingRoutes from "./routes/vendor/vendor.booking.routes.js"
import vendorEarningRoutes from "./routes/vendor/vendor.earning.routes.js"
import vendorAnalyticsRoutes from "./routes/vendor/vendor.analytics.routes.js"

import { requestTimer } from './utils/requestTimer.js'
import { setupHealthMonitor } from './utils/healthMonitor.js';


import uploadRoutes from "./routes/upload.routes.js"
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Trust proxy (important if using cloud providers like Heroku, AWS, etc.)
app.set('trust proxy', 1)

// Connect to database
connectDB()

// Security Middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,  // Allows embedding if needed
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "img-src": ["'self'", "https: data:"]
        }
    }
}))

// Rate limiting - Basic protection against brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: "Too many requests from this IP, please try again later"
    },
    standardHeaders: true,
    legacyHeaders: false
})

// Apply rate limiting to all routes
app.use(limiter)

// More strict rate limiting for auth routes


// Performance Middleware
app.use(compression()) // Compress responses

// CORS configuration - be more specific than allowing all
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    optionsSuccessStatus: 200
}))

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request timing middleware
//app.use(requestTimer({ dir: 'logs' }))

  

// Apply stricter rate limiting to auth routes
app.use("/api/auth", authRoutes)
app.use("/api/vendor", vendorAuthRoutes)

// Other routes with normal rate limiting
app.use('/api/listings', listingRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/vendor/listings', vendorListingRoutes)
app.use('/api/vendor/bookings', vendorBookingRoutes)
app.use('/api/vendor/earnings', vendorEarningRoutes)
app.use('/api/vendor/analytics', vendorAnalyticsRoutes)


app.use('/api', uploadRoutes);
// Test route
app.get("/test", (req, res) => {
    return res.json({ message: "Server is running properly" })
})

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message)
    
    // Don't leak error details in production
    if (process.env.NODE_ENV === 'production') {
        res.status(500).json({ 
            error: "Something went wrong!" 
        })
    } else {
        res.status(500).json({ 
            error: err.message,
            stack: err.stack 
        })
    }
})


app.listen(PORT, () => {
    console.log(`Server is running on Port: ${PORT} 👍`)
})
