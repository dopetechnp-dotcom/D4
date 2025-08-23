// Performance monitoring and optimization utilities

// Performance metrics tracking
interface PerformanceMetrics {
  pageLoadTime: number
  imageLoadTime: number
  dataTransferSize: number
  cacheHitRate: number
  supabaseRequests: number
  timestamp: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private startTime: number = 0
  private supabaseRequestCount: number = 0
  private cacheHits: number = 0
  private cacheMisses: number = 0

  startMonitoring(): void {
    this.startTime = performance.now()
  }

  recordPageLoad(): void {
    const loadTime = performance.now() - this.startTime
    this.metrics.push({
      pageLoadTime: loadTime,
      imageLoadTime: 0,
      dataTransferSize: 0,
      cacheHitRate: this.getCacheHitRate(),
      supabaseRequests: this.supabaseRequestCount,
      timestamp: Date.now()
    })
  }

  recordImageLoad(loadTime: number, size: number): void {
    const lastMetric = this.metrics[this.metrics.length - 1]
    if (lastMetric) {
      lastMetric.imageLoadTime += loadTime
      lastMetric.dataTransferSize += size
    }
  }

  recordSupabaseRequest(): void {
    this.supabaseRequestCount++
  }

  recordCacheHit(): void {
    this.cacheHits++
  }

  recordCacheMiss(): void {
    this.cacheMisses++
  }

  getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses
    return total > 0 ? (this.cacheHits / total) * 100 : 0
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  getAverageMetrics(): Partial<PerformanceMetrics> {
    if (this.metrics.length === 0) return {}

    const sum = this.metrics.reduce((acc, metric) => ({
      pageLoadTime: acc.pageLoadTime + metric.pageLoadTime,
      imageLoadTime: acc.imageLoadTime + metric.imageLoadTime,
      dataTransferSize: acc.dataTransferSize + metric.dataTransferSize,
      cacheHitRate: acc.cacheHitRate + metric.cacheHitRate,
      supabaseRequests: acc.supabaseRequests + metric.supabaseRequests
    }), {
      pageLoadTime: 0,
      imageLoadTime: 0,
      dataTransferSize: 0,
      cacheHitRate: 0,
      supabaseRequests: 0
    })

    const count = this.metrics.length
    return {
      pageLoadTime: sum.pageLoadTime / count,
      imageLoadTime: sum.imageLoadTime / count,
      dataTransferSize: sum.dataTransferSize / count,
      cacheHitRate: sum.cacheHitRate / count,
      supabaseRequests: sum.supabaseRequests / count
    }
  }

