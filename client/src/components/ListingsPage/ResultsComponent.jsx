/* src/components/ResultsComponent.jsx - RESPONSIVE ONLY (Same Design) */
import React, { useMemo } from "react";
import { Search, Star, Heart, MapPin, Camera } from "lucide-react";
import { buildApiUrl } from "../../utils/api";

const API_BASE = buildApiUrl('/api');

const priceTypeLabels = {
  fixed: "",
  per_person: "/ person",
  per_event: "/ event",
  per_day: "/ day",
  per_hour: "/ hour",
};

const categories = [
  { value: "all", label: "All Services" },
  { value: "venues", label: "Venues" },
  { value: "catering", label: "Catering" },
  { value: "cakes", label: "Cakes" },
  { value: "decorations", label: "Decorations" },
  { value: "photography", label: "Photography" },
  { value: "videography", label: "Videography" },
  { value: "music", label: "Music / DJ" },
  { value: "makeup", label: "Make-up" },
  { value: "mandap", label: "Mandap Setup" },
  { value: "hosts", label: "Hosts / Anchors" },
];

const ResultsComponent = ({
  filtersFromUrl,
  displayedVendors,
  favorites,
  onToggleFavorite,
  pagination,
}) => {
  // Memoize favorites for fast lookups
  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  const handleListingClick = async (listingId) => {
    try {
      // Fire and forget - increment view count
      fetch(`${API_BASE}/listings/${listingId}/views`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(err => console.log('View count failed:', err)); // Silent fail
      
      // Open listing in new tab
      window.open(`/listing/${listingId}`, "_blank");
    } catch (error) {
      console.log('Error:', error);
      // Still open the listing even if API fails
      window.open(`/listing/${listingId}`, "_blank");
    }
  };

  const getPageTitle = () => {
    if (filtersFromUrl.vendor) return `Results for "${filtersFromUrl.vendor}"`;
    if (filtersFromUrl.category && filtersFromUrl.category !== "all") {
      const category = categories.find((c) => c.value === filtersFromUrl.category);
      return category ? category.label : "Search Results";
    }
    return "All Services";
  };

  const isFavorited = (id) => favoritesSet.has(id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
        <div className="text-xs sm:text-sm text-gray-500">
          {pagination ? (
            <>
              Showing {displayedVendors.length} of {pagination.totalCount} vendor
              {pagination.totalCount !== 1 ? "s" : ""}
            </>
          ) : (
            <>
              {displayedVendors.length} vendor
              {displayedVendors.length !== 1 ? "s" : ""} found
            </>
          )}
        </div>
      </div>

      {displayedVendors.length === 0 ? (
        <div className="text-center py-12" data-aos="fade-up">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">No vendors found</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4">Try adjusting your search criteria or filters</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {displayedVendors.map((listing, index) => {
            const fav = isFavorited(listing._id);
            const priceLabel =
            listing.formattedPrice ||
              `₹${listing.price?.base?.toLocaleString("en-IN") || "0"}`;

            return (
              <div
                key={listing._id}
                className="group bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm hover:shadow-md hover:ring-anzac-200 transition-all duration-300 overflow-hidden cursor-pointer"
                data-aos="fade-up"
                data-aos-delay={index * 50}
                onClick={()=>handleListingClick(listing._id)}
              >
                {/* Media */}
                <div className="relative h-48 sm:h-48 bg-gray-100 overflow-hidden">
                  {/* Favorite Heart - IMPROVED TOUCH TARGET */}
                  <button
                    type="button"
                    aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                    aria-pressed={fav}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite && onToggleFavorite(listing._id);
                    }}
                    className="absolute top-2 right-2 z-10 inline-flex items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded-full
                               bg-white/85 border border-white/70 shadow-sm backdrop-blur-sm
                               text-gray-700 hover:text-rose-600 hover:scale-105 transition"
                  >
                    <Heart
                      className={`w-5 h-5 ${fav ? "text-rose-600" : ""}`}
                      fill={fav ? "currentColor" : "none"}
                      stroke="currentColor"
                    />
                  </button>

                  {/* Image */}
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title || "Service image"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget.nextSibling;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                  ) : null}

                  {/* Fallback */}
                  <div
                    className="absolute inset-0 bg-gray-100 items-center justify-center flex"
                    style={{ display: listing.images && listing.images.length > 0 ? "none" : "flex" }}
                  >
                    <Camera className="w-10 h-10 text-gray-400" />
                  </div>

                  {/* Bottom Gradient + Price Badge */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute left-2 bottom-2 z-10">
                    <span className="inline-flex items-center px-2.5 py-1 font-medium rounded-full text-sm sm:text-base text-white">
                      From <span className="text-white pl-2 font-medium text-lg sm:text-xl">{priceLabel}{priceTypeLabels[listing?.price?.type]}</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4 space-y-2">
                  {/* Title + Rating */}
                  <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg lg:text-xl leading-snug line-clamp-1">
                      {listing.title}
                    </h3>
                    <div className="shrink-0 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm bg-white border rounded-full px-2 sm:px-3 py-1 shadow-sm min-h-[32px]">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-anzac-500" />
                      <span className="font-medium text-gray-900">
                        {listing.ratings?.average?.toFixed(1) || "0.0"}
                      </span>
                      <span className="text-gray-500 hidden sm:inline">({listing.ratings?.count || 0})</span>
                    </div>
                  </div>

                  {/* Vendor */}
                  {listing.vendorName && (
                    <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 py-1 sm:py-2">
                      <span>By {listing.vendorName}</span>
                      {listing.vendorVerified && (
                        <span className="ml-1 inline-flex items-center text-green-600 text-xs font-medium">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  )}

                  {/* Locations */}
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <span>Available at</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(listing.serviceAreas && listing.serviceAreas.length > 0
                        ? listing.serviceAreas
                        : ["Multiple locations"]
                      ).map((loc, i) => (
                        <span
                          key={i}
                          className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium text-gray-700"
                        >
                          {loc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer chips */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-anzac-50 text-anzac-700">
                      {listing.category}
                    </span>
                    <button 
                      className="text-xs sm:text-sm font-medium transition min-h-[44px] px-2 flex items-center" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleListingClick(listing._id);
                      }}
                    >
                      View details →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ResultsComponent;
