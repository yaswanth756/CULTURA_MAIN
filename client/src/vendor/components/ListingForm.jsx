// src/vendor/components/ListingForm.jsx
import React, { useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { buildApiUrl } from "../../utils/api";
import { toast } from "react-toastify";
import {
  X,
  Save,
  Plus,
  Tag,
  MapPin,
  Image as ImageIcon,
  FileText,
  Package,
  IndianRupee,
  Layers,
} from "lucide-react";

const ListingForm = ({ onCancel, onSubmit }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "photography",
    subcategory: "",
    priceBase: "",
    priceType: "per_event",
    currency: "INR",
    images: [],
    newImage: "",
    serviceAreas: "",
    features: "",
    tags: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const addImage = () => {
    const url = form.newImage.trim();
    if (!url) return;
    
    // Basic URL validation
    try {
      new URL(url);
      setForm((p) => ({ ...p, images: [...p.images, url], newImage: "" }));
    } catch {
      toast.error("Please enter a valid image URL");
    }
  };

  const removeImage = (idx) => {
    setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend validation
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.subcategory.trim() ||
      !form.priceBase
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (Number(form.priceBase) <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    setIsLoading(true);

    try {
      const listingData = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        subcategory: form.subcategory.trim(),
        price: {
          base: Number(form.priceBase),
          type: form.priceType,
          currency: form.currency,
        },
        images: form.images,
        serviceAreas: form.serviceAreas
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        features: form.features
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        tags: form.tags
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean),
      };
      const token = localStorage.getItem("vendorToken");
      
      const response = await axios.post(
        buildApiUrl('/api/vendor/listings'),
        listingData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // sending token in headers
          },
        }
      );

      if (response.data.success) {
        toast.success("Listing created successfully!");
        
        // Pass the created listing back to parent
        const newListing = {
          ...response.data.data,
          ratings: { average: 0, count: 0 },
          status: 'active',
          createdAt: new Date().toISOString()
        };
        
        onSubmit(newListing);
      }

    } catch (error) {
      console.error('Create listing error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          'Failed to create listing. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* Modal */}
      <div className="absolute inset-0 p-4 md:p-8 grid place-items-center pointer-events-none">
        <div className="pointer-events-auto bg-white w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
            <h4 className="font-semibold text-gray-900 text-lg">Add New Listing</h4>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="p-2 rounded-full hover:bg-gray-200 transition disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic info */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-gray-700 flex items-center gap-1">
                  <Package className="w-4 h-4 text-gray-500" /> Title *
                </label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  disabled={isLoading}
                  className="mt-1 w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900/10 outline-none disabled:opacity-50"
                  placeholder="Cinematic Wedding Photography"
                  maxLength={150}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700 flex items-center gap-1">
                  <Layers className="w-4 h-4 text-gray-500" /> Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, category: e.target.value }))
                  }
                  disabled={isLoading}
                  className="mt-1 w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900/10 outline-none disabled:opacity-50"
                >
                  <option value="venues">Venues</option>
                  <option value="catering">Catering</option>
                  <option value="photography">Photography</option>
                  <option value="videography">Videography</option>
                  <option value="music">Music</option>
                  <option value="makeup">Makeup</option>
                  <option value="decorations">Decorations</option>
                  <option value="cakes">Cakes</option>
                  <option value="mandap">Mandap</option>
                  <option value="hosts">Hosts</option>
                </select>
              </div>
            </div>

            {/* Subcategory + Price */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-gray-700">Subcategory *</label>
                <input
                  value={form.subcategory}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, subcategory: e.target.value }))
                  }
                  disabled={isLoading}
                  className="mt-1 w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900/10 outline-none disabled:opacity-50"
                  placeholder="wedding, reception, sangeet…"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-700 flex items-center gap-1">
                    <IndianRupee className="w-4 h-4 text-gray-500" /> Price *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.priceBase}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, priceBase: e.target.value }))
                    }
                    disabled={isLoading}
                    className="mt-1 w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900/10 outline-none disabled:opacity-50"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700">Price Type *</label>
                  <select
                    value={form.priceType}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, priceType: e.target.value }))
                    }
                    disabled={isLoading}
                    className="mt-1 w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900/10 outline-none disabled:opacity-50"
                  >
                    <option value="per_event">Per event</option>
                    <option value="per_person">Per person</option>
                    <option value="per_day">Per day</option>
                    <option value="per_hour">Per hour</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-gray-700 flex items-center gap-1">
                <FileText className="w-4 h-4 text-gray-500" /> Description *
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={4}
                disabled={isLoading}
                maxLength={1000}
                className="mt-1 w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900/10 outline-none disabled:opacity-50"
                placeholder="Describe the service, inclusions, options…"
              />
              <div className="text-xs text-gray-500 mt-1">
                {form.description.length}/1000 characters
              </div>
            </div>

            {/* Service Areas / Features / Tags */}
            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className="text-sm text-gray-700 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-500" /> Service Areas
                </label>
                <input
                  value={form.serviceAreas}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, serviceAreas: e.target.value }))
                  }
                  disabled={isLoading}
                  className="mt-1 w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900/10 outline-none disabled:opacity-50"
                  placeholder="Hyderabad, Secunderabad"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Features</label>
                <input
                  value={form.features}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, features: e.target.value }))
                  }
                  disabled={isLoading}
                  className="mt-1 w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900/10 outline-none disabled:opacity-50"
                  placeholder="2 shooters, teaser film"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700 flex items-center gap-1">
                  <Tag className="w-4 h-4 text-gray-500" /> Tags
                </label>
                <input
                  value={form.tags}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, tags: e.target.value }))
                  }
                  disabled={isLoading}
                  className="mt-1 w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900/10 outline-none disabled:opacity-50"
                  placeholder="cinematic, drone, teaser"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="text-sm text-gray-700 flex items-center gap-1">
                <ImageIcon className="w-4 h-4 text-gray-500" /> Images
              </label>
              <div className="mt-3 flex gap-3 overflow-x-auto">
                {form.images.map((src, i) => (
                  <div
                    key={i}
                    className="relative w-24 h-24 rounded-xl border overflow-hidden shadow-sm"
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      disabled={isLoading}
                      className="absolute top-1 right-1 bg-white/90 rounded-md px-1 text-xs hover:bg-white disabled:opacity-50"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  type="url"
                  value={form.newImage}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, newImage: e.target.value }))
                  }
                  disabled={isLoading}
                  placeholder="https://image.url"
                  className="flex-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900/10 outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={addImage}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-gray-800 transition disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl border text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Listing
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ListingForm;
