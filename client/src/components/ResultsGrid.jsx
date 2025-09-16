/* src/components/ResultsGrid.jsx */
import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Star,
  Heart,
  MapPin,
  Camera,
  Building2,
  Utensils,
  Cake,
  Flower2,
  Video,
  Music,
  Brush,
  Tent,
  Mic2,
  ChevronRight,
} from "lucide-react";
import FiltersPanel from "./FiltersPanel";

// Categories list
const categories = [
  { value: "all", label: "All Services", Icon: Search },
  { value: "venues", label: "Venues", Icon: Building2 },
  { value: "catering", label: "Catering", Icon: Utensils },
  { value: "cakes", label: "Cakes", Icon: Cake },
  { value: "decorations", label: "Decorations", Icon: Flower2 },
  { value: "photography", label: "Photography", Icon: Camera },
  { value: "videography", label: "Videography", Icon: Video },
  { value: "music", label: "Music / DJ", Icon: Music },
  { value: "makeup", label: "Make-up", Icon: Brush },
  { value: "mandap", label: "Mandap Setup", Icon: Tent },
  { value: "hosts", label: "Hosts / Anchors", Icon: Mic2 },
];

// Generate category-wise vendor data
const generateVendorDataByCategory = () => {
  const states = ["Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Maharashtra"];
  const cities = {
    "Andhra Pradesh": ["Hyderabad", "Visakhapatnam", "Vijayawada", "Guntur", "Kurnool"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"]
  };

  const vendorsByCategory = {};
  const serviceCategories = ["venues", "catering", "cakes", "decorations", "photography", "videography", "music", "makeup", "mandap", "hosts"];

  serviceCategories.forEach((service, serviceIndex) => {
    vendorsByCategory[service] = [];
    
    // Generate 12-15 vendors per category for testing
    const vendorCount = 12 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < vendorCount; i++) {
      const state = states[Math.floor(Math.random() * states.length)];
      const cityList = cities[state];
      const city = cityList[Math.floor(Math.random() * cityList.length)];
      
      vendorsByCategory[service].push({
        id: `${service}_${i + 1}`,
        name: `${service.charAt(0).toUpperCase() + service.slice(1)} Pro ${i + 1}`,
        description: `Professional ${service} service provider with years of experience and excellent customer reviews`,
        location: `${city}, ${state}`,
        state: state,
        city: city,
        service: service,
        price: Math.floor(Math.random() * 50000) + 5000,
        rating: (Math.random() * 2 + 3).toFixed(1),
        reviews: Math.floor(Math.random() * 200) + 10,
        image: `https://picsum.photos/400/300?random=${serviceIndex * 100 + i}`,
        featured: Math.random() > 0.8,
      });
    }
  });

  return vendorsByCategory;
};

const ITEMS_PER_CATEGORY_ALL = 3; // When "all" is selected, show 3 items per category initially
const ITEMS_PER_PAGE_SINGLE = 9; // When specific category is selected, show 9 items per page

