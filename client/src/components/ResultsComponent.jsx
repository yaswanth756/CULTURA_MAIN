/* src/components/ResultsComponent.jsx */
import React from "react";
import { Search, Star, Heart, MapPin, Camera } from "lucide-react";

// Categories mapping
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
  displayedVendors, // pass the array you shared here
  favorites,
  onToggleFavorite,
  pagination,
}) => {
  const getPageTitle = () => {
    if (filtersFromUrl.vendor) return `Results for "${filtersFromUrl.vendor}"`;
    if (filtersFromUrl.category && filtersFromUrl.category !== "all") {
      const category = categories.find((c) => c.value === filtersFromUrl.category);
      return category ? category.label : "Search Results";
    }
    return "All Services";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
        <div className="text-sm text-gray-500">
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
          <h3 className="text-lg font-medium text-gray-800 mb-2">No vendors found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedVendors.map((vendor, index) => (
            <div
              key={vendor._id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer group"
              data-aos="fade-up"
              data-aos-delay={index * 50}
            >
              {/* Image Section */}
              <div className="relative h-48 bg-gray-100">
  {vendor.images && vendor.images.length > 0 ? (
    <img
      src={vendor.images[0]}
      alt={vendor.title}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      onError={(e) => {
        e.target.style.display = "none"; // hide broken image
        const fallback = e.target.nextSibling;
        if (fallback) fallback.style.display = "flex"; // show fallback
      }}
    />
  ) : null}

  {/* Fallback placeholder */}
  <div
    className="absolute inset-0 bg-gray-100 items-center justify-center flex"
    style={{ display: vendor.images && vendor.images.length > 0 ? "none" : "flex" }}
  >
    <Camera className="w-10 h-10 text-gray-400" />
  </div>
</div>


              {/* Content Section */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-lg mb-1 group-hover:text-anzac-600 transition-colors">
                  {vendor.title}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{vendor.description}</p>

                {vendor.vendorName && (
                  <div className="text-xs text-gray-500 mb-2">
                    By {vendor.vendorName}
                    {vendor.vendorVerified && <span className="ml-1 text-green-600">✓</span>}
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-500 gap-1 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">
                    {vendor.serviceAreas && vendor.serviceAreas.length > 0
                      ? vendor.serviceAreas.slice(0, 2).join(", ") +
                        (vendor.serviceAreas.length > 2 ? "..." : "")
                      : "Multiple locations"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-anzac-600 font-bold text-lg">
                      {vendor.formattedPrice || `₹${vendor.price?.base?.toLocaleString("en-IN") || "0"}`}
                    </span>
                    {vendor.price?.type && vendor.price.type !== "fixed" && (
                      <span className="text-xs text-gray-500">
                        {vendor.price.type === "per_person"
                          ? "per person"
                          : vendor.price.type === "per_event"
                          ? "per event"
                          : vendor.price.type}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-sm bg-gradient-to-r from-anzac-50 to-anzac-100 px-3 py-1.5 rounded-full">
                    <Star className="w-4 h-4 text-anzac-500 fill-anzac-500" />
                    <span className="font-medium text-anzac-700">
                      {vendor.ratings?.average?.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-anzac-500">({vendor.ratings?.count || 0})</span>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {vendor.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ResultsComponent;
