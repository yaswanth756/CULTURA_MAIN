// src/vendor/pages/ListingsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import PendingNotice from '../components/PendingNotice';
import { Plus, Search, Loader2 } from 'lucide-react';
import ListingCard from '../components/ListingCard';
import ListingModal from '../components/ListingModal';
import ListingForm from '../components/ListingForm';

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
    const token=localStorage.getItem('vendorToken');
    try {
      const response = await axios.get('http://localhost:3000/api/vendor/listings',
        {
          headers: {
            Authorization: `Bearer ${token}`, // sending token in headers
          },
        }
      );
      
      if (response.data.success) {
        setItems(response.data.data || []);
      } else {
        toast.error('Failed to fetch listings');
      }
    } catch (error) {
      console.error('Fetch listings error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load listings';
      toast.error(errorMessage);
      
      // Set empty array on error
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
          ...(l.serviceAreas || [])
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
    // Add new listing to the beginning of the array
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
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      // Optimistically remove from UI
      setItems((prev) => prev.filter((l) => l._id !== id));
      setSelected(null);
      
      // TODO: Add delete API call when backend is ready
      // await axios.delete(`http://localhost:3000/api/vendor/listings/${id}`);
      
      toast.success('Listing deleted successfully!');
    } catch (error) {
      console.error('Delete listing error:', error);
      toast.error('Failed to delete listing');
      
      // Revert on error - refetch to be safe
      fetchListings();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
          <p className="text-gray-600 mt-2">Loading your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">My Listings</h2>
          <p className="text-sm text-gray-500">Manage your service offerings</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-3xl bg-anzac-500 text-white text-sm hover:bg-anzac-600"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Rounded search pill */}
      <div className="relative max-w-xl">
        <div className="absolute inset-0 rounded-full shadow-sm pointer-events-none" />
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-full border focus:ring-2 focus:ring-gray-900/10 outline-none placeholder:text-gray-400"
          placeholder="Search title, category, area, tags…"
        />
      </div>

      {/* Meta */}
      {items.length > 0 && (
        <div className="text-sm text-gray-500">
          Showing {filtered.length} of {items.length} listings
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-700 font-medium">No listings yet</p>
          <p className="text-sm text-gray-500 mt-1">Create your first listing to showcase your services</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 text-white text-sm hover:bg-black"
          >
            <Plus className="w-4 h-4" /> Create your first listing
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-700 font-medium">No listings match your search</p>
          <p className="text-sm text-gray-500 mt-1">Try different keywords or clear your search</p>
          <button
            onClick={() => setQuery('')}
            className="mt-4 text-sm text-anzac-500 hover:text-anzac-600"
          >
            Clear search
          </button>
        </div>
      ) : (
        /* Grid */
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
        <ListingForm 
          onCancel={() => setShowForm(false)} 
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
};

export default ListingsPage;
