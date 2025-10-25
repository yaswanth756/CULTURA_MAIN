// src/vendor/components/ListingModal.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { buildApiUrl } from '../../utils/api';
import { toast } from 'react-toastify';
import { 
  X, 
  Pencil, 
  Trash2, 
  Save, 
  MapPin, 
  Tag, 
  Upload as UploadIcon,
  Circle, 
  Pause,
  Image as ImageIcon
} from 'lucide-react';

const inr = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const RowChips = ({ icon: Icon, items = [], labelSr }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded bg-gray-100 flex-shrink-0">
        <Icon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-gray-600" />
        <span className="sr-only">{labelSr}</span>
      </span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((val) => (
          <span 
            key={val} 
            className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] sm:text-xs font-medium"
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
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: listing.title,
    description: listing.description,
    priceBase: listing.price?.base || 0,
    priceType: listing.price?.type || 'per_event',
    serviceAreas: listing.serviceAreas?.join(', ') || '',
    tags: listing.tags?.join(', ') || '',
    features: listing.features?.join(', ') || '',
    images: listing.images || []
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
      images: listing.images || []
    });
    setActiveImg(listing.images?.[0] || '');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('vendorToken');
      const response = await axios.post(
        buildApiUrl('/api/upload/single'),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const imageUrl = response.data.url;
        setForm((p) => ({ ...p, images: [...p.images, imageUrl] }));
        if (!activeImg) setActiveImg(imageUrl);
        toast.success('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload image';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
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
        buildApiUrl(`/api/vendor/listings/${listing._id}`),
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
        buildApiUrl(`/api/vendor/listings/${listing._id}/status`),
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
        buildApiUrl(`/api/vendor/listings/${listing._id}`),
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
    <div className="fixed inset-0 z-[1000] overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!edit ? onClose : undefined}
      />

      {/* Modal container */}
      <div className="relative min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-8">
        <div className="relative bg-white w-full max-w-4xl rounded-xl sm:rounded-2xl border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-4 sm:py-5 border-b bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <h4 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                {edit ? 'Edit listing' : 'Listing details'}
              </h4>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold flex-shrink-0 ${
                  isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isActive ? (
                  <>
                    <Circle className="w-2 sm:w-2.5 h-2 sm:h-2.5 fill-current" />
                    <span className="hidden sm:inline">Active</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-2 sm:w-2.5 h-2 sm:h-2.5" />
                    <span className="hidden sm:inline">Inactive</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {!edit ? (
                <>
                  <button
                    onClick={() => setEdit(true)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    <Pencil className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <X className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-anzac-500 text-white hover:bg-anzac-600 disabled:opacity-50 transition-colors font-medium"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3.5 sm:w-4 h-3.5 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="hidden sm:inline">Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                        <span className="hidden sm:inline">Save</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                    className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg border hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    <X className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Body - scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-5 p-4 sm:p-5">
              {/* Images */}
              <div>
                <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                  {activeImg ? (
                    <img src={activeImg} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-gray-400">
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No image</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {(form.images || []).map((src, i) => (
                    <div key={i} className="relative flex-shrink-0">
                      <button
                        onClick={() => setActiveImg(src)}
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg border-2 overflow-hidden transition-all ${
                          activeImg === src ? 'border-anzac-500 ring-2 ring-anzac-200' : 'border-gray-200'
                        }`}
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                      {edit && (
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute -top-3 sm:top-1 right-1 w-5 h-5 sm:bg-red-500 sm:text-white text-red-600 rounded-full sm:text-sm text-medium hover:bg-red-600 shadow-sm flex items-center justify-center font-bold"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {edit && (
                  <div className="mt-3">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block mb-1.5">
                      Upload Image
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className={`flex items-center justify-center gap-2 w-full px-4 py-3 bg-anzac-500 text-white rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-anzac-600 ${
                          uploading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md active:scale-[0.98]'
                        }`}
                      >
                        {uploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <UploadIcon className="w-4 h-4" />
                            <span>Choose Image to Upload</span>
                          </>
                        )}
                      </label>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5">
                      Max 5MB • JPG, PNG, WebP • Automatically optimized
                    </p>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-4 sm:space-y-5">
                {!edit ? (
                  <>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{listing.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{listing.description}</p>

                    <div className="text-base sm:text-lg font-bold text-gray-900">
                      {inr(listing.price?.base)}{' '}
                      <span className="text-sm text-gray-500 font-normal">
                        / {listing.price?.type === 'per_person'
                          ? 'person'
                          : listing.price?.type === 'per_day'
                          ? 'day'
                          : listing.price?.type === 'per_hour'
                          ? 'hour'
                          : 'event'}
                      </span>
                    </div>

                    <RowChips icon={MapPin} items={listing.serviceAreas || []} labelSr="Service areas" />
                    <RowChips icon={Tag} items={listing.tags || []} labelSr="Tags" />

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t">
                      <button
                        onClick={handleToggleStatus}
                        disabled={isLoading}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 ${
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
                        className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete listing
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1.5">Title *</label>
                      <input
                        value={form.title}
                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-anzac-500/20 focus:border-anzac-500 outline-none"
                        maxLength={150}
                      />
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1.5">Description *</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-anzac-500/20 focus:border-anzac-500 outline-none"
                        rows={4}
                        maxLength={1000}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1.5">Price (₹) *</label>
                        <input
                          type="number"
                          min="1"
                          value={form.priceBase}
                          onChange={(e) => setForm((p) => ({ ...p, priceBase: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-anzac-500/20 focus:border-anzac-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1.5">Type *</label>
                        <select
                          value={form.priceType}
                          onChange={(e) => setForm((p) => ({ ...p, priceType: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-anzac-500/20 focus:border-anzac-500 outline-none"
                        >
                          <option value="per_event">Per event</option>
                          <option value="per_person">Per person</option>
                          <option value="per_day">Per day</option>
                          <option value="per_hour">Per hour</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1.5">Service areas</label>
                      <input
                        value={form.serviceAreas}
                        onChange={(e) => setForm((p) => ({ ...p, serviceAreas: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-anzac-500/20 focus:border-anzac-500 outline-none"
                        placeholder="Hyderabad, Secunderabad"
                      />
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1.5">Features</label>
                      <input
                        value={form.features}
                        onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-anzac-500/20 focus:border-anzac-500 outline-none"
                        placeholder="2 shooters, raw files"
                      />
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1.5">Tags</label>
                      <input
                        value={form.tags}
                        onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-anzac-500/20 focus:border-anzac-500 outline-none"
                        placeholder="cinematic, drone, teaser"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ListingModal;