const ResultsGrid = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  
  // Store vendors by category
  const [vendorsByCategory] = useState(generateVendorDataByCategory());
  
  // Track how many items to show per category (for "all" view)
  const [categoryLimits, setCategoryLimits] = useState({});
  
  // Track current page for single category view
  const [currentPage, setCurrentPage] = useState(1);
  
  const [displayedVendors, setDisplayedVendors] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState({});

  // URL parameters
  const urlLocation = searchParams.get('location') || '';
  const urlDate = searchParams.get('date') || '';
  const urlServiceType = searchParams.get('servicetype') || '';
  const urlVendor = searchParams.get('vendor') || '';

  // Initialize category limits when component mounts
  useEffect(() => {
    const initialLimits = {};
    Object.keys(vendorsByCategory).forEach(category => {
      initialLimits[category] = ITEMS_PER_CATEGORY_ALL;
    });
    setCategoryLimits(initialLimits);
  }, [vendorsByCategory]);

  useEffect(() => {
    // Set initial category from URL
    if (urlServiceType && categories.find(c => c.value === urlServiceType)) {
      setSelectedCategory(urlServiceType);
    }
  }, [urlServiceType]);

  // Reset page and limits when category changes
  useEffect(() => {
    setCurrentPage(1);
    if (selectedCategory === 'all') {
      // Reset all category limits to initial
      const resetLimits = {};
      Object.keys(vendorsByCategory).forEach(category => {
        resetLimits[category] = ITEMS_PER_CATEGORY_ALL;
      });
      setCategoryLimits(resetLimits);
    }
  }, [selectedCategory, vendorsByCategory]);

  useEffect(() => {
    // Update displayed vendors based on current selection and filters
    let result = [];

    if (selectedCategory === 'all') {
      // Show vendors from all categories with category limits
      Object.keys(vendorsByCategory).forEach(category => {
        const categoryVendors = vendorsByCategory[category] || [];
        const limit = categoryLimits[category] || ITEMS_PER_CATEGORY_ALL;
        const limitedVendors = categoryVendors.slice(0, limit);
        result = [...result, ...limitedVendors];
      });
    } else {
      // Show vendors from selected category with pagination
      const categoryVendors = vendorsByCategory[selectedCategory] || [];
      const startIndex = 0;
      const endIndex = currentPage * ITEMS_PER_PAGE_SINGLE;
      result = categoryVendors.slice(startIndex, endIndex);
    }

    // Apply filters
    result = applyFilters(result);
    
    setDisplayedVendors(result);
  }, [vendorsByCategory, selectedCategory, categoryLimits, currentPage, searchQuery, appliedFilters, urlLocation, urlServiceType, urlVendor]);

  const applyFilters = (vendors) => {
    let filtered = vendors;

    // Filter by URL location
    if (urlLocation) {
      const locationLower = urlLocation.toLowerCase();
      filtered = filtered.filter(vendor => 
        vendor.location.toLowerCase().includes(locationLower) ||
        vendor.state.toLowerCase().includes(locationLower) ||
        vendor.city.toLowerCase().includes(locationLower)
      );
    }

    // Filter by URL vendor name
    if (urlVendor) {
      filtered = filtered.filter(vendor => 
        vendor.name.toLowerCase().includes(urlVendor.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(vendor => 
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply additional filters
    if (appliedFilters.location) {
      filtered = filtered.filter(vendor => 
        vendor.location.toLowerCase().includes(appliedFilters.location.toLowerCase())
      );
    }

    if (appliedFilters.price) {
      filtered = filtered.filter(vendor => 
        vendor.price >= appliedFilters.price[0] && vendor.price <= appliedFilters.price[1]
      );
    }

    if (appliedFilters.rating) {
      filtered = filtered.filter(vendor => 
        parseFloat(vendor.rating) >= appliedFilters.rating
      );
    }

    return filtered;
  };

  const toggleFavorite = (id) => {
    const updated = new Set(favorites);
    updated.has(id) ? updated.delete(id) : updated.add(id);
    setFavorites(updated);
  };

  const handleLoadMore = () => {
    if (selectedCategory === 'all') {
      // Increase limits for all categories that have more items
      const updatedLimits = { ...categoryLimits };
      let hasUpdate = false;
      
      Object.keys(vendorsByCategory).forEach(category => {
        const categoryVendors = vendorsByCategory[category] || [];
        const currentLimit = categoryLimits[category] || ITEMS_PER_CATEGORY_ALL;
        
        if (currentLimit < categoryVendors.length) {
          updatedLimits[category] = Math.min(
            currentLimit + ITEMS_PER_CATEGORY_ALL, 
            categoryVendors.length
          );
          hasUpdate = true;
        }
      });
      
      if (hasUpdate) {
        setCategoryLimits(updatedLimits);
      }
    } else {
      // Increase page for single category
      setCurrentPage(prev => prev + 1);
    }
  };

  const hasMoreItems = () => {
    if (selectedCategory === 'all') {
      // Check if any category has more items
      return Object.keys(vendorsByCategory).some(category => {
        const categoryVendors = vendorsByCategory[category] || [];
        const currentLimit = categoryLimits[category] || ITEMS_PER_CATEGORY_ALL;
        return currentLimit < categoryVendors.length;
      });
    } else {
      // Check if current category has more items
      const categoryVendors = vendorsByCategory[selectedCategory] || [];
      return (currentPage * ITEMS_PER_PAGE_SINGLE) < categoryVendors.length;
    }
  };

  const getRemainingCount = () => {
    if (selectedCategory === 'all') {
      let total = 0;
      Object.keys(vendorsByCategory).forEach(category => {
        const categoryVendors = vendorsByCategory[category] || [];
        const currentLimit = categoryLimits[category] || ITEMS_PER_CATEGORY_ALL;
        total += Math.max(0, categoryVendors.length - currentLimit);
      });
      return total;
    } else {
      const categoryVendors = vendorsByCategory[selectedCategory] || [];
      return Math.max(0, categoryVendors.length - (currentPage * ITEMS_PER_PAGE_SINGLE));
    }
  };

  const handleFiltersApply = (filters) => {
    setAppliedFilters(filters);
  };

  const getPageTitle = () => {
    if (urlVendor) return `Results for "${urlVendor}"`;
    if (urlServiceType && urlServiceType !== 'all') {
      const category = categories.find(c => c.value === urlServiceType);
      return category ? category.label : 'Search Results';
    }
    if (selectedCategory !== 'all') {
      const category = categories.find(c => c.value === selectedCategory);
      return category ? category.label : 'All Services';
    }
    return 'All Services';
  };

  // Group vendors by category for "all" view
  const getGroupedVendors = () => {
    if (selectedCategory !== 'all') {
      return [{ category: selectedCategory, vendors: displayedVendors }];
    }

    // For 'all' view, group vendors by category and show headings
    const grouped = [];
    const serviceCategories = ["venues", "catering", "cakes", "decorations", "photography", "videography", "music", "makeup", "mandap", "hosts"];
    
    serviceCategories.forEach(category => {
      const categoryVendors = displayedVendors.filter(v => v.service === category);
      if (categoryVendors.length > 0) {
        const categoryInfo = categories.find(c => c.value === category);
        grouped.push({
          category,
          categoryLabel: categoryInfo?.label || category.charAt(0).toUpperCase() + category.slice(1),
          CategoryIcon: categoryInfo?.Icon || Search,
          vendors: categoryVendors
        });
      }
    });
    return grouped;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services or vendors..."
              className="w-full pl-12 pr-24 py-3 rounded-full border border-gray-300 
                         focus:ring-2 focus:ring-anzac-200 focus:border-anzac-500 outline-none 
                         shadow-sm transition"
            />
            <button
              onClick={() => setShowFilters(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-anzac-500 text-white 
                         px-4 py-2 rounded-full hover:bg-anzac-600 transition flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Categories - Horizontal Scroll */}
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
              {categories.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setSelectedCategory(c.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm 
                             transition whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === c.value
                      ? "bg-anzac-500 text-white border-anzac-500 shadow"
                      : "bg-white text-gray-700 border-gray-200 hover:border-anzac-300"
                  }`}
                >
                  <c.Icon className="w-4 h-4" />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters Display */}
          {(urlLocation || urlServiceType || urlVendor) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {urlLocation && (
                <span className="px-3 py-1 bg-anzac-100 text-anzac-800 text-sm rounded-full">
                  📍 {urlLocation}
                </span>
              )}
              {urlServiceType && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  🎯 {categories.find(c => c.value === urlServiceType)?.label || urlServiceType}
                </span>
              )}
              {urlVendor && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  🏪 {urlVendor}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {getPageTitle()}
          </h2>
          <span className="text-sm text-gray-500">
            {displayedVendors.length} vendor{displayedVendors.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {displayedVendors.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No vendors found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <>
            {/* Display vendors grouped by category (for "all") or as single list */}
            {getGroupedVendors().map(({ category, categoryLabel, CategoryIcon, vendors }, groupIndex) => (
              <div key={category} className={`${groupIndex > 0 ? 'mt-12' : 'mb-8'}`}>
                
                {/* Always show heading for each category section when 'all' is selected */}
                {selectedCategory === 'all' && (
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      {CategoryIcon && <CategoryIcon className="w-6 h-6 text-anzac-600" />}
                      <h3 className="text-xl font-semibold text-gray-800">{categoryLabel}</h3>
                      <span className="bg-anzac-100 text-anzac-800 text-sm px-3 py-1 rounded-full font-medium">
                        {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {/* View All link for each category */}
                    <button
                      onClick={() => setSelectedCategory(category)}
                      className="text-anzac-600 hover:text-anzac-700 text-sm font-medium flex items-center gap-1 transition group"
                    >
                      View All
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                )}
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {vendors.map((vendor) => (
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
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        <div className="absolute inset-0 bg-gray-100 items-center justify-center hidden">
                          <Camera className="w-10 h-10 text-gray-400" />
                        </div>
                        
                        {vendor.featured && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-anzac-500 to-anzac-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                            ⭐ Featured
                          </div>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(vendor.id);
                          }}
                          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm 
                                     hover:bg-white hover:shadow-md transition-all duration-200"
                        >
                          <Heart
                            className={`w-4 h-4 transition-colors ${
                              favorites.has(vendor.id) ? "text-red-500 fill-red-500" : "text-gray-600 hover:text-red-400"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 text-lg mb-1 group-hover:text-anzac-600 transition-colors">
                          {vendor.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {vendor.description}
                        </p>
                        
                        <div className="flex items-center text-sm text-gray-500 gap-1 mb-3">
                          <MapPin className="w-4 h-4" />
                          <span>{vendor.location}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-anzac-600 font-bold text-lg">
                            ₹{vendor.price.toLocaleString()}
                          </span>
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
              </div>
            ))}

            {/* Enhanced Load More Button */}
            {hasMoreItems() && (
              <div className="text-center mt-12">
                <div className="inline-flex flex-col items-center gap-3">
                  <p className="text-gray-600 text-sm">
                    {selectedCategory === 'all' 
                      ? `${getRemainingCount()} more vendors across all categories`
                      : `${getRemainingCount()} more ${getPageTitle().toLowerCase()}`
                    }
                  </p>
                  <button 
                    onClick={handleLoadMore}
                    className="px-8 py-3 bg-gradient-to-r from-anzac-500 to-anzac-600 text-white rounded-full font-medium 
                               hover:from-anzac-600 hover:to-anzac-700 transition-all duration-200 shadow-lg hover:shadow-xl
                               transform hover:-translate-y-0.5"
                  >
                    Load More
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filters Modal */}
      <FiltersPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleFiltersApply}
      />

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
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

export default ResultsGrid;
