import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";


import ListingContent from "../components/ListingDeatilPage/ListingContent";
import { buildApiUrl } from "../utils/api";
import BookingForm from "../components/ListingDeatilPage/BookingForm";
import LoadingDots from "../components/LoadingDots";

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetchedRef = useRef(false);

  // Initialize AOS
  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-in-out", once: true });
  }, []);

  // Fetch listing data
  useEffect(() => {
    const fetchListing = async () => {
      // Prevent double fetching in React StrictMode
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      try {
        setLoading(true);
        const response = await fetch(buildApiUrl(`/api/listings/${id}`));

        if (!response.ok) {
          throw new Error(`Failed to fetch listing: ${response.status}`);
        }

        const data = await response.json();
        setListing(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching listing:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingDots />
      </div>
    );
  }

  // Error state
  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div
          className="text-center max-w-md mx-auto px-4"
          data-aos="fade-up"
        >
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Listing Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "The listing you're looking for doesn't exist."}
            </p>
            <button
              onClick={() => navigate("/listings")}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Listings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT SIDE - Content */}
          <div className="lg:w-2/3" data-aos="fade-right">
            <ListingContent listing={listing} />
          </div>

          {/* RIGHT SIDE - Booking Form */}
          <div className="lg:w-1/3" data-aos="fade-left">
            <BookingForm listing={listing} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;
