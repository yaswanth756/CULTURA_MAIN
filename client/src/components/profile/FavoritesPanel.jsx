// FavoritesPanel.jsx - RESPONSIVE OPTIMIZED
import React, { useState, useEffect, useMemo } from "react";
import { Star, Heart, Loader2, XCircle, ShieldCheck } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

import { buildApiUrl } from "../../utils/api";
const API_BASE = buildApiUrl("/api");

const SkeletonCard = ({ delay = 0 }) => (
  <div
    className="bg-white rounded-xl sm:rounded-2xl shadow-sm border overflow-hidden"
    data-aos="fade-up"
    data-aos-delay={delay}
  >
    <div className="w-full h-40 sm:h-48 bg-gray-100 animate-pulse" />
    <div className="p-4 sm:p-6 space-y-3">
      <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
      <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
      <div className="flex justify-between items-center">
        <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="h-9 w-full bg-gray-100 rounded-xl animate-pulse" />
    </div>
  </div>
);

const FavoritesPanel = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingIds, setRemovingIds] = useState(new Set());

  const favoritesCount = useMemo(
    () => (Array.isArray(favorites) ? favorites.length : 0),
    [favorites]
  );

  const fetchFavorites = async () => {
    if (!user?._id) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE}/auth/getuserfavoritesProfile`);
      if (response?.data?.success) {
        setFavorites(response.data.data?.favorites || []);
      } else {
        setFavorites([]);
        setError("Failed to load favorites");
      }
    } catch (err) {
      console.error("Fetch favorites error:", err);
      setFavorites([]);
      setError(err?.response?.data?.message || "Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user?._id]);

  const handleRemoveFavorite = async (favoriteId) => {
    const original = favorites;

    try {
      setRemovingIds((prev) => new Set([...prev, favoriteId]));
      setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));

      const resp = await axios.post(`${API_BASE}/auth/favoritetoggle`, {
        listingId: favoriteId,
      });

      if (resp.status !== 200) {
        setFavorites(original);
        alert("Failed to remove from favorites. Please try again.");
      }
    } catch (error) {
      console.error("Remove favorite error:", error);
      setFavorites(original);
      alert("Failed to remove from favorites. Please try again.");
    } finally {
      setRemovingIds((prev) => {
        const s = new Set(prev);
        s.delete(favoriteId);
        return s;
      });
    }
  };

  const formatPrice = (price, priceType) => {
    if (!price && price !== 0) return "Contact for price";
    const formatted = `₹${Number(price).toLocaleString()}`;
    switch (priceType) {
      case "per_person":
        return `${formatted}/person`;
      case "per_day":
        return `${formatted}/day`;
      case "per_hour":
        return `${formatted}/hour`;
      case "per_event":
        return `${formatted}/event`;
      default:
        return formatted;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">Saved vendors</h2>
          <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-gray-600">
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            <span>Loading your favorites...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} delay={i * 60} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
        <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-sm border text-center" data-aos="fade-up">
          <XCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">Error loading favorites</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchFavorites}
            className="bg-gray-900 text-white px-5 sm:px-6 py-2.5 sm:py-3 min-h-[44px] rounded-xl hover:bg-gray-800 transition-colors text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-aos="fade-up" className="max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">Saved vendors</h2>
        <p className="text-sm sm:text-base text-gray-600">
          {favoritesCount} saved vendor{favoritesCount !== 1 ? "s" : ""}
        </p>
      </div>

      {favoritesCount > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {favorites.map((vendor, idx) => {
            const isRemoving = removingIds.has(vendor.id);
            return (
              <div
                key={vendor.id || idx}
                className="group bg-white rounded-xl sm:rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-all duration-200"
                data-aos="fade-up"
                data-aos-delay={Math.min(idx * 60, 360)}
              >
                <div className="relative">
                  <img
                    src={
                      vendor.image ||
                      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop"
                    }
                    alt={vendor.title || "Vendor"}
                    className="w-full h-40 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  {/* Top-right favorite button */}
                  <button
  onClick={() => handleRemoveFavorite(vendor.id)}
  disabled={isRemoving}
  className="
    absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-10
    size-11 sm:size-9             /* ensures equal width/height and perfect circle */
    bg-white/90 backdrop-blur-md
    rounded-full flex items-center justify-center
    hover:bg-white transition
    disabled:opacity-60 disabled:cursor-not-allowed
    ring-1 ring-black/10 shadow-sm shadow-black/10
    active:scale-95               /* gives tap animation */
  "
  title="Remove from favorites"
>
  {isRemoving ? (
    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
  ) : (
    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
  )}
</button>


                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2">
                    <h3 className="font-semibold text-sm sm:text-base lg:text-[17px] text-gray-900 line-clamp-2">
                      {vendor.title || "Untitled Service"}
                    </h3>
                    {vendor.vendor?.verified && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs whitespace-nowrap flex-shrink-0">
                        <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline">Verified</span>
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-xs sm:text-sm capitalize mb-3">
                    {vendor.category || "general"}
                  </p>

                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium text-sm sm:text-base">
                        {vendor.rating > 0 ? Number(vendor.rating).toFixed(1) : "New"}
                      </span>
                      {vendor.reviews > 0 && (
                        <span className="text-gray-500 text-xs sm:text-sm">({vendor.reviews})</span>
                      )}
                    </div>
                    <div className="font-semibold text-right text-xs sm:text-sm lg:text-base">
                      {formatPrice(vendor.price, vendor.priceType)}
                    </div>
                  </div>

                  {vendor.vendor?.name && (
                    <p className="text-gray-500 text-xs sm:text-sm mb-4 truncate">by {vendor.vendor.name}</p>
                  )}

                  <button
                    onClick={() => (window.location.href = `/listing/${vendor.id}`)}
                    className="w-full bg-gray-900 text-white py-2 sm:py-2.5 min-h-[40px] sm:min-h-[44px] px-4 rounded-xl hover:bg-black transition-colors text-sm sm:text-base"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-sm border text-center"
          data-aos="fade-up"
          data-aos-delay="120"
        >
          <Heart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg sm:text-xl font-semibold mb-2">No saved vendors yet</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Start exploring and save your favorite vendors for easy access
          </p>
          <button
            onClick={() => (window.location.href = "/browse")}
            className="bg-gray-900 text-white px-5 sm:px-6 py-2.5 sm:py-3 min-h-[44px] rounded-xl hover:bg-black transition-colors text-sm sm:text-base"
          >
            Browse Vendors
          </button>
        </div>
      )}
    </div>
  );
};

export default FavoritesPanel;
