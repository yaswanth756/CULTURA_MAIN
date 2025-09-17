/* src/components/ResultsGrid.jsx */
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';
import SearchComponent from "./SearchComponent";
import ResultsComponent from "./ResultsComponent";
import FiltersPanel from "./FiltersPanel";
import { updateSearchParams } from "../utils/updateSearchParams";
import { generateVendorDataByCategory } from '../utils/generateVendorDataByCategory';
import LoadingDots from "./LoadingDots";

const ResultsGrid = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true, // Animation happens only once
      offset: 100, // Trigger animation 100px before element comes into view
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
  const [vendorsByCategory] = useState(generateVendorDataByCategory());
  const [displayedVendors, setDisplayedVendors] = useState([]);

  // Dummy data filtering logic
  useEffect(() => {
    setLoading(true); 
    let result = [];
    const activeCategory = filtersFromUrl.category;
    
    if (activeCategory === 'all') {
      Object.keys(vendorsByCategory).forEach(category => {
        const categoryVendors = vendorsByCategory[category] || [];
        result = [...result, ...categoryVendors];
      });
    } else {
      result = vendorsByCategory[activeCategory] || [];
    }
    
    const applyDummyFilters = (vendors) => {
      let filtered = vendors;
      if (filtersFromUrl.search) {
        filtered = filtered.filter(v => v.name.toLowerCase().includes(filtersFromUrl.search.toLowerCase()));
      }
      if (filtersFromUrl.location) {
        filtered = filtered.filter(v => v.location.toLowerCase().includes(filtersFromUrl.location.toLowerCase()));
      }
      if (filtersFromUrl.vendor) {
        filtered = filtered.filter(v => v.name.toLowerCase().includes(filtersFromUrl.vendor.toLowerCase()));
      }
      if (filtersFromUrl.priceMin) {
        filtered = filtered.filter(v => v.price >= parseInt(filtersFromUrl.priceMin));
      }
      if (filtersFromUrl.priceMax) {
        filtered = filtered.filter(v => v.price <= parseInt(filtersFromUrl.priceMax));
      }
      if (filtersFromUrl.rating) {
        filtered = filtered.filter(v => parseFloat(v.rating) >= parseFloat(filtersFromUrl.rating));
      }
      return filtered;
    };
    
    result = applyDummyFilters(result);
    setTimeout(() => {
      setDisplayedVendors(result);
      setLoading(false);
      // Refresh AOS when new content loads
      AOS.refresh();
    }, 300); // Reduced from 8000ms to 300ms for better UX
  }, [searchParams, vendorsByCategory]);

  // Handlers (keeping your existing handlers unchanged)
  const handleSearchChange = (e) => {
    const newSearch = e.target.value;
    const newParams = updateSearchParams(searchParams, { q: newSearch, page: 1 });
    setSearchParams(newParams, { replace: true });
  };

  const handleCategoryChange = (newCategory) => {
    const newParams = updateSearchParams(searchParams, { category: newCategory, page: 1 });
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
    <div className="min-h-screen bg-gray-50">
      {/* Search Component with fade-down animation */}
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
      
      {/* Results Component with staggered animations */}
      {loading ? (
        <div data-aos="fade-in">
          <LoadingDots />
        </div>
      ) : (
        <div data-aos="fade-up" data-aos-duration="800" data-aos-delay="200">
          <ResultsComponent
            filtersFromUrl={filtersFromUrl}
            displayedVendors={displayedVendors}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        </div>
      )}

      {/* Filters Panel with slide animation */}
    
        <FiltersPanel
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          onApply={handleFiltersApply}
          initialFilters={{
            price: (filtersFromUrl.priceMin && filtersFromUrl.priceMax) ? [parseInt(filtersFromUrl.priceMin), parseInt(filtersFromUrl.priceMax)] : null,
            rating: filtersFromUrl.rating ? parseFloat(filtersFromUrl.rating) : null,
            location: filtersFromUrl.location
          }}
        />
      </div>

  );
};

export default ResultsGrid;
