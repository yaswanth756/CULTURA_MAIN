// src/vendor/components/ListingModal.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  X, 
  Pencil, 
  Trash2, 
  Save, 
  MapPin, 
  Tag, 
  Plus, 
  Circle, 
  Pause 
} from 'lucide-react';

const inr = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const RowChips = ({ icon: Icon, items = [], labelSr }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded bg-gray-100">
        <Icon className="w-3.5 h-3.5 text-gray-700" />
        <span className="sr-only">{labelSr}</span>
      </span>
      <div className="flex flex-wrap gap-2">
        {items.map((val) => (
          <span
            key={val}
            className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs"
          >
            {val}
          </span>
        ))}
      </div>
    </div>
  );
};

const ListingModal = ({ listing, onClose, onUpdate, onDelete }) => {
  const [edit, setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    title: listing.title,
    description: listing.description,
    priceBase: listing.price?.base || 0,
    priceType: listing.price?.type || 'per_event',
    serviceAreas: listing.serviceAreas?.join(', ') || '',
    tags: listing.tags?.join(', ') || '',
    features: listing.features?.join(', ') || '',
    images: listing.images || [],
    newImage: ''
  });
  const [activeImg, setActiveImg] = useState(listing.images?.[0] || '');

  const resetForm = () => {
    setForm({
      title: listing.title,
      description: listing.description,
      priceBase: listing.price?.base || 0,
      priceType: listing.price?.type || 'per_event',
      serviceAreas: listing.serviceAreas?.join(', ') || '',
      tags: listing.tags?.join(', ') || '',
      features: listing.features?.join(', ') || '',
      images: listing.images || [],
      newImage: ''
    });
    setActiveImg(listing.images?.[0] || '');
  };

  const addImage = () => {
    const url = form.newImage.trim();
    if (!url) return;
    try {
      new URL(url);
      setForm((p) => ({ ...p, images: [...p.images, url], newImage: '' }));
      if (!activeImg) setActiveImg(url);
    } catch {
      toast.error('Please enter a valid image URL');
    }
  };

  const removeImage = (idx) => {
    const newImages = form.images.filter((_, i) => i !== idx);
    setForm((p) => ({ ...p, images: newImages }));
    if (activeImg === form.images[idx]) {
      setActiveImg(newImages[0] || '');
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.priceBase) {
      toast.error('Please fill all required fields');
      return;
    }
    if (Number(form.priceBase) <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }
    setIsLoading(true);
    try {
      const updateData = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: listing.category,
        subcategory: listing.subcategory,
        price: {
          base: Number(form.priceBase),
          type: form.priceType,
          currency: 'INR'
        },
        serviceAreas: form.serviceAreas.split(',').map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
        features: form.features.split(',').map((s) => s.trim()).filter(Boolean),
        images: form.images
      };
      const token = localStorage.getItem('vendorToken');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.put(
        `http://localhost:3000/api/vendor/listings/${listing._id}`,
        updateData,
        { headers }
      );
      if (response.data.success) {
        const updated = response.data.data;
        onUpdate(updated);
        setEdit(false);
        toast.success('Listing updated successfully!');
      }
    } catch (error) {
      console.error('Update listing error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update listing';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    resetForm();
    setEdit(false);
  };

  const handleToggleStatus = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('vendorToken');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.patch(
        `http://localhost:3000/api/vendor/listings/${listing._id}/status`,
        {},
        { headers }
      );
      if (response.data.success) {
        onUpdate(response.data.data);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update status';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('vendorToken');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.delete(
        `http://localhost:3000/api/vendor/listings/${listing._id}`,
        { headers }
      );
      if (response.data.success) {
        onDelete(listing._id);
        toast.success('Listing deleted successfully!');
      }
    } catch (error) {
      console.error('Delete listing error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete listing';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = listing.status === 'active';

  return createPortal(
    <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true">
      {/* Backdrop: click to close only when not editing */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={!edit ? onClose : undefined}
      />

      {/* Centering layer */}
      <div className="absolute inset-0 p-4 md:p-8 grid place-items-center pointer-events-none">
        <div className="pointer-events-auto bg-white w-full max-w-4xl rounded-xl border shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-6 border-b">
            <div className="flex items-center gap-3">
              <h4 className="font-semibold text-gray-900">
                {edit ? 'Edit listing' : 'Listing details'}
              </h4>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isActive ? (
                  <>
                    <Circle className="w-3 h-3 fill-current" />
                    Active
                  </>
                ) : (
                  <>
                    <Pause className="w-3 h-3" />
                    Inactive
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!edit ? (
                <>
                  <button
                    onClick={() => setEdit(true)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded    disabled:opacity-50"
                  >
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={onClose} className="p-2">
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="p-2 rounded  disabled:opacity-50"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="grid md:grid-cols-2 gap-5 p-5">
            {/* Images */}
            <div>
              <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                {activeImg ? (
                  <img src={activeImg} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-gray-400">No image</div>
                )}
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto">
                {(form.images || []).map((src, i) => (
                  <div key={i} className="relative">
                    <button
                      onClick={() => setActiveImg(src)}
                      className={`w-16 h-16 rounded border overflow-hidden ${activeImg === src ? 'ring-2 ring-gray-900' : ''}`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                    {edit && (
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {edit && (
                <div className="mt-3">
                  <label className="text-sm text-gray-600">Add image URL</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="url"
                      value={form.newImage}
                      onChange={(e) => setForm((p) => ({ ...p, newImage: e.target.value }))}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900/10 outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addImage();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addImage}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-5">
              {!edit ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                  <p className="text-sm text-gray-600">{listing.description}</p>

                  <div className="text-gray-900 font-semibold">
                    {inr(listing.price?.base)}{' '}
                    <span className="text-gray-500 font-normal">
                      {listing.price?.type === 'per_person'
                        ? 'per person'
                        : listing.price?.type === 'per_day'
                        ? 'per day'
                        : listing.price?.type === 'per_hour'
                        ? 'per hour'
                        : 'per event'}
                    </span>
                  </div>

                  <RowChips icon={MapPin} items={listing.serviceAreas || []} labelSr="Service areas" />
                  <RowChips icon={Tag} items={listing.tags || []} labelSr="Tags" />

                  <div className="flex items-center justify-between pt-4 border-t">
                    <button
                      onClick={handleToggleStatus}
                      disabled={isLoading}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                        isActive
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      ) : isActive ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                      {isActive ? 'Make Inactive' : 'Make Active'}
                    </button>

                    <button
                      onClick={handleDelete}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" /> Delete listing
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm text-gray-600">Title *</label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900/10 outline-none"
                      maxLength={150}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Description *</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900/10 outline-none"
                      rows={4}
                      maxLength={1000}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-600">Price (INR) *</label>
                      <input
                        type="number"
                        min="1"
                        value={form.priceBase}
                        onChange={(e) => setForm((p) => ({ ...p, priceBase: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900/10 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Price type *</label>
                      <select
                        value={form.priceType}
                        onChange={(e) => setForm((p) => ({ ...p, priceType: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900/10 outline-none"
                      >
                        <option value="per_event">Per event</option>
                        <option value="per_person">Per person</option>
                        <option value="per_day">Per day</option>
                        <option value="per_hour">Per hour</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Service areas (comma separated)</label>
                    <input
                      value={form.serviceAreas}
                      onChange={(e) => setForm((p) => ({ ...p, serviceAreas: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900/10 outline-none"
                      placeholder="Hyderabad, Secunderabad"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Features (comma separated)</label>
                    <input
                      value={form.features}
                      onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900/10 outline-none"
                      placeholder="2 shooters, raw files"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Tags (comma separated)</label>
                    <input
                      value={form.tags}
                      onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900/10 outline-none"
                      placeholder="cinematic, drone, teaser"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ListingModal;
