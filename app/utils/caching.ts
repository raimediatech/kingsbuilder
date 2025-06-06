/**
 * Utility functions for caching strategies
 */

/**
 * Cache storage options
 */
export type CacheStorage = 'memory' | 'localStorage' | 'sessionStorage';

/**
 * Cache item with expiration
 */
interface CacheItem<T> {
  value: T;
  expiry: number | null; // Timestamp in milliseconds or null for no expiration
}

/**
 * Memory cache storage
 */
const memoryCache: Map<string, CacheItem<any>> = new Map();

/**
 * Set a value in the cache
 * @param key Cache key
 * @param value Value to cache
 * @param expiryInSeconds Expiry time in seconds (0 or null for no expiration)
 * @param storage Cache storage type
 * @returns Boolean indicating success
 */
export function setCacheValue<T>(
  key: string,
  value: T,
  expiryInSeconds: number | null = 3600, // Default: 1 hour
  storage: CacheStorage = 'memory'
): boolean {
  if (!key) return false;
  
  const expiry = expiryInSeconds ? Date.now() + expiryInSeconds * 1000 : null;
  const cacheItem: CacheItem<T> = { value, expiry };
  
  try {
    switch (storage) {
      case 'localStorage':
        if (typeof window === 'undefined') return false;
        localStorage.setItem(key, JSON.stringify(cacheItem));
        break;
        
      case 'sessionStorage':
        if (typeof window === 'undefined') return false;
        sessionStorage.setItem(key, JSON.stringify(cacheItem));
        break;
        
      case 'memory':
      default:
        memoryCache.set(key, cacheItem);
        break;
    }
    
    return true;
  } catch (e) {
    console.error('Error setting cache value:', e);
    return false;
  }
}

/**
 * Get a value from the cache
 * @param key Cache key
 * @param storage Cache storage type
 * @returns Cached value or null if not found or expired
 */
export function getCacheValue<T>(
  key: string,
  storage: CacheStorage = 'memory'
): T | null {
  if (!key) return null;
  
  try {
    let cacheItem: CacheItem<T> | null = null;
    
    switch (storage) {
      case 'localStorage':
        if (typeof window === 'undefined') return null;
        const lsItem = localStorage.getItem(key);
        cacheItem = lsItem ? JSON.parse(lsItem) : null;
        break;
        
      case 'sessionStorage':
        if (typeof window === 'undefined') return null;
        const ssItem = sessionStorage.getItem(key);
        cacheItem = ssItem ? JSON.parse(ssItem) : null;
        break;
        
      case 'memory':
      default:
        cacheItem = memoryCache.get(key) || null;
        break;
    }
    
    if (!cacheItem) return null;
    
    // Check if the item has expired
    if (cacheItem.expiry && cacheItem.expiry < Date.now()) {
      // Remove expired item
      removeCacheValue(key, storage);
      return null;
    }
    
    return cacheItem.value;
  } catch (e) {
    console.error('Error getting cache value:', e);
    return null;
  }
}

/**
 * Remove a value from the cache
 * @param key Cache key
 * @param storage Cache storage type
 * @returns Boolean indicating success
 */
export function removeCacheValue(
  key: string,
  storage: CacheStorage = 'memory'
): boolean {
  if (!key) return false;
  
  try {
    switch (storage) {
      case 'localStorage':
        if (typeof window === 'undefined') return false;
        localStorage.removeItem(key);
        break;
        
      case 'sessionStorage':
        if (typeof window === 'undefined') return false;
        sessionStorage.removeItem(key);
        break;
        
      case 'memory':
      default:
        memoryCache.delete(key);
        break;
    }
    
    return true;
  } catch (e) {
    console.error('Error removing cache value:', e);
    return false;
  }
}

/**
 * Clear all values from the cache
 * @param storage Cache storage type
 * @returns Boolean indicating success
 */
export function clearCache(storage: CacheStorage = 'memory'): boolean {
  try {
    switch (storage) {
      case 'localStorage':
        if (typeof window === 'undefined') return false;
        localStorage.clear();
        break;
        
      case 'sessionStorage':
        if (typeof window === 'undefined') return false;
        sessionStorage.clear();
        break;
        
      case 'memory':
      default:
        memoryCache.clear();
        break;
    }
    
    return true;
  } catch (e) {
    console.error('Error clearing cache:', e);
    return false;
  }
}

/**
 * Cache a function's result
 * @param fn Function to cache
 * @param keyFn Function to generate a cache key from the arguments
 * @param expiryInSeconds Expiry time in seconds (0 or null for no expiration)
 * @param storage Cache storage type
 * @returns Cached function
 */
export function cachify<T, Args extends any[]>(
  fn: (...args: Args) => T,
  keyFn: (...args: Args) => string = (...args) => JSON.stringify(args),
  expiryInSeconds: number | null = 3600,
  storage: CacheStorage = 'memory'
): (...args: Args) => T {
  return (...args: Args): T => {
    const cacheKey = keyFn(...args);
    const cachedValue = getCacheValue<T>(cacheKey, storage);
    
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    const result = fn(...args);
    setCacheValue(cacheKey, result, expiryInSeconds, storage);
    return result;
  };
}

/**
 * Cache headers for HTTP responses
 * @param maxAge Max age in seconds
 * @param staleWhileRevalidate Stale while revalidate in seconds
 * @param isPublic Whether the response is public or private
 * @returns Cache-Control header value
 */
export function getCacheControlHeader(
  maxAge: number = 3600,
  staleWhileRevalidate: number = 86400,
  isPublic: boolean = true
): string {
  return `${isPublic ? 'public' : 'private'}, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`;
}

/**
 * Generate ETag for content
 * @param content Content to generate ETag for
 * @returns ETag string
 */
export function generateETag(content: string): string {
  // Simple hash function for demo purposes
  // In production, use a proper hashing algorithm
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `"${hash.toString(16)}"`;
}