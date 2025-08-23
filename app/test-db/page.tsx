"use client"

import { useState, useEffect } from 'react'
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/products-data'

export default function TestDBPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    testDatabaseConnection()
  }, [])

  const testDatabaseConnection = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔗 Testing database connection...')
      
      // Test 1: Get products
      const productsData = await getProducts()
      setProducts(productsData)
      console.log('✅ Products loaded:', productsData.length)
      
      // Test 2: Try to add a test product
      console.log('🧪 Testing add product...')
      const testProduct = {
        name: 'Test Product',
        description: 'This is a test product',
        price: 99.99,
        category: 'test',
        in_stock: true,
        discount: 0,
        image_url: ''
      }
      
      const newProduct = await addProduct(testProduct)
      if (newProduct) {
        console.log('✅ Test product added:', newProduct.id)
        setTestResult(`✅ Test product added with ID: ${newProduct.id}`)
        
        // Test 3: Update the test product
        console.log('🔄 Testing update product...')
        const updatedProduct = await updateProduct(newProduct.id, {
          name: 'Updated Test Product',
          price: 149.99
        })
        
        if (updatedProduct) {
          console.log('✅ Test product updated')
          setTestResult(prev => prev + '\n✅ Test product updated')
        }
        
        // Test 4: Delete the test product
        console.log('🗑️ Testing delete product...')
        const deleteSuccess = await deleteProduct(newProduct.id)
        
        if (deleteSuccess) {
          console.log('✅ Test product deleted')
          setTestResult(prev => prev + '\n✅ Test product deleted')
        }
        
        // Refresh products list
        const refreshedProducts = await getProducts()
        setProducts(refreshedProducts)
      } else {
        setError('Failed to add test product')
      }
      
    } catch (err) {
      console.error('❌ Database test failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Testing Database Connection...</h1>
        <div className="animate-spin">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>
      
      {error && (
        <div className="bg-red-900/20 border border-red-500 p-4 rounded mb-6">
          <h2 className="text-red-400 font-semibold mb-2">Error:</h2>
          <p className="text-red-300">{error}</p>
        </div>
      )}
      
      {testResult && (
        <div className="bg-green-900/20 border border-green-500 p-4 rounded mb-6">
          <h2 className="text-green-400 font-semibold mb-2">Test Results:</h2>
          <pre className="text-green-300 whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
      
      <div className="bg-white/10 border border-white/20 rounded p-4">
        <h2 className="text-xl font-semibold mb-4">Current Products ({products.length})</h2>
        <div className="space-y-2">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
              <div>
                <span className="font-medium">{product.name}</span>
                <span className="text-gray-400 ml-2">- Rs {product.price}</span>
              </div>
              <span className="text-sm text-gray-400">{product.category}</span>
            </div>
          ))}
        </div>
      </div>
      
      <button
        onClick={testDatabaseConnection}
        className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
      >
        Run Test Again
      </button>
    </div>
  )
}
