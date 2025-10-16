# Client Production Optimization Guide

## ✅ What's Already Optimized

### Vite Build Configuration
- ✅ Code splitting (manual chunks)
- ✅ Tree shaking
- ✅ Minification (Terser)
- ✅ Console.log removal in production
- ✅ Asset organization
- ✅ Modern ES2015 target
- ✅ CSS code splitting

---

## 🚀 Build for Production

### 1. Install New Dependencies
```bash
cd client
npm install
```

### 2. Build Production Bundle
```bash
# Standard build
npm run build

# Build with bundle analyzer
npm run build:analyze
```

### 3. Preview Production Build Locally
```bash
npm run preview:build
```

---

## 📊 Bundle Analysis

After running `npm run build:analyze`, check:
- **dist/stats.html** - Visual bundle size breakdown
- Look for:
  - Large chunks (>500KB)
  - Duplicate dependencies
  - Unused libraries

### Good Bundle Sizes:
- **react-vendor.js:** ~150-200KB (gzipped)
- **ui-vendor.js:** ~100-150KB (gzipped)
- **maps-charts.js:** ~200-300KB (gzipped)
- **utils.js:** ~50-100KB (gzipped)
- **main.js:** <100KB (gzipped)

---

## 🎯 Performance Optimizations to Apply

### 1. Image Optimization

#### Current Issue:
- Large images slow down page load
- No lazy loading
- No modern formats (WebP)

#### Solutions:

**A. Optimize Images Before Upload**
```bash
# Install imagemagick
brew install imagemagick

# Convert to WebP
convert image.jpg -quality 80 image.webp

# Resize
convert image.jpg -resize 1920x1080 image-optimized.jpg
```

**B. Use `<picture>` for Modern Formats**
```jsx
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="Description" loading="lazy" />
</picture>
```

**C. Lazy Load Images**
```jsx
<img 
  src={imageUrl} 
  alt="Description"
  loading="lazy"  // Native lazy loading
  decoding="async"
/>
```

---

### 2. Code Splitting & Lazy Loading

#### Route-Based Code Splitting

**Before (loads everything upfront):**
```jsx
import HomePage from './pages/HomePage'
import ListingsPage from './pages/ListingsPage'
```

**After (loads on demand):**
```jsx
import { lazy, Suspense } from 'react'

const HomePage = lazy(() => import('./pages/HomePage'))
const ListingsPage = lazy(() => import('./pages/ListingsPage'))
const VendorDashboard = lazy(() => import('./vendor/Dashboard'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/vendor/*" element={<VendorDashboard />} />
      </Routes>
    </Suspense>
  )
}
```

#### Component-Based Code Splitting

```jsx
// Heavy components (maps, charts)
const MapComponent = lazy(() => import('./components/Map'))
const ChartComponent = lazy(() => import('./components/Chart'))

// Use with Suspense
<Suspense fallback={<div>Loading map...</div>}>
  {showMap && <MapComponent />}
</Suspense>
```

---

### 3. React Performance Optimizations

#### A. Memoization

**Use React.memo for expensive components:**
```jsx
import { memo } from 'react'

const ListingCard = memo(({ listing }) => {
  return (
    <div>
      {/* Component content */}
    </div>
  )
})

export default ListingCard
```

**Use useMemo for expensive calculations:**
```jsx
import { useMemo } from 'react'

function ListingsPage({ listings }) {
  const filteredListings = useMemo(() => {
    return listings.filter(l => l.price < 50000)
  }, [listings])  // Only recalculate when listings change
  
  return <div>{/* render */}</div>
}
```

**Use useCallback for functions:**
```jsx
import { useCallback } from 'react'

function SearchBar({ onSearch }) {
  const handleSearch = useCallback((query) => {
    onSearch(query)
  }, [onSearch])
  
  return <input onChange={handleSearch} />
}
```

#### B. Virtualization for Long Lists

**Install react-window:**
```bash
npm install react-window
```

**Use for 100+ items:**
```jsx
import { FixedSizeList } from 'react-window'

function ListingsList({ listings }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ListingCard listing={listings[index]} />
    </div>
  )
  
  return (
    <FixedSizeList
      height={800}
      itemCount={listings.length}
      itemSize={200}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

---

### 4. API Request Optimization

#### A. Request Debouncing

```jsx
import { useState, useEffect } from 'react'
import { debounce } from 'lodash'

function SearchBar() {
  const [query, setQuery] = useState('')
  
  const debouncedSearch = debounce((value) => {
    // API call here
    fetch(`/api/listings?q=${value}`)
  }, 500)  // Wait 500ms after user stops typing
  
  useEffect(() => {
    if (query) debouncedSearch(query)
  }, [query])
  
  return <input onChange={(e) => setQuery(e.target.value)} />
}
```

#### B. Request Caching (SWR or React Query)

**Install SWR:**
```bash
npm install swr
```

**Use SWR for automatic caching:**
```jsx
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then(r => r.json())

function Listings() {
  const { data, error, isLoading } = useSWR('/api/listings', fetcher, {
    revalidateOnFocus: false,  // Don't refetch on tab focus
    dedupingInterval: 60000,   // Cache for 1 minute
  })
  
  if (isLoading) return <Loading />
  if (error) return <Error />
  
  return <div>{/* render data */}</div>
}
```

#### C. Prefetching

```jsx
import { useEffect } from 'react'

