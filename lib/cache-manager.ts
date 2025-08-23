import { supabase } from './supabase'

// Cache configuration
const CACHE_CONFIG = {
  // Cache TTL settings (in milliseconds)
  ttl: {
    products: 5 * 60 * 1000, // 5 minutes
    assets: 10 * 60 * 1000, // 10 minutes
    heroImages: 15 * 60 * 1000, // 15 minutes
    orders: 2 * 60 * 1000, // 2 minutes
    userData: 30 * 60 * 1000, // 30 minutes
    static: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // Maximum cache sizes
  maxSize: {
    products: 100,
    assets: 50,
    heroImages: 20,
    orders: 50,
    userData: 10,
    static: 200,
  }
}

// Cache entry interface
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  size: number
}

// Cache manager class
class CacheManager {
  private caches = new Map<string, Map<string, CacheEntry<any>>>()
  private storagePrefix = 'dopetech_cache_'
  
  constructor() {
    this.initializeCaches()
    this.setupCleanup()
  }
  
  // Initialize cache maps
  private initializeCaches(): void {
    Object.keys(CACHE_CONFIG.maxSize).forEach(cacheName => {
      this.caches.set(cacheName, new Map())
    })
  }
  
  // Set cache entry
  set<T>(cacheName: string, key: string, data: T, ttl?: number): void {
    const cache = this.caches.get(cacheName)
    if (!cache) return
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || CACHE_CONFIG.ttl[cacheName as keyof typeof CACHE_CONFIG.ttl] || 60000,
      size: this.calculateSize(data)
    }
    
    // Check cache size limit
    if (cache.size >= CACHE_CONFIG.maxSize[cacheName as keyof typeof CACHE_CONFIG.maxSize]) {
      this.evictOldest(cacheName)
    }
    
    cache.set(key, entry)
    
    // Also store in localStorage for persistence
    this.setLocalStorage(cacheName, key, entry)
  }
  
  // Get cache entry
  get<T>(cacheName: string, key: string): T | null {
    const cache = this.caches.get(cacheName)
    if (!cache) return null
    
    // Check memory cache first
    const entry = cache.get(key)
    if (entry && !this.isExpired(entry)) {
      return entry.data
    }
    
    // Check localStorage
    const localEntry = this.getLocalStorage(cacheName, key)
    if (localEntry && !this.isExpired(localEntry)) {
      // Restore to memory cache
      cache.set(key, localEntry)
      return localEntry.data
    }
    
    // Remove expired entries
    if (entry) cache.delete(key)
    this.removeLocalStorage(cacheName, key)
    
    return null
  }
  
  // Check if entry is expired
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }
  
  // Calculate data size (rough estimation)
  private calculateSize(data: any): number {
    return JSON.stringify(data).length
  }
  
  // Evict oldest entry from cache
  private evictOldest(cacheName: string): void {
    const cache = this.caches.get(cacheName)
    if (!cache || cache.size === 0) return
    
    let oldestKey: string | null = null
    let oldestTime = Date.now()
    
    for (const [key, entry] of cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }
    
    if (oldestKey) {
      cache.delete(oldestKey)
      this.removeLocalStorage(cacheName, oldestKey)
    }
  }
  
  // Clear specific cache
  clear(cacheName: string): void {
    const cache = this.caches.get(cacheName)
    if (cache) {
      cache.clear()
    }
    this.clearLocalStorage(cacheName)
  }
  
  // Clear all caches
  clearAll(): void {
    this.caches.forEach((cache, name) => {
      cache.clear()
      this.clearLocalStorage(name)
    })
  }
  
  // Get cache statistics
  getStats(): Record<string, { size: number; maxSize: number }> {
    const stats: Record<string, { size: number; maxSize: number }> = {}
    
    this.caches.forEach((cache, name) => {
      stats[name] = {
        size: cache.size,
        maxSize: CACHE_CONFIG.maxSize[name as keyof typeof CACHE_CONFIG.maxSize]
      }
    })
    
    return stats
  }
  
  // LocalStorage methods
  private setLocalStorage(cacheName: string, key: string, entry: CacheEntry<any>): void {
    try {
      const storageKey = `${this.storagePrefix}${cacheName}_${key}`
      localStorage.setItem(storageKey, JSON.stringify(entry))
    } catch (error) {
      // localStorage might be full or disabled
      console.warn('Failed to store cache in localStorage:', error)
    }
  }
  
  private getLocalStorage(cacheName: string, key: string): CacheEntry<any> | null {
    try {
      const storageKey = `${this.storagePrefix}${cacheName}_${key}`
      const data = localStorage.getItem(storageKey)
      return data ? JSON.parse(data) : null
    } catch (error) {
      return null
    }
  }
  
  private removeLocalStorage(cacheName: string, key: string): void {
    try {
      const storageKey = `${this.storagePrefix}${cacheName}_${key}`
      localStorage.removeItem(storageKey)
    } catch (error) {
      // Ignore errors
    }
  }
  
  private clearLocalStorage(cacheName: string): void {
    try {
      const keys = Object.keys(localStorage)
      const prefix = `${this.storagePrefix}${cacheName}_`
      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      // Ignore errors
    }
  }
  
  // Setup automatic cleanup
  private setupCleanup(): void {
    if (typeof window !== 'undefined') {
      // Clean up expired entries every minute
      setInterval(() => {
        this.cleanup()
      }, 60 * 1000)
      
      // Clean up on page unload
      window.addEventListener('beforeunload', () => {
        this.cleanup()
      })
    }
  }
  
  // Clean up expired entries
  cleanup(): void {
    this.caches.forEach((cache, cacheName) => {
      for (const [key, entry] of cache.entries()) {
        if (this.isExpired(entry)) {
          cache.delete(key)
          this.removeLocalStorage(cacheName, key)
        }
      }
    })
  }
}

