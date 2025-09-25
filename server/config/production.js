// Production configuration
export const productionConfig = {
  // Database
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cultura_production',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
    }
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  },

  // Caching
  cache: {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 1000 // max 1000 items in cache
  },

  // Security
  security: {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    },
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }
  },

  // Performance
  performance: {
    compression: true,
    etag: true,
    maxRequestSize: '10mb'
  }
};
