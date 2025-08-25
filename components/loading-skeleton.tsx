"use client"

import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  type?: 'product-card' | 'hero-section' | 'category-list' | 'search-bar' | 'cart-item'
  className?: string
  count?: number
}

export function LoadingSkeleton({ type = 'product-card', className, count = 1 }: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'product-card':
        return (
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="animate-pulse">
              <div className="bg-gray-700 h-48 rounded-lg mb-4"></div>
              <div className="space-y-3">
                <div className="bg-gray-700 h-4 rounded w-3/4"></div>
                <div className="bg-gray-700 h-3 rounded w-1/2"></div>
                <div className="bg-gray-700 h-6 rounded w-1/3"></div>
                <div className="bg-[#F7DD0F] h-10 rounded-lg w-full"></div>
              </div>
            </div>
          </div>
        )
      
      case 'hero-section':
        return (
          <div className="animate-pulse">
            <div className="bg-gray-800/50 h-96 rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="bg-gray-700 h-8 rounded w-1/2 mx-auto"></div>
              <div className="bg-gray-700 h-4 rounded w-3/4 mx-auto"></div>
            </div>
          </div>
        )
      
      case 'category-list':
        return (
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse flex-shrink-0">
                <div className="bg-gray-800/50 w-24 h-24 rounded-lg border border-gray-700"></div>
                <div className="bg-gray-700 h-3 rounded w-16 mt-2"></div>
              </div>
            ))}
          </div>
        )
      
      case 'search-bar':
        return (
          <div className="animate-pulse">
            <div className="bg-gray-800/50 h-12 rounded-lg border border-gray-700"></div>
          </div>
        )
      
      case 'cart-item':
        return (
          <div className="animate-pulse">
            <div className="flex space-x-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="bg-gray-700 w-16 h-16 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="bg-gray-700 h-4 rounded w-3/4"></div>
                <div className="bg-gray-700 h-3 rounded w-1/2"></div>
                <div className="bg-gray-700 h-6 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="animate-pulse">
            <div className="bg-gray-700 h-4 rounded w-full"></div>
          </div>
        )
    }
  }

  if (count === 1) {
    return <div className={cn("", className)}>{renderSkeleton()}</div>
  }

  return (
    <div className={cn("grid gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  )
}

// Quick loading spinner for small areas
export function LoadingSpinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={cn("animate-spin", sizeClasses[size], className)}>
      <div className="w-full h-full border-2 border-gray-700 border-t-[#F7DD0F] rounded-full"></div>
    </div>
  )
}

// Loading overlay for sections
export function LoadingOverlay({ 
  isLoading, 
  children, 
  fallback = <LoadingSpinner size="lg" />,
  className 
}: { 
  isLoading: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string 
}) {
  if (!isLoading) return <>{children}</>

  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
        {fallback}
      </div>
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
    </div>
  )
}
