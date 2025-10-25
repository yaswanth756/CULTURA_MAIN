import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { MapPin, Star, CheckCircle2, Camera, PhoneCall, Info } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import axios from 'axios';
import { buildApiUrl } from '../../utils/api';

// --- Google Maps View Component ---
const MapView = ({ listing }) => {
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const geocodeCacheRef = useRef(new window.Map());
  const serviceAreas = listing?.serviceAreas || [];
  const map = useMap();

  // Fallback center (India or listing location)
  const fallbackCenter = useMemo(() => {
    if (listing?.location?.lat && listing?.location?.lng) {
      return { lat: listing.location.lat, lng: listing.location.lng };
    }
    return { lat: 20.5937, lng: 78.9629 }; // India
  }, [listing?.location?.lat, listing?.location?.lng]);

  const [mapCenter, setMapCenter] = useState(fallbackCenter);
  const [mapZoom, setMapZoom] = useState(5);

  // Geocode service areas using Google Geocoding API
  useEffect(() => {
    let stopped = false;
    const cache = geocodeCacheRef.current;

    const geocode = async (name) => {
      if (cache.has(name)) return cache.get(name);
      
      if (!window.google?.maps?.Geocoder) return null;
      
      const geocoder = new window.google.maps.Geocoder();
      
      return new Promise((resolve) => {
        geocoder.geocode({ address: name }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            const location = results[0].geometry.location;
            const hit = { 
              name, 
              lat: location.lat(), 
              lng: location.lng() 
            };
            cache.set(name, hit);
            resolve(hit);
          } else {
            resolve(null);
          }
        });
      });
    };

    (async () => {
      const out = [];
      for (const area of serviceAreas) {
        if (stopped) return;
        try {
          const hit = await geocode(area);
          if (stopped) return;
          if (hit) out.push(hit);
        } catch (_) {
          // Handle errors silently
        }
        // Small delay to respect rate limits
        await new Promise((r) => setTimeout(r, 300));
      }
      
      if (!stopped && out.length > 0) {
        setMarkers(out);
        
        // Auto-fit bounds
        if (map && window.google?.maps?.LatLngBounds) {
          if (out.length === 1) {
            setMapCenter({ lat: out[0].lat, lng: out[0].lng });
            setMapZoom(12);
          } else if (out.length > 1) {
            const bounds = new window.google.maps.LatLngBounds();
            out.forEach(m => bounds.extend({ lat: m.lat, lng: m.lng }));
            
            // Calculate center
            const center = bounds.getCenter();
            setMapCenter({ lat: center.lat(), lng: center.lng() });
            
            // Calculate zoom level
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();
            const latDiff = Math.abs(ne.lat() - sw.lat());
            const lngDiff = Math.abs(ne.lng() - sw.lng());
            const maxDiff = Math.max(latDiff, lngDiff);
            
            let zoom = 12;
            if (maxDiff > 10) zoom = 5;
            else if (maxDiff > 5) zoom = 7;
            else if (maxDiff > 2) zoom = 9;
            else if (maxDiff > 1) zoom = 10;
            
            setMapZoom(zoom);
          }
        }
      }
    })();

    return () => {
      stopped = true;
    };
  }, [serviceAreas, map]);

  return (
    <div className="w-full h-64 lg:h-80 rounded-lg overflow-hidden ring-1 ring-slate-200 bg-white">
      <Map
        mapId="bf51a910020fa25a"
        center={mapCenter}
        zoom={mapZoom}
        gestureHandling="greedy"
        disableDefaultUI={false}
        style={{ width: '100%', height: '100%' }}
      >
        {markers.map((marker, index) => (
          <AdvancedMarker
            key={`${marker.name}-${index}`}
            position={{ lat: marker.lat, lng: marker.lng }}
            onClick={() => setSelectedMarker(marker)}
          >
            <Pin
              background="#0ea5e9"
              borderColor="#0284c7"
              glyphColor="#ffffff"
            />
          </AdvancedMarker>
        ))}

        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2">
              <h3 className="font-semibold text-sm text-slate-900">{selectedMarker.name}</h3>
            </div>
          </InfoWindow>
        )}
      </Map>
    </div>
  );
};

