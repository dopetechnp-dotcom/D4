'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { 
  getOptimizedImageUrl, 
  getProgressiveImageUrls, 
  imageCache,
  type ImageSize,
  type ImageQuality 
} from '@/lib/image-optimizer'

interface OptimizedImageProps {
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
  placeholder?: string
  fallback?: string
  // Progressive loading options
  progressive?: boolean
  // Intersection observer options
  threshold?: number
  rootMargin?: string
}

export default function OptimizedImage({
  src,
  alt,
  size = 'card',
  quality = 'medium',
  format = 'auto',
  className = '',
  loading = 'lazy',
  priority = false,
  onLoad,
  onError,
  placeholder = '/placeholder-product.svg',
  fallback = '/placeholder-product.svg',
  progressive = true,
  threshold = 0.1,
  rootMargin = '50px'
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [currentSrc, setCurrentSrc] = useState<string>(placeholder)
  const [error, setError] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate optimized URLs
  const optimizedSrc = getOptimizedImageUrl(src, size, quality, format)
  const progressiveUrls = progressive ? getProgressiveImageUrls(src) : null

  // Check cache first
  useEffect(() => {
    const cacheKey = `${src}-${size}-${quality}`
    const cachedUrl = imageCache.get(cacheKey)
    
    if (cachedUrl && !error) {
      setCurrentSrc(cachedUrl)
      setImageLoaded(true)
      return
    }

    if (isInView && !error) {
      if (progressive && progressiveUrls) {
        // Start with thumbnail for progressive loading
        setCurrentSrc(progressiveUrls.thumbnail)
      } else {
        setCurrentSrc(optimizedSrc)
      }
    }
  }, [src, size, quality, isInView, error, progressive, progressiveUrls, optimizedSrc])

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !containerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [priority, threshold, rootMargin])

  // Progressive loading effect
  useEffect(() => {
    if (!isInView || error || !progressive || !progressiveUrls) return

    let timeoutId: NodeJS.Timeout

    const loadProgressive = async () => {
      // Load preview after thumbnail
      timeoutId = setTimeout(() => {
        if (!error) {
          setCurrentSrc(progressiveUrls.preview)
        }
      }, 100)

      // Load full quality after preview
      timeoutId = setTimeout(() => {
        if (!error) {
          setCurrentSrc(progressiveUrls.full)
        }
      }, 300)
    }

    loadProgressive()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isInView, error, progressive, progressiveUrls])

  // Handle image load
  const handleLoad = () => {
    setImageLoaded(true)
    setError(false)
    
    // Cache the optimized URL
    const cacheKey = `${src}-${size}-${quality}`
    imageCache.set(cacheKey, currentSrc)
    
    onLoad?.()
  }

  // Handle image error
  const handleError = () => {
    setError(true)
    setCurrentSrc(fallback)
    onError?.()
  }

  // Handle progressive loading completion
  const handleProgressiveLoad = () => {
    if (progressive && progressiveUrls && currentSrc === progressiveUrls.full) {
      setImageLoaded(true)
    }
  }

  // Determine if we should use Next.js Image component
  const shouldUseNextImage = src.includes('supabase.co') || src.startsWith('/')

  if (shouldUseNextImage) {
    return (
      <div 
        ref={containerRef}
        className={`relative overflow-hidden ${className}`}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
        
        {isInView && (
          <Image
            src={currentSrc}
            alt={alt}
            fill
            className={`object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading={loading}
            priority={priority}
            onLoad={handleLoad}
            onError={handleError}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={quality === 'low' ? 60 : quality === 'medium' ? 75 : 85}
          />
        )}
      </div>
    )
  }

  // Fallback to regular img tag for external URLs
  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      
      {isInView && (
        <img
          ref={imageRef}
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={loading}
          onLoad={() => {
            handleLoad()
            handleProgressiveLoad()
          }}
          onError={handleError}
          decoding="async"
        />
      )}
    </div>
  )
}

// Optimized product image component
export function OptimizedProductImage({
  product,
  size = 'card',
  quality = 'medium',
  className = '',
  ...props
}: {
  product: { image_url: string; name: string }
  size?: ImageSize
  quality?: ImageQuality
  className?: string
} & Omit<OptimizedImageProps, 'src' | 'alt'>) {
  return (
    <OptimizedImage
      src={product.image_url}
      alt={product.name}
      size={size}
      quality={quality}
      className={className}
      fallback="/placeholder-product.svg"
      {...props}
    />
  )
}

// Optimized hero image component
export function OptimizedHeroImage({
  src,
  alt,
  className = '',
  ...props
}: {
  src: string
  alt: string
  className?: string
} & Omit<OptimizedImageProps, 'src' | 'alt' | 'size' | 'quality'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      size="hero"
      quality="high"
      className={className}
      fallback="/placeholder-hero.svg"
      priority={true}
      {...props}
    />
  )
}

// Optimized thumbnail component
export function OptimizedThumbnail({
  src,
  alt,
  className = '',
  ...props
}: {
  src: string
  alt: string
  className?: string
} & Omit<OptimizedImageProps, 'src' | 'alt' | 'size' | 'quality'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      size="thumbnail"
      quality="low"
      className={className}
      fallback="/placeholder-thumbnail.svg"
      progressive={false}
      {...props}
    />
  )
}
