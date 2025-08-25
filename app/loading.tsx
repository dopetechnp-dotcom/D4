"use client"

import { useState, useEffect } from 'react'

export default function Loading() {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Initializing...')

  useEffect(() => {
    const loadingSteps = [
      { progress: 20, text: 'Connecting to servers...' },
      { progress: 40, text: 'Loading products...' },
      { progress: 60, text: 'Preparing your experience...' },
      { progress: 80, text: 'Almost ready...' },
      { progress: 95, text: 'Final touches...' }
    ]

    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        setProgress(loadingSteps[currentStep].progress)
        setLoadingText(loadingSteps[currentStep].text)
        currentStep++
      } else {
        setProgress(100)
        setLoadingText('Welcome to DopeTech!')
        clearInterval(interval)
      }
    }, 800)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center z-50">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <div className="w-full h-full border-4 border-[#F7DD0F] border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 bg-black rounded-full flex items-center justify-center">
              <span className="text-[#F7DD0F] font-bold text-lg">DT</span>
            </div>
          </div>
          <h1 className="text-[#F7DD0F] font-bold text-2xl mb-2">DopeTech Nepal</h1>
          <p className="text-gray-400 text-sm">Premium Tech Gear</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
            <div 
              className="bg-gradient-to-r from-[#F7DD0F] to-yellow-400 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-[#F7DD0F] font-medium text-sm">{loadingText}</p>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2 mb-6">
          <div className="w-3 h-3 bg-[#F7DD0F] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-[#F7DD0F] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-[#F7DD0F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Status Messages */}
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Database connected</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '500ms' }}></div>
            <span>Assets loading</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1000ms' }}></div>
            <span>Optimizing performance</span>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-gray-300 text-xs">
            💡 <strong>Pro tip:</strong> While you wait, check out our latest gaming peripherals and mechanical keyboards!
          </p>
        </div>
      </div>
    </div>
  )
}
