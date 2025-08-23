"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDB() {
  const [products, setProducts] = useState<any[]>([])
  const [heroImages, setHeroImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        setLoading(true)
        
        // Test products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .limit(5)
        
        if (productsError) {
          console.error('Products error:', productsError)
          setError(`Products error: ${productsError.message}`)
        } else {
          console.log('Products data:', productsData)
          setProducts(productsData || [])
        }

        // Test hero images
        const { data: heroData, error: heroError } = await supabase
          .from('hero_images')
          .select('*')
          .limit(5)
        
        if (heroError) {
          console.error('Hero images error:', heroError)
          setError(prev => prev ? `${prev}; Hero error: ${heroError.message}` : `Hero error: ${heroError.message}`)
        } else {
          console.log('Hero images data:', heroData)
          setHeroImages(heroData || [])
        }

      } catch (err) {
        console.error('Test error:', err)
        setError(`Test error: ${err}`)
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Products ({products.length})</h2>
          {products.map((product, index) => (
            <div key={index} className="border p-3 mb-2 rounded">
              <p><strong>Name:</strong> {product.name}</p>
              <p><strong>Price:</strong> ${product.price}</p>
              <p><strong>Category:</strong> {product.category}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Hero Images ({heroImages.length})</h2>
          {heroImages.map((hero, index) => (
            <div key={index} className="border p-3 mb-2 rounded">
              <p><strong>Title:</strong> {hero.title}</p>
              <p><strong>Active:</strong> {hero.is_active ? 'Yes' : 'No'}</p>
              <p><strong>Order:</strong> {hero.display_order}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
