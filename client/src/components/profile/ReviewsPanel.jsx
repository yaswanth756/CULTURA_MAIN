import React, { useState } from "react";
import { MessageSquare, Star } from "lucide-react";

// TODO: Replace with API call when backend is ready
const dummyReviews = [
  {
    id: "review_1",
    vendor: "Elegant Event Planners",
    rating: 5,
    title: "Amazing decoration service!",
    review: "The team did an outstanding job with our engagement ceremony. The decoration was exactly what we envisioned and the setup was completed on time. Highly recommended!",
    date: "2024-10-22",
    bookingNumber: "BK-2024089"
  }
];

const ReviewsPanel = () => {
  const [reviews, setReviews] = useState(dummyReviews);
  const [showWriteReview, setShowWriteReview] = useState(false);

  const handleWriteReview = () => {
    // TODO: Open write review modal or navigate to write review page
    alert("Write review feature coming soon!");
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star 
        key={index} 
        className={`w-4 h-4 ${
          index < rating 
            ? "text-yellow-400 fill-yellow-400" 
            : "text-gray-300"
        }`} 
      />
    ));
  };

  return (
    <div data-aos="fade-up" className="max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-semibold text-gray-900">My reviews</h2>
        <button 
          onClick={handleWriteReview}
          className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
        >
          Write Review
        </button>
      </div>
      
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review, idx) => (
            <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm border" data-aos="fade-up" data-aos-delay={idx * 100}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{review.vendor}</h3>
                  <p className="text-gray-600 text-sm">Booking: {review.bookingNumber}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-gray-500 text-sm">{new Date(review.date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <h4 className="font-medium mb-2">{review.title}</h4>
              <p className="text-gray-700 leading-relaxed">{review.review}</p>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Was this helpful?</span>
                  <button className="text-gray-700 hover:text-gray-900">👍 0</button>
                  <button className="text-gray-700 hover:text-gray-900">👎 0</button>
                </div>
                <div className="flex gap-2">
                  <button className="text-gray-600 hover:text-gray-800 text-sm">Edit</button>
                  <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Pagination for more reviews */}
          {reviews.length >= 10 && (
            <div className="flex justify-center pt-6">
              <button className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-50">
                Load More Reviews
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 shadow-sm border text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
          <p className="text-gray-600 mb-6">Share your experience with vendors to help other customers make informed decisions</p>
          <button 
            onClick={handleWriteReview}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800"
          >
            Write your first review
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsPanel;