// 🔥 Dynamic Reviews Component
const ReviewsSection = ({ listingId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!listingId) return;
      
      try {
        setLoading(true);
        const response = await axios.get(
          buildApiUrl(`/api/reviews/listing/${listingId}?page=1&limit=5`)
        );
        
        if (response.data.success) {
          setReviews(response.data.data.reviews || []);
          setPagination(response.data.data.pagination);
        } else {
          setError('Failed to load reviews');
        }
      } catch (err) {
        console.error('Reviews fetch error:', err);
        setError('Failed to load reviews');
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [listingId]);

  const getInitials = (firstName) => {
    if (!firstName) return 'U';
    return firstName.charAt(0).toUpperCase();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  const StarRating = ({ rating }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-slate-300'
          }`}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <section className="bg-white rounded-xl ring-1 ring-slate-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Reviews</h2>
          <div className="mt-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-slate-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-slate-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl ring-1 ring-slate-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Reviews</h2>
          {pagination && pagination.totalReviews > 0 && (
            <div className="text-sm text-slate-500">
              Showing {Math.min(pagination.totalReviews, 5)} of {pagination.totalReviews} reviews
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No reviews yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Be the first to share your experience with this service provider!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-slate-100 last:border-b-0 pb-6 last:pb-0">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {getInitials(review.customerId?.profile?.firstName)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-slate-900">
                          {review.customerId?.profile?.firstName || 'Anonymous'}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <StarRating rating={review.rating} />
                          <span className="text-xs text-slate-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="prose prose-sm prose-slate max-w-none">
                      <p className="text-slate-700 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>

                    {review.helpfulVotes > 0 && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{review.helpfulVotes} people found this helpful</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {pagination && pagination.hasNext && (
              <div className="text-center pt-4">
                <button className="px-6 py-2 text-sm text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                  View more reviews ({pagination.totalReviews - reviews.length} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

// --- Main Listing Content Component ---
const ListingContent = ({ listing }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const ImagePlaceholder = ({ className }) => (
    <div className={`bg-slate-100 flex items-center justify-center ${className}`}>
      <div className="text-center text-slate-400">
        <Camera className="w-12 h-12 mx-auto mb-2" />
        <p className="text-sm">No image available</p>
      </div>
    </div>
  );

  const SafeImage = ({ src, alt, className, ...props }) => {
    if (!src || src.trim() === '') {
      return <ImagePlaceholder className={className} />;
    }
    return (
      <>
        <img
          src={src}
          alt={alt}
          className={className}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const sib = e.currentTarget.nextElementSibling;
            if (sib) sib.classList.remove('hidden');
          }}
          {...props}
        />
        <ImagePlaceholder className="w-full h-72 lg:h-full hidden" />
      </>
    );
  };

  useEffect(() => {
    if (!listing?.images?.length) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') {
        setCurrentImageIndex((i) => (i + 1) % listing.images.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((i) => (i - 1 + listing.images.length) % listing.images.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [listing?.images?.length]);

  const Section = ({ title, children, className = '' }) => (
    <section className={`bg-white rounded-xl ring-1 ring-slate-200 ${className}`}>
      <div className="p-6">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
        <div className="mt-3 text-slate-600 leading-relaxed">{children}</div>
      </div>
    </section>
  );

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <div className="space-y-8">
        {/* Image Gallery */}
        <div className="flex flex-col lg:flex-row gap-3 h-auto lg:h-[420px]">
          <div className="lg:w-2/3 relative overflow-hidden rounded-xl shadow-lg">
            {listing.images && listing.images.length > 0 ? (
              <SafeImage
                className="w-full h-72 lg:h-full object-cover transition-transform duration-300 hover:scale-105"
                src={listing.images[currentImageIndex]}
                alt={`${listing.title} image ${currentImageIndex + 1}`}
                loading="lazy"
              />
            ) : (
              <ImagePlaceholder className="w-full h-72 lg:h-full" />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-white text-2xl lg:text-3xl font-bold">{listing.title}</h1>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-white/90 text-sm">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{listing.ratings?.average || 0}</span>
                  <span>({listing.ratings?.count || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">{(listing.serviceAreas || []).join(', ')}</span>
                </div>
              </div>
            </div>
            {listing.images && listing.images.length > 0 && (
              <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                {currentImageIndex + 1}/{listing.images.length}
              </div>
            )}
          </div>

          {listing.images && listing.images.length > 1 && (
            <div className="lg:w-1/3 flex flex-row lg:flex-col gap-2">
              {listing.images.map((image, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`relative overflow-hidden rounded-lg h-28 lg:h-1/2 flex-1 group transition-all duration-200 ${
                    idx === currentImageIndex ? 'ring-2 ring-slate-900 ring-offset-2' : 'hover:ring-1 hover:ring-slate-300'
                  }`}
                  onClick={() => setCurrentImageIndex(idx)}
                  aria-label={`View image ${idx + 1}`}
                >
                  <SafeImage
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    src={image}
                    alt={`thumbnail ${idx + 1}`}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Assistance banner */}
        <div className="p-4 rounded-xl ring-1 ring-slate-200 bg-slate-50 flex items-start gap-3">
          <div className="shrink-0 mt-0.5 text-slate-500">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div className="text-sm leading-relaxed text-slate-700">
            After booking, coordinators call within 10–15 minutes to confirm details and assist end‑to‑end.
          </div>
        </div>

        {/* About */}
        <Section title="About this service">
          <p>{listing.description}</p>
        </Section>

        {/* Reviews */}
        <ReviewsSection listingId={listing._id} />

        {/* Service Location with Google Maps */}
        <section className="bg-white rounded-xl ring-1 ring-slate-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Service Location</h2>
            <div className="mt-3">
              <MapView listing={listing} />
              <p className="mt-2 text-xs text-slate-500">
                Map displays service areas. Click markers for details.
              </p>
            </div>
          </div>
        </section>

        {/* Service coverage note */}
        <section className="bg-white rounded-xl">
          <div className="p-4">
            <div className="flex items-start gap-3 text-sm">
              <Info className="w-4 h-4 mt-0.5" />
              <p className="text-slate-700">
                We provide comprehensive services inside the highlighted areas anywhere, and additional locations may be available on request; travel charges may apply.
              </p>
            </div>
          </div>
        </section>
      </div>
    </APIProvider>
  );
};

export default ListingContent;