// components/ReviewButton.jsx
import React from 'react';
import { Star } from 'lucide-react';

const ReviewButton = ({ 
  booking, 
  canReview, 
  hasReview, 
  needsReviewPrompt, 
  onWriteReview 
}) => {
  if (!canReview || hasReview) return null;

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent booking details modal
    onWriteReview(booking);
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-medium hover:bg-orange-200 transition-colors"
    >
      <Star className="w-3 h-3" />
      Review
      {needsReviewPrompt && (
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
      )}
    </button>
  );
};

export default ReviewButton;
