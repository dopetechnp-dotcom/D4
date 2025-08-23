import { supabase } from './supabase'

// Image optimization configuration
const IMAGE_CONFIG = {
  // Quality settings for different image types
  quality: {
    thumbnail: 60,
    preview: 75,
    full: 85,
    hero: 90
  },
  
  // Size settings for different use cases
  sizes: {
    thumbnail: { width: 150, height: 150 },
    preview: { width: 300, height: 300 },
    card: { width: 400, height: 400 },
    hero: { width: 800, height: 600 },
    full: { width: 1200, height: 1200 }
  },
  
  // Cache settings
  cache: {
    ttl: 31536000, // 1 year in seconds
    staleWhileRevalidate: 86400 // 1 day in seconds
  }
}

// Image optimization types
export type ImageSize = 'thumbnail' | 'preview' | 'card' | 'hero' | 'full'
export type ImageQuality = 'low' | 'medium' | 'high'

// Optimized image URL generator
export function getOptimizedImageUrl(
  originalUrl: string,
  size: ImageSize = 'card',
  quality: ImageQuality = 'medium',
  format: 'webp' | 'avif' | 'auto' = 'auto'
): string {
  // If it's already a Supabase URL, optimize it
  if (originalUrl.includes('supabase.co')) {
    const url = new URL(originalUrl)
    
    // Add optimization parameters
    const params = new URLSearchParams()
    
    // Set quality based on type
    const qualityValue = quality === 'low' ? IMAGE_CONFIG.quality.thumbnail :
                        quality === 'medium' ? IMAGE_CONFIG.quality.preview :
                        IMAGE_CONFIG.quality.full
    params.set('quality', qualityValue.toString())
    
    // Set size
    const sizeConfig = IMAGE_CONFIG.sizes[size]
    params.set('width', sizeConfig.width.toString())
    params.set('height', sizeConfig.height.toString())
    
    // Set format
    if (format !== 'auto') {
      params.set('format', format)
    }
    
    // Add cache headers
    params.set('cache', 'max-age=' + IMAGE_CONFIG.cache.ttl)
    
    url.search = params.toString()
    return url.toString()
  }
  
  // For non-Supabase URLs, return as-is (will be handled by Next.js Image component)
  return originalUrl
}

// Progressive image loading with multiple sizes
export function getProgressiveImageUrls(originalUrl: string): {
  thumbnail: string
  preview: string
  full: string
} {
  return {
    thumbnail: getOptimizedImageUrl(originalUrl, 'thumbnail', 'low'),
    preview: getOptimizedImageUrl(originalUrl, 'preview', 'medium'),
    full: getOptimizedImageUrl(originalUrl, 'full', 'high')
  }
}

// Image preloader for critical images
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to preload image: ${url}`))
    img.src = url
  })
}

// Batch preload images
export async function preloadImages(urls: string[]): Promise<void> {
  const promises = urls.map(url => preloadImage(url).catch(() => {}))
  await Promise.all(promises)
}

// Image cache manager
class ImageCache {
  private cache = new Map<string, { url: string; timestamp: number; ttl: number }>()
  
  set(key: string, url: string, ttl: number = 3600000): void {
    this.cache.set(key, {
      url,
      timestamp: Date.now(),
      ttl
    })
  }
  
  get(key: string): string | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.url
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  // Clean expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Global image cache instance
export const imageCache = new ImageCache()

// Optimized image component props
export interface OptimizedImageProps {
  src: string
  alt: string
  size?: ImageSize
  quality?: ImageQuality
  format?: 'webp' | 'avif' | 'auto'
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
}

// Generate optimized image props
export function getOptimizedImageProps(props: OptimizedImageProps) {
  const {
    src,
    size = 'card',
    quality = 'medium',
    format = 'auto',
    ...rest
  } = props
  
  const optimizedSrc = getOptimizedImageUrl(src, size, quality, format)
  
  return {
    src: optimizedSrc,
    ...rest
  }
}

// Image compression utility for uploads
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }
      
      // Set canvas dimensions
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        file.type,
        quality
      )
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

// Storage optimization utilities
export async function optimizeStorageImage(
  bucketName: string,
  fileName: string,
  size: ImageSize = 'card'
): Promise<string> {
  try {
    // Get the original image URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName)
    
    if (!urlData.publicUrl) {
      throw new Error('Failed to get image URL')
    }
    
    // Return optimized URL
    return getOptimizedImageUrl(urlData.publicUrl, size)
  } catch (error) {
    console.error('Error optimizing storage image:', error)
    throw error
  }
}

// Batch optimize storage images
export async function optimizeStorageImages(
  bucketName: string,
  fileNames: string[],
  size: ImageSize = 'card'
): Promise<Record<string, string>> {
  const optimizedUrls: Record<string, string> = {}
  
  await Promise.all(
    fileNames.map(async (fileName) => {
      try {
        const optimizedUrl = await optimizeStorageImage(bucketName, fileName, size)
        optimizedUrls[fileName] = optimizedUrl
      } catch (error) {
        console.error(`Error optimizing ${fileName}:`, error)
      }
    })
  )
  
  return optimizedUrls
}

// Cleanup function for memory management
export function cleanupImageOptimizer(): void {
  imageCache.cleanup()
}

// Auto-cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupImageOptimizer, 5 * 60 * 1000)
}
