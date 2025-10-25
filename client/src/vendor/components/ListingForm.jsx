// src/vendor/components/ListingForm.jsx
import React, { useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { buildApiUrl } from "../../utils/api";
import { toast } from "react-toastify";
import {
  X,
  Save,
  MapPin,
  Image as ImageIcon,
  FileText,
  Package,
  IndianRupee,
  Layers,
  Upload,
  Trash2,
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
    serviceAreas: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Single file upload
  const handleSingleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = localStorage.getItem("vendorToken");
    
    const response = await axios.post(
      buildApiUrl('/api/upload/single'),
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data.url;
  };

  // Multiple files upload
  const handleMultipleFilesUpload = async (files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });
    
    const token = localStorage.getItem("vendorToken");
    
    const response = await axios.post(
      buildApiUrl('/api/upload/multiple'),
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data.urls.map(item => item.url);
  };

  // Handle file input change
  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadLoading(true);

    try {
      let newUrls = [];

      if (files.length === 1) {
        const url = await handleSingleFileUpload(files[0]);
        newUrls = [url];
      } else {
        newUrls = await handleMultipleFilesUpload(files);
      }

      setForm((p) => ({ 
        ...p, 
        images: [...p.images, ...newUrls] 
      }));

      toast.success(`${files.length} image(s) uploaded successfully!`);
      e.target.value = '';

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 'Upload failed';
      toast.error(errorMessage);
    } finally {
      setUploadLoading(false);
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
        features: [], // Silent - empty array
        tags: [], // Silent - empty array
      };
      
      const token = localStorage.getItem("vendorToken");
      
      const response = await axios.post(
        buildApiUrl('/api/vendor/listings'),
        listingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Listing created successfully!");
        
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
        <div className="pointer-events-auto bg-white w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
            <h4 className="font-semibold text-gray-900 text-lg">Add New Listing</h4>
            <button
              onClick={onCancel}
              disabled={isLoading || uploadLoading}
              className="p-2 rounded-full hover:bg-gray-200 transition disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Form - Scrollable */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
            {/* Basic info */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
                  <Package className="w-4 h-4 text-gray-500" /> Title *
                </label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  disabled={isLoading || uploadLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none disabled:opacity-50 disabled:bg-gray-50"
                  placeholder="Cinematic Wedding Photography"
                  maxLength={150}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
                  <Layers className="w-4 h-4 text-gray-500" /> Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, category: e.target.value }))
                  }
                  disabled={isLoading || uploadLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none disabled:opacity-50 disabled:bg-gray-50"
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
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Subcategory *
                </label>
                <input
                  value={form.subcategory}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, subcategory: e.target.value }))
                  }
                  disabled={isLoading || uploadLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none disabled:opacity-50 disabled:bg-gray-50"
                  placeholder="wedding, reception, sangeet…"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
                    <IndianRupee className="w-4 h-4 text-gray-500" /> Price *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.priceBase}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, priceBase: e.target.value }))
                    }
                    disabled={isLoading || uploadLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none disabled:opacity-50 disabled:bg-gray-50"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Price Type *
                  </label>
                  <select
                    value={form.priceType}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, priceType: e.target.value }))
                    }
                    disabled={isLoading || uploadLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none disabled:opacity-50 disabled:bg-gray-50"
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
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
                <FileText className="w-4 h-4 text-gray-500" /> Description *
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                disabled={isLoading || uploadLoading}
                maxLength={1000}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none disabled:opacity-50 disabled:bg-gray-50 resize-none"
                placeholder="Describe your service, what's included, packages available…"
              />
              <div className="text-xs text-gray-500 mt-1">
                {form.description.length}/1000 characters
              </div>
            </div>

            {/* Service Areas */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
                <MapPin className="w-4 h-4 text-gray-500" /> Service Areas
              </label>
              <input
                value={form.serviceAreas}
                onChange={(e) =>
                  setForm((p) => ({ ...p, serviceAreas: e.target.value }))
                }
                disabled={isLoading || uploadLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none disabled:opacity-50 disabled:bg-gray-50"
                placeholder="Hyderabad, Secunderabad, Gachibowli"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple areas with commas
              </p>
            </div>

            {/* Images Upload Section */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-3">
                <ImageIcon className="w-4 h-4 text-gray-500" /> 
                Images ({form.images.length})
              </label>

              {/* File Upload Button */}
              <div className="mb-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isLoading || uploadLoading}
                    className="hidden"
                  />
                  <div className={`
                    inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed 
                    transition-colors text-sm font-medium
                    ${uploadLoading 
                      ? 'border-blue-300 bg-blue-50 text-blue-600 cursor-not-allowed' 
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 cursor-pointer'
                    }
                  `}>
                    {uploadLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Images
                      </>
                    )}
                  </div>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Select multiple files. Max 10MB per file. JPG, PNG supported.
                </p>
              </div>

              {/* Image Preview Grid */}
              {form.images.length > 0 && (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {form.images.map((src, i) => (
                    <div
                      key={i}
                      className="relative group aspect-square rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-gray-100 hover:shadow-md transition-shadow"
                    >
                      <img 
                        src={src} 
                        alt={`Upload ${i + 1}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="12">Error</text></svg>';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        disabled={isLoading || uploadLoading}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50 shadow-md"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {form.images.length === 0 && (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                  <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No images uploaded yet</p>
                  <p className="text-xs text-gray-400 mt-1">Upload images to showcase your service</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center  justify-center sm:justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading || uploadLoading}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || uploadLoading}
                className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Create Listing
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
