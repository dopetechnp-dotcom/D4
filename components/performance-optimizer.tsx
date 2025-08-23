"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { LoadingSkeleton, LoadingSpinner, LoadingOverlay } from './loading-skeleton'

interface PerformanceOptimizerProps {
  children: React.ReactNode
  initialLoadingTime?: number
  enableProgressiveLoading?: boolean
  showLoadingIndicator?: boolean
}

export function PerformanceOptimizer({ 
  children, 
  initialLoadingTime = 2000,
  enableProgressiveLoading = true,
  showLoadingIndicator = true
}: PerformanceOptimizerProps) {
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)

  // Simulate progressive loading
  useEffect(() => {
    if (!enableProgressiveLoading) {
      setIsInitialLoading(false)
      setIsReady(true)
      return
    }

    const steps = [
      { progress: 20, delay: 200 },
      { progress: 40, delay: 400 },
      { progress: 60, delay: 600 },
      { progress: 80, delay: 800 },
      { progress: 95, delay: 1000 }
    ]

    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setLoadingProgress(steps[currentStep].progress)
        currentStep++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setIsInitialLoading(false)
          setIsReady(true)
        }, 500)
      }
    }, 200)

    return () => clearInterval(interval)
  }, [enableProgressiveLoading])

  // Preload critical resources
  useEffect(() => {
    const preloadResources = async () => {
      try {
        // Preload critical images
        const criticalImages = [
          '/logo/dopelogo.svg',
          '/logo/favicon.svg'
        ]

        await Promise.all(
          criticalImages.map(src => {
            return new Promise((resolve, reject) => {
              const img = new Image()
              img.onload = resolve
              img.onerror = reject
              img.src = src
            })
          })
        )
      } catch (error) {
        console.warn('Failed to preload some resources:', error)
      }
    }

    preloadResources()
  }, [])

  if (isInitialLoading && showLoadingIndicator) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center z-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <div className="w-full h-full border-4 border-[#F7DD0F] border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 bg-black rounded-full flex items-center justify-center">
                <span className="text-[#F7DD0F] font-bold text-lg">DT</span>
              </div>
            </div>
            <h1 className="text-[#F7DD0F] font-bold text-2xl mb-2">DopeTech Nepal</h1>
            <p className="text-gray-400 text-sm">Optimizing your experience...</p>
          </div>

          <div className="mb-6">
            <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
              <div 
                className="bg-gradient-to-r from-[#F7DD0F] to-yellow-400 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-[#F7DD0F] font-medium text-sm">
              {loadingProgress < 40 && 'Initializing...'}
              {loadingProgress >= 40 && loadingProgress < 60 && 'Loading assets...'}
              {loadingProgress >= 60 && loadingProgress < 80 && 'Preparing interface...'}
              {loadingProgress >= 80 && 'Almost ready...'}
            </p>
          </div>

          <div className="flex justify-center space-x-2 mb-6">
            <div className="w-3 h-3 bg-[#F7DD0F] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-[#F7DD0F] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-[#F7DD0F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Performance optimization active</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '500ms' }}></div>
              <span>Resource preloading</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={isReady ? 'animate-fade-in' : 'opacity-0'}>
      {children}
    </div>
  )
}

// Hook for managing loading states
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState)
  const [loadingMessage, setLoadingMessage] = useState('')

  const startLoading = useCallback((message = 'Loading...') => {
    setIsLoading(true)
    setLoadingMessage(message)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    setLoadingMessage('')
  }, [])

  const withLoading = useCallback(async <T,>(
    asyncFn: () => Promise<T>,
    message = 'Loading...'
  ): Promise<T> => {
    startLoading(message)
    try {
      const result = await asyncFn()
      return result
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    withLoading
  }
}

// Hook for progressive data loading
export function useProgressiveLoading<T>(
  dataFetcher: () => Promise<T[]>,
  options: {
    batchSize?: number
    delay?: number
    initialCount?: number
  } = {}
) {
  const { batchSize = 6, delay = 300, initialCount = 12 } = options
  const [data, setData] = useState<T[]>([])
  const [displayedData, setDisplayedData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true)
        const allData = await dataFetcher()
        setData(allData)
        setDisplayedData(allData.slice(0, initialCount))
        setHasMore(allData.length > initialCount)
      } catch (error) {
        console.error('Failed to load initial data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [dataFetcher, initialCount])

  // Load more data progressively
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return

    setIsLoading(true)
    
    // Simulate progressive loading
    setTimeout(() => {
      const currentLength = displayedData.length
      const newData = data.slice(currentLength, currentLength + batchSize)
      
      setDisplayedData(prev => [...prev, ...newData])
      setHasMore(currentLength + batchSize < data.length)
      setIsLoading(false)
    }, delay)
  }, [data, displayedData.length, batchSize, delay, hasMore, isLoading])

  return {
    data: displayedData,
    isLoading,
    hasMore,
    loadMore,
    totalCount: data.length
  }
}

// Add fade-in animation to globals.css
const fadeInAnimation = `
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}
`
