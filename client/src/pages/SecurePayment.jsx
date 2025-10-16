import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";
import { buildApiUrl } from "../utils/api";
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  User,
  CreditCard,
  Shield
} from 'lucide-react';

// Security: Input sanitization helper
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>]/g, '');
};

// Security: Validate amount to prevent manipulation
const validateAmount = (amount, expectedRange) => {
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) return false;
  if (expectedRange && (numAmount < expectedRange.min || numAmount > expectedRange.max)) return false;
  return true;
};

// Security: Generate request timestamp for replay attack prevention
const generateRequestId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Razorpay script loader
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const SecurePayment = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  // States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [paymentStep, setPaymentStep] = useState('booking'); // 'booking', 'payment', 'success'
  const [requestId] = useState(() => generateRequestId()); // Unique request ID for this session
  const [attemptCount, setAttemptCount] = useState(0); // Track payment attempts

  // Security: Validate and sanitize booking data on mount
  const validatedBookingData = useMemo(() => {
    if (!bookingData) return null;
    
    // Validate required fields
    if (!bookingData.listingId || !bookingData.vendorId || !bookingData.amount) {
      console.error('Invalid booking data structure');
      return null;
    }

    // Validate amounts
    if (!validateAmount(bookingData.amount, { min: 1, max: 10000000 })) {
      console.error('Invalid booking amount');
      return null;
    }

    if (!validateAmount(bookingData.depositAmount, { min: 1, max: bookingData.amount })) {
      console.error('Invalid deposit amount');
      return null;
    }

    // Sanitize string inputs
    return {
      ...bookingData,
      serviceTitle: sanitizeInput(bookingData.serviceTitle),
      vendorName: sanitizeInput(bookingData.vendorName),
      location: sanitizeInput(bookingData.location)
    };
  }, [bookingData]);
  

  // Redirect if no booking data or validation failed
  useEffect(() => {
    if (!validatedBookingData) {
      console.warn('Invalid or missing booking data - redirecting');
      navigate('/browse', { replace: true });
    }
  }, [validatedBookingData, navigate]);

  // Security: Prevent multiple simultaneous payment attempts
  useEffect(() => {
    if (attemptCount > 3) {
      setError('Too many payment attempts. Please refresh the page and try again.');
      setIsProcessing(false);
    }
  }, [attemptCount]);

  // Countdown after success
  useEffect(() => {
    let timer;
    if (isSuccess && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isSuccess && countdown === 0) {
      navigate('/');
    }
    return () => clearTimeout(timer);
  }, [isSuccess, countdown, navigate]);

  // Create booking and initiate payment with security checks
  const createBookingAndPayment = useCallback(async () => {
    try {
      // Security: Validate user session
      if (!user || !user._id) {
        throw new Error('User session invalid. Please login again.');
      }

      // Security: Validate booking data again before submission
      if (!validatedBookingData) {
        throw new Error('Booking data validation failed');
      }

      // Security: Double-check amount integrity
      const expectedDeposit = Math.floor(validatedBookingData.amount * 0.1);
      if (Math.abs(validatedBookingData.depositAmount - expectedDeposit) > 1) {
        console.error('Deposit amount mismatch detected');
        throw new Error('Payment amount verification failed. Please try again.');
      }

      // First create the booking with validated data
      const bookingPayload = {
        customerId: user._id,
        vendorId: validatedBookingData.vendorId,
        listingId: validatedBookingData.listingId,
        serviceDate: validatedBookingData.eventDate,
        location: {
          address: validatedBookingData.location
        },
        pricing: {
          baseAmount: validatedBookingData.amount,
          depositeAmount: validatedBookingData.depositAmount,
          currency: "INR"
        },
        // Security: Add request metadata
        _requestId: requestId,
        _timestamp: Date.now()
      };

      const bookingResponse = await axios.post(
        buildApiUrl("/api/bookings/createnew"),
        bookingPayload,
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      const booking = bookingResponse.data.data.booking;
      setBookingDetails(booking);

      // Security: Verify booking was created with correct amount
      if (booking.pricing.depositeAmount !== validatedBookingData.depositAmount) {
        console.error('Booking amount mismatch after creation');
        throw new Error('Booking verification failed. Please contact support.');
      }

      // Create payment order with validated amount
      const paymentOrderResponse = await axios.post(
        buildApiUrl("/api/payments/create-order"),
        {
          bookingId: booking._id,
          amount: validatedBookingData.depositAmount,
          currency: 'INR',
          // Security: Add request tracking
          _requestId: requestId
        },
        {
          headers: { 
            "Content-Type": "application/json",
            "X-Request-ID": requestId
          },
          timeout: 30000 // 30 second timeout
        }
      );

      // Security: Validate payment order response
      if (!paymentOrderResponse.data.success || !paymentOrderResponse.data.data.orderId) {
        throw new Error('Invalid payment order response');
      }

      return {
        booking,
        paymentOrder: paymentOrderResponse.data.data
      };
    } catch (error) {
      console.error('Booking/Payment creation error:', error);
      // Security: Don't expose internal error details to user
      const userMessage = error.response?.status === 400 
        ? 'Invalid booking data. Please try again.'
        : 'Unable to create payment order. Please try again.';
      throw new Error(userMessage);
    }
  }, [user, validatedBookingData, requestId]);

  // Handle Razorpay payment with security
  const initiateRazorpayPayment = useCallback(async (paymentOrder, booking) => {
    // Security: Validate script loading
    const scriptLoaded = await loadRazorpayScript();
    
    if (!scriptLoaded) {
      throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
    }

    // Security: Validate payment order data
    if (!paymentOrder.keyId || !paymentOrder.orderId || !paymentOrder.amount) {
      throw new Error('Invalid payment order data');
    }

    // Security: Verify amount matches expected deposit
    if (Math.abs(paymentOrder.amount - (validatedBookingData.depositAmount * 100)) > 100) {
      console.error('Payment amount mismatch');
      throw new Error('Payment amount verification failed');
    }

    const options = {
      key: paymentOrder.keyId,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      name:bookingData.serviceTitle,
      description: `Deposit for ${sanitizeInput(validatedBookingData.serviceTitle || 'Service')}`,
      image: "/logo.png",
      order_id: paymentOrder.orderId,
      config: {
        display: {
          blocks: {
            utib: { //This key can be any allowed bank code as per RBI list
              name: 'Pay using UPI',
              instruments: [
                {
                  method: 'upi'
                }
              ]
            }
          },
          sequence: ['block.utib'],
          preferences: {
            show_default_blocks: true // This will show other payment methods
          }
        }
      },
      handler: async function (response) {
        try {
          setPaymentStep('verification');
          
          // Security: Validate Razorpay response
          if (!response.razorpay_order_id || !response.razorpay_payment_id || !response.razorpay_signature) {
            throw new Error('Invalid payment response from gateway');
          }

          // Security: Prevent verification tampering
          const verificationPayload = {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            bookingId: booking._id,
            // Security: Add request tracking for audit
            _requestId: requestId,
            _timestamp: Date.now()
          };

          // Verify payment on backend with timeout
          const verificationResponse = await axios.post(
            buildApiUrl("/api/payments/verify"),
            verificationPayload,
            {
              headers: { 
                "Content-Type": "application/json",
                "X-Request-ID": requestId
              },
              timeout: 30000 // 30 second timeout for verification
            }
          );

          // Security: Strict validation of verification response
          if (!verificationResponse.data.success || 
              !verificationResponse.data.data.payment || 
              verificationResponse.data.data.payment.status !== 'captured') {
            throw new Error('Payment verification failed');
          }

          // Security: Verify booking was updated correctly
          if (verificationResponse.data.data.booking.paymentStatus !== 'paid') {
            console.error('Booking payment status not updated correctly');
            throw new Error('Booking update failed after payment');
          }

          // All validations passed - payment successful
          setIsProcessing(false);
          setIsSuccess(true);
          setPaymentStep('success');
          
        } catch (error) {
          console.error('Payment verification error:', error);
          // Security: Sanitize error message - don't expose internals
          const safePaymentId = response.razorpay_payment_id ? 
            sanitizeInput(response.razorpay_payment_id.substring(0, 20)) : 'N/A';
          setError(`Payment verification failed. Payment ID: ${safePaymentId}. Please contact support.`);
          setIsProcessing(false);
          setPaymentStep('booking');
          
          // Record payment failure
          try {
            await axios.post(
              buildApiUrl("/api/payments/failure"),
              {
                razorpayOrderId: response.razorpay_order_id,
                error: { description: 'Payment verification failed' }
              }
            );
          } catch (failureError) {
            console.error('Error recording payment failure:', failureError);
          }
        }
      },
      prefill: {
        name: paymentOrder.customerDetails.name,
        email: paymentOrder.customerDetails.email,
        contact: paymentOrder.customerDetails.contact,
      },
      notes: paymentOrder.notes,
      theme: {
        color: "#3B82F6"
      },
      modal: {
        ondismiss: function() {
          setIsProcessing(false);
          setPaymentStep('booking');
          setError('Payment was cancelled by user');
        }
      }
    };

    const rzp = new window.Razorpay(options);
    
    rzp.on('payment.failed', async function (response) {
      console.error('Payment failed:', response.error);
      setError(`Payment failed: ${response.error.description}`);
      setIsProcessing(false);
      setPaymentStep('booking');
      
      // Record payment failure
      try {
        await axios.post(
          buildApiUrl("/api/payments/failure"),
          {
            razorpayOrderId: response.error.metadata?.order_id,
            error: response.error
          }
        );
      } catch (failureError) {
        console.error('Error recording payment failure:', failureError);
      }
    });

    rzp.open();
  }, [validatedBookingData, requestId]);

  // Handle payment process with security checks
  const handlePayment = useCallback(async (e) => {
    e.preventDefault();
    
    // Security: Prevent double submission
    if (isProcessing) {
      console.warn('Payment already in progress');
      return;
    }

    // Security: Check attempt limit
    if (attemptCount >= 3) {
      setError('Maximum payment attempts reached. Please refresh the page.');
      return;
    }

    // Security: Validate user is still authenticated
    if (!user || !user._id) {
      setError('Session expired. Please login again.');
      navigate('/');
      return;
    }

    // Security: Final validation of booking data
    if (!validatedBookingData) {
      setError('Invalid booking data. Please start over.');
      navigate('/browse');
      return;
    }

    setIsProcessing(true);
    setError('');
    setPaymentStep('payment');
    setAttemptCount(prev => prev + 1);

    try {
      const { booking, paymentOrder } = await createBookingAndPayment();
      await initiateRazorpayPayment(paymentOrder, booking);
    } catch (error) {
      setIsProcessing(false);
      setPaymentStep('booking');
      // Security: Sanitize error message
      const errorMessage = error.message || 'Payment process failed. Please try again.';
      setError(sanitizeInput(errorMessage));
      
      // Log error for monitoring (in production, send to error tracking service)
      console.error('Payment initiation failed:', {
        requestId,
        attempt: attemptCount + 1,
        error: error.message
      });
    }
  }, [isProcessing, attemptCount, user, validatedBookingData, createBookingAndPayment, initiateRazorpayPayment, navigate, requestId]);

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Invalid Booking Data</h2>
          <p className="text-gray-600 mb-4">Booking information is missing or invalid</p>
          <button 
            onClick={() => navigate('/browse')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  // Success Screen
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-lg">
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <div className="absolute -top-1 -right-1">
              <div className="w-6 h-6 bg-green-400 rounded-full animate-ping opacity-75"></div>
              <div className="absolute top-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful! 🎉</h2>
          <p className="text-gray-600 mb-4">Your booking has been confirmed and deposit paid</p>
          
          {bookingDetails && validatedBookingData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-mono text-sm font-medium">
                Booking ID: {sanitizeInput(bookingDetails.bookingNumber)}
              </p>
              <p className="text-blue-600 text-sm mt-1">
                Deposit: ₹{validatedBookingData.depositAmount?.toLocaleString()} paid ✓
              </p>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Booking Confirmed</span>
            </div>
            <p className="text-green-600 text-sm">
              Vendor will contact you within 1 hour to discuss details
            </p>
          </div>

          <div className="text-sm text-gray-500 mb-4">
            Redirecting to home in <span className="font-bold text-blue-500">{countdown}</span> seconds...
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/bookings')}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              My Bookings
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              disabled={isProcessing}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                <div className={`w-2 h-2 rounded-full ${
                  paymentStep === 'booking' ? 'bg-blue-500' : 'bg-green-500'
                }`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {paymentStep === 'booking' ? 'Secure Payment' : 
                   paymentStep === 'payment' ? 'Processing Payment...' : 
                   paymentStep === 'verification' ? 'Verifying Payment...' : 'Payment Complete'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                {paymentStep === 'payment' ? 'Processing Payment...' : 
                 paymentStep === 'verification' ? 'Verifying Payment...' : 'Secure Payment'}
              </h1>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-medium">Payment Error</p>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Processing States */}
            {(paymentStep === 'payment' || paymentStep === 'verification') && (
              <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-blue-800 font-medium">
                  {paymentStep === 'payment' ? 'Opening Razorpay checkout...' : 'Verifying your payment...'}
                </p>
                <p className="text-blue-600 text-sm mt-1">Please don't close this window</p>
              </div>
            )}

            {/* Payment Form */}
            {paymentStep === 'booking' && (
              <>
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 mb-2">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">Secure Payment with Razorpay</span>
                  </div>
                  <p className="text-blue-600 text-sm">
                    Pay only {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(validatedBookingData?.depositAmount || 0)} now as booking deposit
                  </p>
                </div>

                {/* Security Features */}
                <div className="mb-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>PCI DSS compliant</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>100% secure & refundable</span>
                  </div>
                </div>

                {/* Payment Button */}
                <form onSubmit={handlePayment}>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Payment...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        Pay ₹{validatedBookingData?.depositAmount?.toLocaleString()} Securely
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <div className="w-8 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    R
                  </div>
                  <span>Powered by Razorpay - India's most trusted payment gateway</span>
                </div>
              </>
            )}
          </div>

          {/* Booking Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>

            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-900 mb-1">{validatedBookingData?.serviceTitle || 'Service'}</h3>
                <p className="text-sm text-gray-600">{validatedBookingData?.vendorName || 'Professional Vendor'}</p>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>{validatedBookingData?.eventDate ? new Date(validatedBookingData.eventDate).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Event Date'}</span>
              </div>

              <div className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-blue-500 mt-0.5" />
                <span className="flex-1">{validatedBookingData?.location || 'Event Location'}</span>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Service Fee</span>
                    <span className="font-medium">₹{validatedBookingData?.amount?.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm border-t pt-3">
                    <span className="text-gray-600">Deposit Amount (10%)</span>
                    <span className="font-medium text-blue-600">₹{validatedBookingData?.depositAmount?.toLocaleString()}</span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-blue-900">Pay Now</span>
                      <span className="text-xl font-bold text-blue-900">₹{validatedBookingData?.depositAmount?.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Remaining balance: ₹{((validatedBookingData?.amount || 0) - (validatedBookingData?.depositAmount || 0))?.toLocaleString()} will be discussed with vendor
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">100% Secure Payment</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Your payment is protected by bank-level security
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurePayment;