  reset(): void {
    this.metrics = []
    this.startTime = 0
    this.supabaseRequestCount = 0
    this.cacheHits = 0
    this.cacheMisses = 0
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Memory usage monitoring
export function getMemoryUsage(): {
  used: string
  total: string
  limit: string
} {
  if (typeof window === 'undefined' || !('memory' in performance)) {
    return {
      used: 'N/A',
      total: 'N/A',
      limit: 'N/A'
    }
  }

  const memory = (performance as any).memory
  return {
    used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
    total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
    limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`
  }
}

export function logMemoryUsage(): void {
  const memory = getMemoryUsage()
  console.log('Memory Usage:', {
    used: memory.used,
    total: memory.total,
    limit: memory.limit
  })
}

// Optimize images for different screen sizes
export function getOptimizedImageSrc(
  src: string,
  width: number,
  quality: number = 80
): string {
  // For static export, return original src
  // In a real app, you'd use a CDN or image optimization service
  return src
}

// Cache management
export class SimpleCache<T> {
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>()

  set(key: string, data: T, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Data transfer optimization
export class DataTransferOptimizer {
  private static instance: DataTransferOptimizer
  private compressionEnabled: boolean = true
  private batchSize: number = 10

  static getInstance(): DataTransferOptimizer {
    if (!DataTransferOptimizer.instance) {
      DataTransferOptimizer.instance = new DataTransferOptimizer()
    }
    return DataTransferOptimizer.instance
  }

  enableCompression(): void {
    this.compressionEnabled = true
  }

  disableCompression(): void {
    this.compressionEnabled = false
  }

  setBatchSize(size: number): void {
    this.batchSize = size
  }

  // Optimize data before sending
  optimizeData<T>(data: T): T {
    if (!this.compressionEnabled) return data

    // Remove unnecessary fields, compress strings, etc.
    return this.compressData(data)
  }

  private compressData<T>(data: T): T {
    // Simple compression: remove null/undefined values
    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        return data.map(item => this.compressData(item)) as T
      } else {
        const compressed: any = {}
        for (const [key, value] of Object.entries(data)) {
          if (value !== null && value !== undefined) {
            compressed[key] = this.compressData(value)
          }
        }
        return compressed as T
      }
    }
    return data
  }

  // Batch multiple requests
  async batchRequests<T>(
    requests: (() => Promise<T>)[]
  ): Promise<T[]> {
    const results: T[] = []
    
    for (let i = 0; i < requests.length; i += this.batchSize) {
      const batch = requests.slice(i, i + this.batchSize)
      const batchResults = await Promise.all(batch.map(req => req()))
      results.push(...batchResults)
    }
    
    return results
  }
}

// Lazy loading utilities
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    threshold: 0.1,
    rootMargin: '50px',
    ...options
  })
}

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Resource preloading
export function preloadResource(url: string, type: 'image' | 'script' | 'style'): void {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = url
  
  switch (type) {
    case 'image':
      link.as = 'image'
      break
    case 'script':
      link.as = 'script'
      break
    case 'style':
      link.as = 'style'
      break
  }
  
  document.head.appendChild(link)
}

// Performance monitoring hooks
export function usePerformanceMonitoring() {
  const startMonitoring = () => {
    performanceMonitor.startMonitoring()
  }

  const recordPageLoad = () => {
    performanceMonitor.recordPageLoad()
  }

  const recordImageLoad = (loadTime: number, size: number) => {
    performanceMonitor.recordImageLoad(loadTime, size)
  }

  const recordSupabaseRequest = () => {
    performanceMonitor.recordSupabaseRequest()
  }

  const recordCacheHit = () => {
    performanceMonitor.recordCacheHit()
  }

  const recordCacheMiss = () => {
    performanceMonitor.recordCacheMiss()
  }

  const getMetrics = () => {
    return performanceMonitor.getMetrics()
  }

  const getAverageMetrics = () => {
    return performanceMonitor.getAverageMetrics()
  }

  return {
    startMonitoring,
    recordPageLoad,
    recordImageLoad,
    recordSupabaseRequest,
    recordCacheHit,
    recordCacheMiss,
    getMetrics,
    getAverageMetrics
  }
}

// Data usage tracking
export class DataUsageTracker {
  private static instance: DataUsageTracker
  private totalBytesTransferred: number = 0
  private requests: Array<{ url: string; size: number; timestamp: number }> = []

  static getInstance(): DataUsageTracker {
    if (!DataUsageTracker.instance) {
      DataUsageTracker.instance = new DataUsageTracker()
    }
    return DataUsageTracker.instance
  }

  recordRequest(url: string, size: number): void {
    this.totalBytesTransferred += size
    this.requests.push({
      url,
      size,
      timestamp: Date.now()
    })

    // Keep only last 1000 requests
    if (this.requests.length > 1000) {
      this.requests = this.requests.slice(-1000)
    }
  }

  getTotalUsage(): number {
    return this.totalBytesTransferred
  }

  getUsageInMB(): number {
    return this.totalBytesTransferred / (1024 * 1024)
  }

  getUsageInGB(): number {
    return this.totalBytesTransferred / (1024 * 1024 * 1024)
  }

  getRequestsByDomain(): Record<string, number> {
    const domainUsage: Record<string, number> = {}
    
    this.requests.forEach(request => {
      try {
        const domain = new URL(request.url).hostname
        domainUsage[domain] = (domainUsage[domain] || 0) + request.size
      } catch {
        // Invalid URL, skip
      }
    })
    
    return domainUsage
  }

  reset(): void {
    this.totalBytesTransferred = 0
    this.requests = []
  }
}

// Export data usage tracker instance
export const dataUsageTracker = DataUsageTracker.getInstance() 