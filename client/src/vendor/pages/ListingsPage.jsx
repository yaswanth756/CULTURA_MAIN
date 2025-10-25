// src/vendor/pages/ListingsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl } from '../../utils/api';
import { toast } from 'react-toastify';
import PendingNotice from '../components/PendingNotice';
import { Plus, Search, X } from 'lucide-react';
import ListingCard from '../components/ListingCard';
import ListingModal from '../components/ListingModal';
import ListingForm from '../components/ListingForm';

// Skeletons
const SkeletonBar = ({ className = '' }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

const SkeletonPill = () => (
  <div className="relative">
    <div className="w-full h-10 sm:h-12 rounded-full bg-gray-200 animate-pulse" />
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 animate-pulse">
    <div className="h-32 sm:h-40 bg-gray-200 rounded-lg" />
    <div className="mt-3 space-y-2">
      <SkeletonBar className="h-4 w-3/5" />
      <SkeletonBar className="h-3 w-4/5" />
      <div className="flex gap-2 mt-2">
        <SkeletonBar className="h-6 w-16 rounded-full" />
        <SkeletonBar className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex items-center justify-between mt-3">
        <SkeletonBar className="h-4 w-20" />
        <SkeletonBar className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  </div>
);

const ListingsSkeleton = () => (
  <div className="space-y-4 sm:space-y-5">
    {/* Header row */}
    <div className="flex items-center justify-between">
      <div className="space-y-1.5">
        <SkeletonBar className="h-6 sm:h-7 w-32 sm:w-40" />
        <SkeletonBar className="h-3 sm:h-4 w-40 sm:w-56" />
      </div>
      <SkeletonBar className="h-9 sm:h-10 w-20 sm:w-28 rounded-full" />
    </div>

    {/* Search pill */}
    <SkeletonPill />

    {/* Meta line */}
    <SkeletonBar className="h-3 w-36 sm:w-44" />

    {/* Grid */}
    <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

const ListingsPage = () => {
  const { vendorData } = useOutletContext();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Guard: pending notice
  if (!vendorData.vendorInfo.verified) {
    return <PendingNotice title="Application under process" />;
  }

  // Fetch listings on component mount
  useEffect(() => {
    fetchListings();
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const fetchListings = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('vendorToken');
    try {
      const response = await axios.get(buildApiUrl('/api/vendor/listings'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setItems(response.data.data || []);
      } else {
        toast.error('Failed to fetch listings');
      }
    } catch (error) {
      console.error('Fetch listings error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load listings';
      toast.error(errorMessage);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...items];

    if (debounced) {
      list = list.filter((l) =>
        [
          l.title,
          l.category,
          l.subcategory,
          ...(l.tags || []),
          ...(l.serviceAreas || []),
        ]
          .join(' ')
          .toLowerCase()
          .includes(debounced)
      );
    }

    // Sort: latest first
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return list;
  }, [items, debounced]);

  const handleCreate = (newListing) => {
    setItems((prev) => [newListing, ...prev]);
    setShowForm(false);
    toast.success('Listing created successfully!');
  };

  const handleUpdate = (updated) => {
    setItems((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
    setSelected(updated);
    toast.success('Listing updated successfully!');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      setItems((prev) => prev.filter((l) => l._id !== id));
      setSelected(null);
      // TODO: Add delete API call when backend is ready
      toast.success('Listing deleted successfully!');
    } catch (error) {
      console.error('Delete listing error:', error);
      toast.error('Failed to delete listing');
      fetchListings();
    }
  };

  // Loading state -> Skeletons
  if (isLoading) {
    return <ListingsSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">My Listings</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage your service offerings</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-anzac-500 text-white text-xs sm:text-sm font-medium hover:bg-anzac-600 transition-colors shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Listing</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Rounded search pill */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 sm:pl-11 pr-10 py-2.5 sm:py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-anzac-500/20 focus:border-anzac-500 outline-none text-sm placeholder:text-gray-400 transition-shadow"
          placeholder="Search title, category, area..."
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Meta */}
      {items.length > 0 && (
        <div className="text-xs sm:text-sm text-gray-500">
          Showing <span className="font-medium text-gray-700">{filtered.length}</span> of{' '}
          <span className="font-medium text-gray-700">{items.length}</span> listings
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <p className="text-base sm:text-lg font-semibold text-gray-900">No listings yet</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5 max-w-sm mx-auto">
            Create your first listing to showcase your services to customers
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-anzac-500 text-white text-sm font-medium hover:bg-anzac-600 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create your first listing
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <p className="text-base sm:text-lg font-semibold text-gray-900">No results found</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
            Try different keywords or clear your search
          </p>
          <button
            onClick={() => setQuery('')}
            className="mt-4 text-sm text-anzac-500 hover:text-anzac-600 font-medium transition-colors"
          >
            Clear search
          </button>
        </div>
      ) : (
        /* Grid */
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <ListingCard key={l._id} listing={l} onClick={() => setSelected(l)} />
          ))}
        </div>
      )}

      {/* View/Edit Modal */}
      {selected && (
        <ListingModal
          listing={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          onDelete={() => handleDelete(selected._id)}
        />
      )}

      {/* Create Form */}
      {showForm && (
        <ListingForm onCancel={() => setShowForm(false)} onSubmit={handleCreate} />
      )}
    </div>
  );
};

export default ListingsPage;
