import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Coins, Send, Calendar, MapPin } from 'lucide-react';
import axios from 'axios';
import { buildApiUrl } from '../../utils/api';

const ReviewModal = ({ booking, isOpen, onClose, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    // 🔥 NEW: Success animation states
    const [showSuccess, setShowSuccess] = useState(false);
    const [coinsEarned, setCoinsEarned] = useState(0);
    
    const dialogRef = useRef(null);
    const commentRef = useRef(null);
  
    // Reset form when modal opens/closes
    useEffect(() => {
      if (isOpen) {
        setRating(0);
        setHoverRating(0);
        setComment('');
        setError('');
        setSubmitting(false);
        setShowSuccess(false); // 🔥 NEW
        setCoinsEarned(0); // 🔥 NEW
        
        const timer = setTimeout(() => {
          commentRef.current?.focus();
        }, 300);
        
        return () => clearTimeout(timer);
      }
    }, [isOpen, booking]);
  
    // Handle escape key and focus management
    useEffect(() => {
      if (!isOpen) return;
      
      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && !showSuccess) { // 🔥 Don't close during success
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }, [isOpen, onClose, showSuccess]); // 🔥 Added showSuccess dependency
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!rating) {
        setError('Please select a rating');
        return;
      }
      
      if (!comment.trim() || comment.trim().length < 10) {
        setError('Please write a review (at least 10 characters)');
        return;
      }
      
      try {
        setSubmitting(true);
        setError('');
        
        const reviewData = {
          bookingId: booking.id,
          rating,
          comment: comment.trim()
        };
        
        const response = await axios.post(
          buildApiUrl('/api/reviews/create'),
          reviewData
        );
        
        if (response.data.success) {
          // 🔥 NEW: Show success animation first
          setCoinsEarned(response.data.coinsAwarded || 25);
          setShowSuccess(true);
          
          // 🔥 Wait for success animation, then proceed
          setTimeout(() => {
            onReviewSubmitted(booking.id);
          }, 3000); // 3 seconds to enjoy the success
        }
        
      } catch (err) {
        console.error('Review submission error:', err);
        setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
      } finally {
        setSubmitting(false);
      }
    };
  
    const handleSkip = () => {
      onClose();
    };
  
    if (!isOpen || !booking) return null;
  
    // 🔥 NEW: Success Panel
    const successPanel = (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center py-8"
      >
        {/* Success Icon with Bounce */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.6, times: [0, 0.6, 1] }}
          className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            ✅
          </motion.div>
        </motion.div>
  
        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Review Submitted! 🎉
          </h3>
          <p className="text-gray-600 mb-4">
            Thank you for sharing your experience
          </p>
        </motion.div>
  
        {/* Coins Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Coins className="w-5 h-5 text-amber-600" />
          </motion.div>
          <span className="font-semibold text-amber-700">
            +{coinsEarned} Utsav Coins Earned!
          </span>
        </motion.div>
  
        {/* Next Review Countdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.4 }}
          className="mt-6 text-sm text-gray-500"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Checking for more reviews...</span>
          </div>
        </motion.div>
      </motion.div>
    );
  
    // Main form panel
    const formPanel = (
      <>
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-b">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 id="review-title" className="text-lg font-semibold text-gray-900">
                Rate Your Experience
              </h2>
              <p className="text-sm text-gray-600">
                Help others by sharing your thoughts
              </p>
            </div>
          </div>
  
          {/* Coin reward indicator */}
          <div className="mt-4 flex items-center gap-2 bg-white/60 rounded-full px-3 py-2 w-fit">
            <Coins className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">
              Earn 25 Utsav Coins
            </span>
          </div>
        </div>
  
        {/* Service Details */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 truncate">
                Service Booking #{booking.bookingNumber || ''}
              </h3>
              <p className="text-sm text-gray-600">
                {booking.vendor || 'Vendor'}
              </p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(booking.serviceDate).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              {booking.daysSinceCompletion !== null && (
                <div className="mt-1">
                  {booking.daysSinceCompletion} days ago
                </div>
              )}
            </div>
          </div>
        </div>
  
        {/* Rating Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Your Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                >
                  <Star 
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-sm text-gray-600">
                  {rating === 5 ? 'Excellent!' : 
                   rating === 4 ? 'Very Good' :
                   rating === 3 ? 'Good' :
                   rating === 2 ? 'Fair' : 'Poor'}
                </span>
              )}
            </div>
          </div>
  
          {/* Comment */}
          <div className="mb-6">
            <label 
              htmlFor="review-comment"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Share your experience
            </label>
            <textarea
              ref={commentRef}
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience with this service..."
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-colors"
              maxLength={500}
              disabled={submitting}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                Minimum 10 characters
              </span>
              <span className="text-xs text-gray-400">
                {comment.length}/500
              </span>
            </div>
          </div>
  
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
  
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSkip}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Maybe Later
            </button>
            <button
              type="submit"
              disabled={submitting || !rating || comment.trim().length < 10}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </>
    );
  
    const overlay = (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
            onClick={!showSuccess ? onClose : undefined} // 🔥 Don't close during success
          />
        )}
      </AnimatePresence>
    );
  
    const panel = (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              ref={dialogRef}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="review-title"
            >
              {/* 🔥 Show success animation OR form */}
              {showSuccess ? successPanel : formPanel}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  
    return createPortal(
      <>
        {overlay}
        {panel}
      </>,
      document.body
    );
  };
  

  
export default ReviewModal;
