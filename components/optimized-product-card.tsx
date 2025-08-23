'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { OptimizedProductImage } from './optimized-image'
import { getCachedProduct } from '@/lib/cache-manager'
import { getOptimizedImageUrl } from '@/lib/image-optimizer'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  features?: string[]
  in_stock: boolean
  created_at: string
}

interface OptimizedProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  onWishlist: (product: Product) => void
  isWishlisted?: boolean
}

export default function OptimizedProductCard({ 
  product, 
  onAddToCart, 
  onWishlist, 
  isWishlisted = false 
}: OptimizedProductCardProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleCardClick = () => {
    router.push(`/product/${product.id}`)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddToCart(product)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    onWishlist(product)
  }

  return (
    <div
      ref={cardRef}
      className="group relative bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 product-card cursor-pointer border border-yellow-500/20 hover:border-yellow-500/40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Top Section - Image with White Background */}
      <div className="relative aspect-square overflow-hidden bg-white">
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton animate-pulse bg-gray-700" />
        )}
        
        {isInView && (
          <OptimizedProductImage
            product={product}
            size="card"
            quality="medium"
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
            onLoad={() => setImageLoaded(true)}
            fallback="/placeholder-product.svg"
            progressive={true}
          />
        )}

        {/* Text Overlay on Image */}
        <div className="absolute top-3 left-3 z-10">
          <div className="text-white font-bold text-sm italic">
            {product.category.toUpperCase()}
          </div>
          <div className="text-white text-xs">
            {product.features && product.features.length > 0 ? product.features[0] : 'PREMIUM QUALITY'}
          </div>
        </div>

        {/* Stock Badge */}
        <div className="absolute top-3 right-3 z-10">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.in_stock 
              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}>
            {product.in_stock ? "In Stock" : "Out of Stock"}
          </div>
        </div>

        {/* Add to Cart Button Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              product.in_stock
                ? "bg-yellow-500 text-black hover:bg-yellow-400 hover:scale-105"
                : "bg-gray-500 text-gray-300 cursor-not-allowed"
            }`}
          >
            {product.in_stock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-12 z-10 p-2 rounded-full transition-all duration-200 ${
            isWishlisted
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-black/20 text-white border border-white/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill={isWishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors duration-200 line-clamp-2">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm line-clamp-2">
          {product.description}
        </p>

        {/* Price and Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-yellow-500">
              ${product.price.toFixed(2)}
            </span>
            {product.price > 50 && (
              <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                FREE SHIPPING
              </span>
            )}
          </div>

          {/* Star Rating */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-4 h-4 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-xs text-gray-400">(4.8)</span>
          </div>
        </div>

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
              product.in_stock
                ? "bg-yellow-500 text-black hover:bg-yellow-400"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            {product.in_stock ? "Add to Cart" : "Out of Stock"}
          </button>
          
          <button
            onClick={handleWishlist}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isWishlisted
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-gray-700 text-gray-300 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 border border-gray-600"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill={isWishlisted ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Hover Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  )
} 