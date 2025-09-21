import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Star, CheckCircle2, Camera, PhoneCall, Info } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- Utility: Auto-fit map to markers ---
const AutoFit = ({ markers, fallbackCenter }) => {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 1) {
      const bounds = markers.reduce(
        (b, m) => b.extend([m.lat, m.lon]),
        L.latLngBounds([markers[0].lat, markers[0].lon], [markers[0].lat, markers[0].lon])
      );
      map.fitBounds(bounds, { padding: [32, 32] });
    } else if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lon], 12);
    } else {
      map.setView(fallbackCenter, 4);
    }
  }, [markers, fallbackCenter, map]);
  return null;
};

// --- Map View with client-side geocoding of serviceAreas (policy-friendly) ---
const MapView = ({ listing }) => {
  const [markers, setMarkers] = useState([]);
  const geocodeCacheRef = useRef(new Map());
  const serviceAreas = listing?.serviceAreas || [];

  // Prefer listing.location if provided; else India centroid as gentle default
  const fallbackCenter = useMemo(() => {
    if (listing?.location?.lat && listing?.location?.lng) return [listing.location.lat, listing.location.lng];
    return [20.5937, 78.9629]; // India
  }, [listing?.location?.lat, listing?.location?.lng]);

  useEffect(() => {
    let stopped = false;
    const controller = new AbortController();
    const cache = geocodeCacheRef.current;

    const geocode = async (name) => {
      if (cache.has(name)) return cache.get(name);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name)}&limit=1&addressdetails=0`;
      const res = await fetch(url, {
        headers: {
          // Identify the app per Nominatim policy
          'User-Agent': 'CulturaMain/1.0 (contact@yourdomain.example)',
          'Accept': 'application/json',
          'Referer': 'https://yourdomain.example'
        },
        signal: controller.signal
      });
      if (!res.ok) return null;
      const json = await res.json();
      if (!json?.length) return null;
      const hit = { name, lat: parseFloat(json[0].lat), lon: parseFloat(json[0].lon) };
      cache.set(name, hit);
      return hit;
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
          // swallow fetch abort or transient errors
        }
        // Respect public Nominatim limits: absolute max 1 r/s
        await new Promise((r) => setTimeout(r, 1000));
      }
      if (!stopped) setMarkers(out);
    })();

    return () => {
      stopped = true;
      controller.abort();
    };
  }, [serviceAreas]);

  return (
    <div className="w-full h-64 lg:h-80 rounded-lg overflow-hidden ring-1 ring-slate-200 bg-white">
      <MapContainer center={fallbackCenter} zoom={5} scrollWheelZoom className="w-full h-full">
        <TileLayer
          // OpenStreetMap default tiles + mandatory attribution
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />
        {markers.map((m, i) => (
          <CircleMarker
            key={`${m.name}-${i}`}
            center={[m.lat, m.lon]}
            radius={6}
            color="#0ea5e9"
            fillColor="#38bdf8"
            fillOpacity={0.6}
        >
            <Popup>{m.name}</Popup>
          </CircleMarker>
        ))}
        <AutoFit markers={markers} fallbackCenter={fallbackCenter} />
      </MapContainer>
    </div>
  );
};

// --- Listing Content (gallery kept unchanged) ---
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

  // Keyboard support for gallery (unchanged)
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
    <div className="space-y-8">
      {/* Image Gallery (UNCHANGED) */}
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
            {/* Highlighted service area chips */}
          </div>
          {listing.images && listing.images.length > 0 && (
            <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
              {currentImageIndex + 1}/{listing.images.length}
            </div>
          )}
        </div>
        {/* Thumbnails (UNCHANGED) */}
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

      {/* Assistance banner (clean, neutral) */}
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

      {/* Features */}
      {listing.features && listing.features.length > 0 && (
        <section className="bg-white rounded-xl ring-1 ring-slate-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">What's included</h2>
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {listing.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Reviews (lightweight cards with dividers) */}
      <section className="bg-white rounded-xl ring-1 ring-slate-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Reviews</h2>
          <div className="mt-4 divide-y divide-slate-200">
            {[1, 2, 3].map((r) => (
              <div key={r} className="py-4">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="Reviewer avatar"
                    className="w-10 h-10 rounded-full"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-medium text-slate-900">Priya Sharma</p>
                    <p className="text-xs text-slate-500">2 weeks ago</p>
                  </div>
                </div>
                <p className="text-slate-700">
                  Absolutely amazing work! The team was professional and captured every moment beautifully.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Location (real map) */}
      <section className="bg-white rounded-xl ring-1 ring-slate-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Service Location</h2>
          <div className="mt-3">
            <MapView listing={listing} />
            <p className="mt-2 text-xs text-slate-500">Map auto‑centers to the areas served.</p>
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
  );
};

export default ListingContent;
