import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  User
} from 'lucide-react';

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

  // Redirect if no booking data
  useEffect(() => {
    if (!bookingData) {
      navigate('/browse', { replace: true });
    }
  }, [bookingData, navigate]);

  // Countdown and redirect after success
  useEffect(() => {
    let timer;
    if (isSuccess && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isSuccess && countdown === 0) {
      navigate('/');
    }
    return () => clearTimeout(timer);
  }, [isSuccess, countdown, navigate]);

  // Create booking API call
  // Create booking API call
const createBooking = async () => {
  try {
    const bookingPayload = {
      customerId: user._id,
      vendorId: bookingData.vendorId,
      listingId: bookingData.listingId,
      serviceDate: bookingData.eventDate,
      location: {
        address: bookingData.location
      },
      pricing: {
        baseAmount: bookingData.amount,
        depositeAmount: bookingData.depositAmount || Math.floor((bookingData.amount || 0) * 0.1), // 10% of base amount
        currency: "INR"
      }
    };

    const response = await axios.post(
      "http://localhost:3000/api/bookings/createnew",
      bookingPayload,
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    return response.data.data.booking;
  } catch (error) {
    console.error('Booking creation error:', error);
    throw error;
  }
};


  // Handle booking confirmation
  const handleSecurePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      // Create booking
      const booking = await createBooking();
      setBookingDetails(booking);

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsProcessing(false);
      setIsSuccess(true);
    } catch (error) {
      setIsProcessing(false);
      setError(error.message || 'Booking failed. Please try again.');
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Invalid Booking</h2>
          <button 
            onClick={() => navigate('/browse')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
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
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle2 className="w-12 h-12 text-green-500 animate-bounce" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-ping opacity-75"></div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-2">Your request has been submitted successfully</p>
          
          {bookingDetails && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 font-mono text-sm">
                Booking ID: {bookingDetails.bookingNumber}
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 font-medium">📞 We will contact you within 1 hour</p>
            <p className="text-blue-600 text-sm mt-1">Our team will reach out to confirm details and discuss pricing</p>
          </div>

          <div className="text-sm text-gray-500">
            Redirecting to home in <span className="font-bold text-blue-500">{countdown}</span> seconds...
          </div>

          <button 
            onClick={() => navigate('/')}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Home Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Confirm Booking</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Booking Form */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Confirm Your Booking</h1>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Booking Info */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">Free Booking Request</span>
              </div>
              <p className="text-blue-600 text-sm">
                No payment required now. We'll contact you to discuss pricing and finalize details.
              </p>
            </div>

            {/* Confirm Booking Button */}
            <form onSubmit={handleSecurePayment}>
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Confirm Booking Request
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">{bookingData.serviceTitle || 'Photography Service'}</h3>
                <p className="text-sm text-gray-600">{bookingData.vendorName || 'Professional Vendor'}</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{bookingData.eventDate ? new Date(bookingData.eventDate).toDateString() : 'Dec 25, 2025'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{bookingData.location || 'Event Location'}</span>
              </div>

              <div className="border-t pt-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 font-medium">Estimated Service Fee</p>
                  <p className="text-lg font-semibold text-gray-900">₹{bookingData.amount?.toLocaleString() || '10,000'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Final pricing will be discussed and confirmed by vendor
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Free Booking Request</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  No payment required to submit booking request
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
