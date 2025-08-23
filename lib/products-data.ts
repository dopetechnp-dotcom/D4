import { supabase } from './supabase'
import { getCachedProducts, getCachedProduct, invalidateProductCache } from './cache-manager'
import { getOptimizedImageUrl } from './image-optimizer'

// Product interface
export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  features?: string[]
  in_stock: boolean
  created_at: string
  updated_at?: string
  show_content?: boolean
  color?: string
}

// Optimized product fetching with caching
export async function getProducts(): Promise<Product[]> {
  try {
    // Use cached data first
    const cachedProducts = await getCachedProducts()
    return cachedProducts
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

// Get single product with caching
export async function getProduct(id: string): Promise<Product | null> {
  try {
    // Use cached data first
    const cachedProduct = await getCachedProduct(id)
    return cachedProduct
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

// Get products by category with caching
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const products = await getProducts()
    return products.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    )
  } catch (error) {
    console.error('Error fetching products by category:', error)
    return []
  }
}

// Get products by search term with caching
export async function searchProducts(searchTerm: string): Promise<Product[]> {
  try {
    const products = await getProducts()
    const term = searchTerm.toLowerCase()
    
    return products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      (product.features && product.features.some(feature => 
        feature.toLowerCase().includes(term)
      ))
    )
  } catch (error) {
    console.error('Error searching products:', error)
    return []
  }
}

// Get in-stock products only
export async function getInStockProducts(): Promise<Product[]> {
  try {
    const products = await getProducts()
    return products.filter(product => product.in_stock)
  } catch (error) {
    console.error('Error fetching in-stock products:', error)
    return []
  }
}

// Get featured products (products with show_content = true)
export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const products = await getProducts()
    return products.filter(product => product.show_content === true)
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

// Get products by color
export async function getProductsByColor(color: string): Promise<Product[]> {
  try {
    const products = await getProducts()
    return products.filter(product => 
      product.color && product.color.toLowerCase() === color.toLowerCase()
    )
  } catch (error) {
    console.error('Error fetching products by color:', error)
    return []
  }
}

// Get primary image URL with optimization
export function getPrimaryImageUrl(product: Product): string {
  if (!product.image_url) {
    return '/placeholder-product.svg'
  }
  
  // Return optimized URL for Supabase images
  return getOptimizedImageUrl(product.image_url, 'card', 'medium')
}

// Get all product image URLs
export function getProductImageUrls(product: Product): string[] {
  if (!product.image_url) {
    return ['/placeholder-product.svg']
  }
  
  // For now, return the primary image
  // In the future, this could be expanded to handle multiple images
  return [getPrimaryImageUrl(product)]
}

// Get product categories
export async function getProductCategories(): Promise<string[]> {
  try {
    const products = await getProducts()
    const categories = [...new Set(products.map(product => product.category))]
    return categories.sort()
  } catch (error) {
    console.error('Error fetching product categories:', error)
    return []
  }
}

// Get product colors
export async function getProductColors(): Promise<string[]> {
  try {
    const products = await getProducts()
    const colors = [...new Set(
      products
        .map(product => product.color)
        .filter(color => color && color.trim() !== '')
    )]
    return colors.sort()
  } catch (error) {
    console.error('Error fetching product colors:', error)
    return []
  }
}

// Get price range
export async function getPriceRange(): Promise<{ min: number; max: number }> {
  try {
    const products = await getProducts()
    if (products.length === 0) {
      return { min: 0, max: 0 }
    }
    
    const prices = products.map(product => product.price)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    }
  } catch (error) {
    console.error('Error calculating price range:', error)
    return { min: 0, max: 0 }
  }
}

// Filter products with multiple criteria
export async function filterProducts(filters: {
  category?: string
  color?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  featured?: boolean
  searchTerm?: string
}): Promise<Product[]> {
  try {
    let products = await getProducts()
    
    // Apply filters
    if (filters.category) {
      products = products.filter(product => 
        product.category.toLowerCase() === filters.category!.toLowerCase()
      )
    }
    
    if (filters.color) {
      products = products.filter(product => 
        product.color && product.color.toLowerCase() === filters.color!.toLowerCase()
      )
    }
    
    if (filters.minPrice !== undefined) {
      products = products.filter(product => product.price >= filters.minPrice!)
    }
    
    if (filters.maxPrice !== undefined) {
      products = products.filter(product => product.price <= filters.maxPrice!)
    }
    
    if (filters.inStock !== undefined) {
      products = products.filter(product => product.in_stock === filters.inStock)
    }
    
    if (filters.featured) {
      products = products.filter(product => product.show_content === true)
    }
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      products = products.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        (product.features && product.features.some(feature => 
          feature.toLowerCase().includes(term)
        ))
      )
    }
    
    return products
  } catch (error) {
    console.error('Error filtering products:', error)
    return []
  }
}