// Global cache manager instance
export const cacheManager = new CacheManager()

// Cache-aware data fetching utilities
export async function cachedFetch<T>(
  cacheName: string,
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Check cache first
  const cached = cacheManager.get<T>(cacheName, key)
  if (cached !== null) {
    return cached
  }
  
  // Fetch fresh data
  const data = await fetchFn()
  
  // Cache the result
  cacheManager.set(cacheName, key, data, ttl)
  
  return data
}

// Products cache utilities
export async function getCachedProducts(): Promise<any[]> {
  return cachedFetch('products', 'all', async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  })
}

export async function getCachedProduct(id: string): Promise<any | null> {
  return cachedFetch('products', `product_${id}`, async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  })
}

// Assets cache utilities
export async function getCachedAssets(): Promise<any[]> {
  return cachedFetch('assets', 'all', async () => {
    const { data: files, error } = await supabase.storage
      .from('assets')
      .list('', { limit: 100 })
    
    if (error) throw error
    return files || []
  })
}

// Hero images cache utilities
export async function getCachedHeroImages(): Promise<any[]> {
  return cachedFetch('heroImages', 'all', async () => {
    const { data, error } = await supabase
      .from('hero_images')
      .select('*')
      .order('order_index', { ascending: true })
    
    if (error) throw error
    return data || []
  })
}

// Orders cache utilities
export async function getCachedOrders(): Promise<any[]> {
  return cachedFetch('orders', 'all', async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  })
}

// Cache invalidation utilities
export function invalidateCache(cacheName: string, key?: string): void {
  if (key) {
    const cache = cacheManager.caches.get(cacheName)
    if (cache) {
      cache.delete(key)
    }
  } else {
    cacheManager.clear(cacheName)
  }
}

export function invalidateProductCache(productId?: string): void {
  if (productId) {
    invalidateCache('products', `product_${productId}`)
  }
  invalidateCache('products', 'all')
}

export function invalidateAssetsCache(): void {
  cacheManager.clear('assets')
}

export function invalidateHeroImagesCache(): void {
  cacheManager.clear('heroImages')
}

export function invalidateOrdersCache(): void {
  cacheManager.clear('orders')
}

// Cache warming utilities
export async function warmCache(): Promise<void> {
  try {
    // Warm up critical caches in parallel
    await Promise.all([
      getCachedProducts(),
      getCachedHeroImages(),
      getCachedAssets()
    ])
    
    console.log('Cache warmed successfully')
  } catch (error) {
    console.error('Failed to warm cache:', error)
  }
}

// Export cache manager for direct access
export { cacheManager as cache }
