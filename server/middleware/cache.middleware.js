// Simple in-memory cache middleware
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const cacheMiddleware = (duration = CACHE_TTL) => {
  return (req, res, next) => {
    const key = `${req.method}:${req.originalUrl}`;
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < duration) {
      console.log(`✅ Cache hit for ${key}`);
      return res.json(cached.data);
    }
    
    // Store original res.json
    const originalJson = res.json;
    
    res.json = function(data) {
      // Cache successful responses
      if (res.statusCode === 200) {
        cache.set(key, {
          data,
          timestamp: Date.now()
        });
        console.log(`💾 Cached ${key}`);
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Clear cache when data changes
export const clearCache = (pattern) => {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
  console.log(`🗑️ Cache cleared for pattern: ${pattern || 'all'}`);
};