function HomePage() {
  useEffect(() => {
    // Prefetch listings page data
    fetch('/api/listings?page=1&limit=12')
      .then(r => r.json())
      .then(data => {
        // Store in cache or state management
      })
  }, [])
  
  return <div>Home Page</div>
}
```

---

### 5. Font Optimization

#### A. Preload Critical Fonts

**In index.html:**
```html
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- Preload critical font -->
  <link rel="preload" 
        href="/fonts/your-font.woff2" 
        as="font" 
        type="font/woff2" 
        crossorigin>
</head>
```

#### B. Use System Fonts (Fastest)

**In tailwind.config.js:**
```js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ]
      }
    }
  }
}
```

---

### 6. CSS Optimization

#### A. Remove Unused Tailwind Classes

**Already configured in tailwind.config.js:**
```js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Tailwind automatically purges unused classes
}
```

#### B. Critical CSS Inline

For above-the-fold content, inline critical CSS in index.html

---

### 7. Third-Party Script Optimization

#### A. Lazy Load Analytics

```jsx
// Load Google Analytics only after page interactive
useEffect(() => {
  if (typeof window !== 'undefined') {
    const script = document.createElement('script')
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_ID'
    script.async = true
    document.body.appendChild(script)
  }
}, [])
```

#### B. Defer Non-Critical Scripts

```html
<script src="script.js" defer></script>
```

---

## 📱 Progressive Web App (PWA)

### Add Service Worker for Offline Support

**Install vite-plugin-pwa:**
```bash
npm install -D vite-plugin-pwa
```

**Update vite.config.js:**
```js
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Cultura',
        short_name: 'Cultura',
        description: 'Event booking platform',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

---

## 🌐 Deployment Options

### Option A: Vercel (Recommended - Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd client
vercel

# Production
vercel --prod
```

**Features:**
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic builds on git push
- ✅ Preview deployments
- ✅ Free for personal projects

---

### Option B: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd client
npm run build
netlify deploy --prod --dir=dist
```

**Features:**
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Form handling
- ✅ Serverless functions
- ✅ Free tier

---

### Option C: AWS S3 + CloudFront

**Steps:**
1. Build: `npm run build`
2. Create S3 bucket
3. Enable static website hosting
4. Upload `dist/` folder
5. Create CloudFront distribution
6. Point domain to CloudFront

**Features:**
- ✅ Highly scalable
- ✅ Low cost
- ✅ Full control
- ❌ More setup required

---

### Option D: AWS Amplify

```bash
# Install Amplify CLI
npm i -g @aws-amplify/cli

# Initialize
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

---

## 🔍 Performance Testing

### 1. Lighthouse (Chrome DevTools)

```bash
# Open Chrome DevTools
# Go to Lighthouse tab
# Run audit
```

**Target Scores:**
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >90

### 2. WebPageTest

Visit: https://www.webpagetest.org
- Test from multiple locations
- Check Time to Interactive (TTI)
- Check First Contentful Paint (FCP)

### 3. Bundle Size Check

```bash
# After build
npm run build

# Check sizes
ls -lh dist/assets/js/
```

---

## 📋 Pre-Deployment Checklist

### Environment Variables
- [ ] Create `.env.production`
- [ ] Set `VITE_API_URL=https://api.yourdomain.com`
- [ ] Set `VITE_STRIPE_PUBLIC_KEY=pk_live_...`

### Build & Test
- [ ] Run `npm run build`
- [ ] Test with `npm run preview`
- [ ] Check bundle sizes
- [ ] Test all routes work
- [ ] Test API calls work

### Performance
- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] Code splitting done
- [ ] Fonts optimized
- [ ] Lighthouse score >90

### SEO
- [ ] Meta tags in index.html
- [ ] Open Graph tags
- [ ] Sitemap.xml
- [ ] robots.txt

### Security
- [ ] No API keys in code
- [ ] HTTPS enabled
- [ ] CSP headers
- [ ] XSS protection

---

## 🎯 Performance Targets

### Load Times:
- **First Contentful Paint:** <1.5s
- **Time to Interactive:** <3.5s
- **Largest Contentful Paint:** <2.5s

### Bundle Sizes:
- **Initial JS:** <200KB (gzipped)
- **Total JS:** <500KB (gzipped)
- **CSS:** <50KB (gzipped)

### Lighthouse Scores:
- **Performance:** >90
- **Accessibility:** >90
- **Best Practices:** >90
- **SEO:** >90

---

## 🔧 Quick Wins (Do These First)

1. **Add lazy loading to images** - 5 minutes
2. **Implement route-based code splitting** - 15 minutes
3. **Add React.memo to list components** - 10 minutes
4. **Enable compression in build** - Already done ✅
5. **Remove console.logs** - Already done ✅
6. **Optimize images** - 30 minutes
7. **Deploy to Vercel/Netlify** - 10 minutes

---

## 📚 Resources

- **Vite Docs:** https://vitejs.dev
- **React Performance:** https://react.dev/learn/render-and-commit
- **Web.dev Performance:** https://web.dev/performance
- **Lighthouse:** https://developers.google.com/web/tools/lighthouse
