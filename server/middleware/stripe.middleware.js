/* middleware/stripe.middleware.js */
import Stripe from 'stripe';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Rate limiting for payment endpoints
export const paymentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 payment attempts per 15 minutes
  message: {
    error: 'Too many payment attempts. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Webhook rate limiting (more restrictive)
export const webhookRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute  
  max: 100, // max 100 webhook calls per minute
  message: { error: 'Webhook rate limit exceeded' },
});

// Security headers
export const paymentSecurity = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Webhook signature verification
export const verifyWebhookSignature = (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !endpointSecret) {
    return res.status(400).json({ 
      error: 'Missing webhook signature or secret' 
    });
  }

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      endpointSecret
    );
    req.stripeEvent = event;
    next();
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ 
      error: 'Webhook signature verification failed',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export { stripe };
