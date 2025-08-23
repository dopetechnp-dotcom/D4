"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getProducts } from '@/lib/products-data'
import { useHeroCarousel } from '@/hooks/use-hero-carousel'

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    async function runDebug() {
      const info: any = {}
      const errorList: string[] = []

      try {
        // Test 1: Basic Supabase connection
        console.log('🔍 Testing Supabase connection...')
        const { data: testData, error: testError } = await supabase
          .from('products')
          .select('count')
          .limit(1)
        
        if (testError) {
          errorList.push(`Supabase connection failed: ${testError.message}`)
          info.supabaseConnection = 'FAILED'
        } else {
          info.supabaseConnection = 'SUCCESS'
        }

        // Test 2: Products data
        console.log('🔍 Testing products data...')
        try {
          const products = await getProducts()
          info.productsCount = products.length
          info.productsSample = products.slice(0, 3).map(p => ({ id: p.id, name: p.name }))
        } catch (err) {
          errorList.push(`Products fetch failed: ${err}`)
          info.productsCount = 'ERROR'
        }

        // Test 3: Hero carousel
        console.log('🔍 Testing hero carousel...')
        try {
          const { slides, loading: heroLoading, error: heroError } = useHeroCarousel()
          info.heroSlidesCount = slides.length
          info.heroLoading = heroLoading
          info.heroError = heroError
        } catch (err) {
          errorList.push(`Hero carousel failed: ${err}`)
          info.heroSlidesCount = 'ERROR'
        }

        // Test 4: Environment variables
        console.log('🔍 Testing environment variables...')
        info.envVars = {
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          hasResendKey: !!process.env.RESEND_API_KEY,
        }

        // Test 5: Image loading
        console.log('🔍 Testing image loading...')
        const testImages = [
          '/logo/dopelogo.svg',
          '/logo/favicon.svg',
          '/products/keyboard.png'
        ]
        
        info.imageTests = await Promise.all(
          testImages.map(async (src) => {
            try {
              const response = await fetch(src)
              return { src, status: response.status, ok: response.ok }
            } catch (err) {
              return { src, status: 'ERROR', ok: false, error: err }
            }
          })
        )

      } catch (err) {
        errorList.push(`General error: ${err}`)
      }

      setDebugInfo(info)
      setErrors(errorList)
      setLoading(false)
    }

    runDebug()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debugging...</h1>
        <div className="animate-spin">Loading debug info...</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Vercel Deployment Debug</h1>
      
      {errors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <h2 className="font-bold mb-2">Errors Found:</h2>
          <ul className="list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">Connection Tests</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            {debugInfo.envVars && Object.entries(debugInfo.envVars).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium">{key}:</span>
                <span className={value ? 'text-green-600' : 'text-red-600'}>
                  {value ? '✅ Set' : '❌ Missing'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {debugInfo.imageTests && (
          <div className="border p-4 rounded md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Image Loading Tests</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {debugInfo.imageTests.map((test: any, index: number) => (
                <div key={index} className={`p-3 rounded ${test.ok ? 'bg-green-100' : 'bg-red-100'}`}>
                  <div className="font-medium">{test.src}</div>
                  <div className="text-sm">
                    Status: {test.status}
                    {test.ok ? ' ✅' : ' ❌'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
