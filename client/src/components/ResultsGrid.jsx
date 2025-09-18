/* src/components/ResultsGrid.jsx */
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';
import SearchComponent from "./SearchComponent";
import ResultsComponent from "./ResultsComponent";
import FiltersPanel from "./FiltersPanel";
import { updateSearchParams } from "../utils/updateSearchParams";
import LoadingDots from "./LoadingDots";

const API_BASE = import.meta.env.VITE_BACKEND_API || 'http://localhost:3000/api';
const ITEMS_PER_PAGE = 9; // Load 9 items per page

// Popular cities for location selection
const popularCitiesApTs = [
  'Tirupati', 'Hyderabad', 'Visakhapatnam', 'Vijayawada', 
  'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 
  'Kakinada', 'Anantapur', 'Chittoor', 'Warangal'
];

const ResultsGrid = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100,
      delay: 100
    });
  }, []);

  // URL-driven state
  const filtersFromUrl = {
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || 'all',
    location: searchParams.get('location') || '',
    vendor: searchParams.get('vendor') || '',
    priceMin: searchParams.get('priceMin') || null,
    priceMax: searchParams.get('priceMax') || null,
    rating: searchParams.get('rating') || null,
    page: parseInt(searchParams.get('page'), 10) || 1,
  };

  // Local UI state
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [displayedVendors, setDisplayedVendors] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(null);

  // Fetch listings from backend API
  const fetchListings = async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    setError(null);

    try {
      const params = {
        q: filtersFromUrl.search || undefined,
        category: filtersFromUrl.category !== 'all' ? filtersFromUrl.category : undefined,
        location: filtersFromUrl.location || undefined,
        vendor: filtersFromUrl.vendor || undefined,
        priceMin: filtersFromUrl.priceMin || undefined,
        priceMax: filtersFromUrl.priceMax || undefined,
        rating: filtersFromUrl.rating || undefined,
        page: pageNum,
        limit: ITEMS_PER_PAGE,
        sortBy: 'newest'
      };

      // Remove undefined params
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await axios.get(`${API_BASE}/listings`, { params });

      if (response.data.success) {
        const newVendors = response.data.data;
        console.log(newVendors);
        
        if (append && pageNum > 1) {
          // Append to existing vendors for Load More
          setDisplayedVendors(prev => [...prev, ...newVendors]);
        } else {
          // Replace vendors for new search/filter
          setDisplayedVendors(newVendors);
        }
        
        setPagination(response.data.pagination);
      } else {
        setError('Failed to fetch listings');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      // Refresh AOS when new content loads
      setTimeout(() => AOS.refresh(), 100);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchListings(1, false);
  }, [
    filtersFromUrl.search,
    filtersFromUrl.category,
    filtersFromUrl.location,
    filtersFromUrl.vendor,
    filtersFromUrl.priceMin,
    filtersFromUrl.priceMax,
    filtersFromUrl.rating
  ]);

  // Load More functionality
  const handleLoadMore = () => {
    if (pagination && pagination.hasNextPage && !loadingMore) {
      const nextPage = pagination.currentPage + 1;
      fetchListings(nextPage, true);
    }
  };

  // Event handlers
  const handleSearchChange = (e) => {
    const newSearch = e.target.value;
    const newParams = updateSearchParams(searchParams, { q: newSearch, page: 1 });
    setSearchParams(newParams, { replace: true });
  };

  const handleCategoryChange = (newCategory) => {
    const newParams = updateSearchParams(searchParams, { category: newCategory, page: 1 });
    setSearchParams(newParams);
  };

  // Location selection handler
  const handleLocationSelect = (location) => {
    const newParams = updateSearchParams(searchParams, { location: location, page: 1 });
    setSearchParams(newParams);
  };

  const handleFiltersApply = (applied) => {
    const newFilters = {
      priceMin: applied.price ? applied.price[0] : null,
      priceMax: applied.price ? applied.price[1] : null,
      rating: applied.rating || null,
      location: applied.location || null,
      page: 1,
    };
    const newParams = updateSearchParams(searchParams, newFilters);
    setSearchParams(newParams);
    setShowFilters(false);
  };

  const handleClearSingleFilter = (key) => {
    const newParams = new URLSearchParams(searchParams);
    if (key === 'price') {
      newParams.delete('priceMin');
      newParams.delete('priceMax');
    } else {
      newParams.delete(key);
    }
    newParams.set('page', 1);
    setSearchParams(newParams);
  };

  const handleClearAll = () => {
    setSearchParams({ category: 'all', page: 1 });
  };

  const toggleFavorite = (id) => {
    const updated = new Set(favorites);
    updated.has(id) ? updated.delete(id) : updated.add(id);
    setFavorites(updated);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Location Selector */}
      <div className="flex py-2 px-7 gap-4 overflow-x-auto justify-between">
        {popularCitiesApTs.map((city) => (
          <button
            key={city}
            onClick={() => handleLocationSelect(city)}
            className={`text-[15px] whitespace-nowrap px-3 py-1  hover:text-anzac-500 duration-200 transition-all`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Search Component */}
      <div data-aos="fade-down" data-aos-duration="600">
        <SearchComponent
          filtersFromUrl={filtersFromUrl}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onShowFilters={() => setShowFilters(true)}
          onClearSingleFilter={handleClearSingleFilter}
          onClearAll={handleClearAll}
        />
      </div>
      
      {/* Results Component */}
      {loading ? (
        <div data-aos="fade-in">
          <LoadingDots />
        </div>
      ) : error ? (
        <div className="max-w-6xl mx-auto px-4 py-12 text-center" data-aos="fade-up">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Results</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => fetchListings(1, false)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div data-aos="fade-up" data-aos-duration="800" data-aos-delay="200">
          <ResultsComponent
            filtersFromUrl={filtersFromUrl}
            displayedVendors={displayedVendors}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            pagination={pagination}
          />
          
          {/* Load More Button */}
          {pagination && pagination.hasNextPage && (
            <div className="max-w-6xl mx-auto px-4 py-8 text-center" data-aos="fade-up">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center px-3 py-2 bg-anzac-600 hover:bg-anzac-700 
                           disabled:bg-anzac-400 disabled:cursor-not-allowed text-white font-semibold 
                           rounded-md transition-all duration-200 shadow-lg hover:shadow-xl 
                           transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {loadingMore ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading More...
                  </>
                ) : (
                  <>
                    Load More 
                    <span className="ml-2 bg-anzac-500 text-anzac-100 px-2 py-1 rounded-full text-sm">
                      +{getRemainingCount()}
                    </span>
                  </>
                )}
              </button>
              
              {/* Show progress indicator */}
              <div className="mt-4 text-sm text-gray-500">
                Showing {displayedVendors.length} of {pagination.totalCount} results
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters Panel */}
      <FiltersPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleFiltersApply}
        initialFilters={{
          price: (filtersFromUrl.priceMin && filtersFromUrl.priceMax) 
            ? [parseInt(filtersFromUrl.priceMin), parseInt(filtersFromUrl.priceMax)] 
            : null,
          rating: filtersFromUrl.rating ? parseFloat(filtersFromUrl.rating) : null,
          location: filtersFromUrl.location
        }}
      />
    </div>
  );

  // Helper function to calculate remaining items
  function getRemainingCount() {
    if (!pagination) return 0;
    return Math.min(ITEMS_PER_PAGE, pagination.totalCount - displayedVendors.length);
  }
};

export default ResultsGrid;
