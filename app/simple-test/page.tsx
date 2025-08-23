"use client"

import { useEffect, useState } from 'react'

export default function SimpleTest() {
  const [status, setStatus] = useState('Loading...')

  useEffect(() => {
    // Test basic functionality
    setStatus('Basic React is working!')
    
    // Test console logging
    console.log('🔍 Simple test page loaded')
    
    // Test environment variables
    console.log('Environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
    })
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Simple Test Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-800 rounded">
          <h2 className="text-xl font-semibold mb-2">Status</h2>
          <p>{status}</p>
        </div>
        
        <div className="p-4 bg-gray-800 rounded">
          <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
          <div className="space-y-2">
            <div>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</div>
            <div>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</div>
            <div>NODE_ENV: {process.env.NODE_ENV}</div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-800 rounded">
          <h2 className="text-xl font-semibold mb-2">Basic Styling Test</h2>
          <div className="space-y-2">
            <div className="text-yellow-400">Yellow text should be visible</div>
            <div className="text-red-400">Red text should be visible</div>
            <div className="text-green-400">Green text should be visible</div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">
              Test Button
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-gray-800 rounded">
          <h2 className="text-xl font-semibold mb-2">Image Test</h2>
          <div className="space-y-2">
            <img 
              src="/logo/favicon.svg" 
              alt="Favicon" 
              className="w-8 h-8 border"
              onLoad={() => console.log('✅ Favicon loaded')}
              onError={() => console.log('❌ Favicon failed to load')}
            />
            <div>Check console for image load status</div>
          </div>
        </div>
      </div>
    </div>
  )
}