// Get related products
export async function getRelatedProducts(
  currentProduct: Product, 
  limit: number = 4
): Promise<Product[]> {
  try {
    const products = await getProducts()
    
    // Filter out the current product and get products from the same category
    const related = products
      .filter(product => 
        product.id !== currentProduct.id && 
        product.category === currentProduct.category
      )
      .slice(0, limit)
    
    // If we don't have enough products from the same category, add random products
    if (related.length < limit) {
      const remaining = products
        .filter(product => 
          product.id !== currentProduct.id && 
          !related.some(r => r.id === product.id)
        )
        .slice(0, limit - related.length)
      
      related.push(...remaining)
    }
    
    return related
  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}

// Invalidate product cache
export function invalidateProductsCache(productId?: string): void {
  invalidateProductCache(productId)
}

// Get products with pagination
export async function getProductsWithPagination(
  page: number = 1,
  limit: number = 12,
  filters?: {
    category?: string
    color?: string
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
    featured?: boolean
    searchTerm?: string
  }
): Promise<{
  products: Product[]
  total: number
  page: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}> {
  try {
    let products = await getProducts()
    
    // Apply filters if provided
    if (filters) {
      products = await filterProducts(filters)
    }
    
    const total = products.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    const paginatedProducts = products.slice(startIndex, endIndex)
    
    return {
      products: paginatedProducts,
      total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  } catch (error) {
    console.error('Error fetching products with pagination:', error)
    return {
      products: [],
      total: 0,
      page,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    }
  }
}

// Export types for use in other files
export type { Product }

// Legacy functions for backward compatibility
export async function getDopePicks(maxCount: number = 6): Promise<Product[]> {
  try {
    const products = await getProducts()
    if (products.length === 0) return []
    
    // Randomly shuffle the products and take up to maxCount
    const shuffled = [...products].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(maxCount, shuffled.length))
  } catch (error) {
    console.error('Error fetching dope picks:', error)
    return []
  }
}

export async function getWeeklyPicks(maxCount: number = 4): Promise<Product[]> {
  try {
    const products = await getProducts()
    if (products.length === 0) return []
    
    // Randomly shuffle the products and duplicate if needed to fill maxCount
    const shuffled = [...products].sort(() => Math.random() - 0.5)
    if (shuffled.length === 0) return []
    
    // If we need more products than available, duplicate them
    if (maxCount > shuffled.length) {
      const result = []
      for (let i = 0; i < maxCount; i++) {
        const product = shuffled[i % shuffled.length]
        // Create a unique copy with a modified ID to avoid conflicts
        result.push({
          ...product,
          id: `${product.id}-copy-${i}` // Make each copy unique
        })
      }
      return result
    }
    
    return shuffled.slice(0, maxCount)
  } catch (error) {
    console.error('Error fetching weekly picks:', error)
    return []
  }
}

// CRUD functions for products (using cached data when possible)
export async function addProduct(productData: Omit<Product, 'id' | 'created_at'>): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding product:', error)
      return null
    }

    // Invalidate cache after adding
    invalidateProductsCache()
    return data
  } catch (error) {
    console.error('Error adding product:', error)
    return null
  }
}

export async function updateProduct(productId: string, productData: Partial<Product>): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...productData,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return null
    }

    // Invalidate cache after updating
    invalidateProductsCache(productId)
    return data
  } catch (error) {
    console.error('Error updating product:', error)
    return null
  }
}

export async function deleteProduct(productId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      console.error('Error deleting product:', error)
      return false
    }

    // Invalidate cache after deleting
    invalidateProductsCache(productId)
    return true
  } catch (error) {
    console.error('Error deleting product:', error)
    return false
  }
}

// Product image functions (simplified for now)
export async function getProductImages(productId: string): Promise<any[]> {
  try {
    // For now, return empty array - can be expanded later
    return []
  } catch (error) {
    console.error('Error fetching product images:', error)
    return []
  }
}

export async function addProductImage(productId: string, imageUrl: string, fileName?: string, isPrimary: boolean = false): Promise<any | null> {
  try {
    // For now, just return success - can be expanded later
    console.log('Product image added:', { productId, imageUrl, fileName, isPrimary })
    return { id: Date.now(), product_id: productId, image_url: imageUrl, is_primary: isPrimary }
  } catch (error) {
    console.error('Error adding product image:', error)
    return null
  }
}

export async function deleteProductImage(imageId: string): Promise<boolean> {
  try {
    // For now, just return success - can be expanded later
    console.log('Product image deleted:', imageId)
    return true
  } catch (error) {
    console.error('Error deleting product image:', error)
    return false
  }
}

export async function setPrimaryImage(imageId: string): Promise<boolean> {
  try {
    // For now, just return success - can be expanded later
    console.log('Primary image set:', imageId)
    return true
  } catch (error) {
    console.error('Error setting primary image:', error)
    return false
  }
}

export async function reorderProductImages(productId: string, imageIds: string[]): Promise<boolean> {
  try {
    // For now, just return success - can be expanded later
    console.log('Product images reordered:', { productId, imageIds })
    return true
  } catch (error) {
    console.error('Error reordering product images:', error)
    return false
  }
}