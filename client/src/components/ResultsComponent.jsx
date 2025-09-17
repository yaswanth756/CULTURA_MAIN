/* src/components/ResultsComponent.jsx */
import React from "react";
import { Search, Star, Heart, MapPin } from "lucide-react";

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
  onToggleFavorite
}) => {
  const getPageTitle = () => {
    if (filtersFromUrl.vendor) return `Results for "${filtersFromUrl.vendor}"`;
    if (filtersFromUrl.category && filtersFromUrl.category !== 'all') {
      const category = categories.find(c => c.value === filtersFromUrl.category);
      return category ? category.label : 'Search Results';
    }
    return 'All Services';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
        <span className="text-sm text-gray-500">
          {displayedVendors.length} vendor{displayedVendors.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {displayedVendors.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800">No vendors found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md 
                        transition-all duration-300 overflow-hidden cursor-pointer group"
            >
              <div className="relative h-48 bg-gray-100">
                <img 
                  src={vendor.image} 
                  alt={vendor.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                {vendor.featured && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-anzac-500 to-anzac-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                    ⭐ Featured
                  </div>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(vendor.id); }} 
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-all"
                >
                  <Heart className={`w-4 h-4 transition-colors ${favorites.has(vendor.id) ? "text-red-500 fill-red-500" : "text-gray-600"}`} />
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-lg mb-1 group-hover:text-anzac-600">
                  {vendor.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{vendor.description}</p>
                <div className="flex items-center text-sm text-gray-500 gap-1 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{vendor.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-anzac-600 font-bold text-lg">₹{vendor.price.toLocaleString()}</span>
                  <div className="flex items-center gap-1 text-sm bg-gradient-to-r from-anzac-50 to-anzac-100 px-3 py-1.5 rounded-full">
                    <Star className="w-4 h-4 text-anzac-500 fill-anzac-500" />
                    <span className="font-medium text-anzac-700">{vendor.rating}</span>
                    <span className="text-anzac-500">({vendor.reviews})</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default ResultsComponent;
