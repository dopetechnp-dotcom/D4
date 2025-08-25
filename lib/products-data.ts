import { supabase } from './supabase';

// Product Image type definition
export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  file_name?: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

// Product type definition
export interface Product {
  id: number;
  name: string;
  price: number;
  original_price: number;
  image_url: string; // Keep for backward compatibility - will be the primary image
  images?: ProductImage[]; // New field for multiple images
  category: string;
  rating: number;
  reviews: number;
  description: string;
  features: string[];
  color?: string; // Product color - optional field
  in_stock: boolean;
  discount: number;
  hidden_on_home?: boolean;
}

// Sample fallback products data
const fallbackProducts: Product[] = [
  {
    id: 1,
    name: "Gaming Keyboard Pro",
    price: 129.99,
    original_price: 159.99,
    image_url: "/products/keyboard.png",
    category: "keyboard",
    rating: 4.8,
    reviews: 245,
    description: "Premium mechanical gaming keyboard with RGB lighting and programmable keys",
    features: ["Mechanical switches", "RGB lighting", "Programmable keys", "Wrist rest"],
    in_stock: true,
    discount: 19,
    hidden_on_home: false
  },
  {
    id: 2,
    name: "Wireless Gaming Mouse",
    price: 89.99,
    original_price: 119.99,
    image_url: "/products/key.png",
    category: "mouse",
    rating: 4.7,
    reviews: 189,
    description: "High-precision wireless gaming mouse with customizable DPI",
    features: ["Wireless", "Customizable DPI", "RGB lighting", "Ergonomic design"],
    in_stock: true,
    discount: 25,
    hidden_on_home: false
  },
  {
    id: 3,
    name: "Premium Headphones",
    price: 199.99,
    original_price: 249.99,
    image_url: "/products/Screenshot 2025-08-02 215007.png",
    category: "audio",
    rating: 4.9,
    reviews: 312,
    description: "Studio-quality headphones with noise cancellation",
    features: ["Noise cancellation", "Bluetooth", "40-hour battery", "Premium audio"],
    in_stock: true,
    discount: 20,
    hidden_on_home: false
  },
  {
    id: 4,
    name: "Gaming Monitor",
    price: 299.99,
    original_price: 399.99,
    image_url: "/products/Screenshot 2025-08-02 215024.png",
    category: "monitor",
    rating: 4.6,
    reviews: 156,
    description: "27-inch 144Hz gaming monitor with 1ms response time",
    features: ["144Hz refresh rate", "1ms response", "FreeSync", "HDR support"],
    in_stock: true,
    discount: 25,
    hidden_on_home: false
  },
  {
    id: 5,
    name: "Gaming Speaker System",
    price: 149.99,
    original_price: 199.99,
    image_url: "/products/Screenshot 2025-08-02 215110.png",
    category: "speaker",
    rating: 4.5,
    reviews: 98,
    description: "Immersive gaming speaker system with subwoofer",
    features: ["2.1 Channel", "Subwoofer", "RGB lighting", "Gaming optimized"],
    in_stock: true,
    discount: 25,
    hidden_on_home: false
  }
];

// Fetch products from Supabase with local fallback
export async function getProducts(): Promise<Product[]> {
  try {
    console.log('🔗 Connecting to Supabase...')
    
    // Add a timeout to prevent hanging - increased to 15 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - Supabase connection took too long')), 15000) // 15 second timeout
    })
    
    const supabasePromise = supabase
      .from('products')
      .select('*')
      .eq('hidden_on_home', false)
      .order('id', { ascending: true });

    const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error; // Throw error to trigger fallback
    }

    console.log('✅ Supabase query successful')
    console.log('📦 Data received:', data?.length || 0, 'products')
    
    // If no data or empty array, use fallback
    if (!data || data.length === 0) {
      console.log('⚠️ No products in database, using fallback')
      return fallbackProducts;
    }
    
    return (data as unknown as Product[]) || [];
  } catch (error) {
    console.error('❌ Error fetching products from Supabase:', error);
    console.log('🔄 Falling back to local products data...')
    
    // Return fallback products instead of trying to import JSON
    console.log('✅ Using fallback products')
    console.log('📦 Fallback data:', fallbackProducts.length, 'products')
    return fallbackProducts;
  }
}

// Fetch a single product by ID
export async function getProductById(id: number): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return data as unknown as Product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Fetch a single product by ID with its images
export async function getProductByIdWithImages(id: number): Promise<Product | null> {
  try {
    // First get the product
    const product = await getProductById(id);
    if (!product) {
      return null;
    }

    // Then get the product images
    const images = await getProductImages(id);
    
    // Return product with images
    return {
      ...product,
      images: images
    };
  } catch (error) {
    console.error('Error fetching product with images:', error);
    return null;
  }
}

// Get products by category
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('hidden_on_home', false)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }

    return (data as unknown as Product[]) || [];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

// Get random dope picks (maximum 6 products)
export async function getDopePicks(maxCount: number = 6): Promise<Product[]> {
  try {
    // Add timeout protection - increased to 15 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - Supabase connection took too long')), 15000) // 15 second timeout
    })
    
    const supabasePromise = supabase
      .from('products')
      .select('*')
      .eq('hidden_on_home', false)
      .order('id', { ascending: true });

    const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No products in database for dope picks, using fallback')
      const shuffled = [...fallbackProducts].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(maxCount, shuffled.length));
    }

    // Randomly shuffle the products and take up to maxCount
    const shuffled = [...(data as unknown as Product[])].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(maxCount, shuffled.length));
  } catch (error) {
    console.error('❌ Error fetching dope picks:', error);
    // Use fallback products for dope picks
    const shuffled = [...fallbackProducts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(maxCount, shuffled.length));
  }
}

// Get random weekly picks (can duplicate to fill grid)
export async function getWeeklyPicks(maxCount: number = 4): Promise<Product[]> {
  try {
    // Add timeout protection
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    })
    
    const supabasePromise = supabase
      .from('products')
      .select('*')
      .eq('hidden_on_home', false)
      .order('id', { ascending: true });

    const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No products in database for weekly picks, using fallback')
      const shuffled = [...fallbackProducts].sort(() => Math.random() - 0.5);
      if (shuffled.length === 0) {
        return [];
      }
      
      // If we need more products than available, duplicate them
      if (maxCount > shuffled.length) {
        const result = [];
        for (let i = 0; i < maxCount; i++) {
          const product = shuffled[i % shuffled.length];
          // Create a unique copy with a modified ID to avoid conflicts
          result.push({
            ...product,
            id: product.id * 1000 + i // Make each copy unique
          });
        }
        return result;
      }
      
      return shuffled.slice(0, maxCount);
    }

    // Randomly shuffle the products and duplicate if needed to fill maxCount
    const shuffled = [...(data as unknown as Product[])].sort(() => Math.random() - 0.5);
    if (shuffled.length === 0) {
      return [];
    }
    
    // If we need more products than available, duplicate them
    if (maxCount > shuffled.length) {
      const result = [];
      for (let i = 0; i < maxCount; i++) {
        const product = shuffled[i % shuffled.length];
        // Create a unique copy with a modified ID to avoid conflicts
        result.push({
          ...product,
          id: product.id * 1000 + i // Make each copy unique
        });
      }
      return result;
    }
    
    return shuffled.slice(0, maxCount);
  } catch (error) {
    console.error('❌ Error fetching weekly picks:', error);
    // Use fallback products for weekly picks
    const shuffled = [...fallbackProducts].sort(() => Math.random() - 0.5);
    if (shuffled.length === 0) {
      return [];
    }
    
    // If we need more products than available, duplicate them
    if (maxCount > shuffled.length) {
      const result = [];
      for (let i = 0; i < maxCount; i++) {
        const product = shuffled[i % shuffled.length];
        // Create a unique copy with a modified ID to avoid conflicts
        result.push({
          ...product,
          id: product.id * 1000 + i // Make each copy unique
        });
      }
      return result;
    }
    
    return shuffled.slice(0, maxCount);
  }
}

// Product Images Functions
export async function getProductImages(productId: number): Promise<ProductImage[]> {
  try {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching product images:', error);
      return [];
    }

    return (data as unknown as ProductImage[]) || [];
  } catch (error) {
    console.error('Error fetching product images:', error);
    return [];
  }
}

export async function addProductImage(productId: number, imageUrl: string, fileName?: string, isPrimary: boolean = false): Promise<ProductImage | null> {
  try {
    const { data, error } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        image_url: imageUrl,
        file_name: fileName,
        is_primary: isPrimary
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding product image:', error);
      return null;
    }

    return data as unknown as ProductImage;
  } catch (error) {
    console.error('Error adding product image:', error);
    return null;
  }
}

export async function deleteProductImage(imageId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      console.error('Error deleting product image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting product image:', error);
    return false;
  }
}

export async function setPrimaryImage(imageId: number): Promise<boolean> {
  try {
    // First, get the product_id for this image
    const { data: imageData, error: fetchError } = await supabase
      .from('product_images')
      .select('product_id')
      .eq('id', imageId)
      .single();

    if (fetchError) {
      console.error('Error fetching image:', fetchError);
      return false;
    }

    // Set all images for this product to not primary
    const { error: updateError } = await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', (imageData as any).product_id);

    if (updateError) {
      console.error('Error updating images:', updateError);
      return false;
    }

    // Set the specified image as primary
    const { error: setError } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId);

    if (setError) {
      console.error('Error setting primary image:', setError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error setting primary image:', error);
    return false;
  }
}

export async function reorderProductImages(productId: number, imageIds: number[]): Promise<boolean> {
  try {
    // Update the order of images
    for (let i = 0; i < imageIds.length; i++) {
      const { error } = await supabase
        .from('product_images')
        .update({ display_order: i + 1 })
        .eq('id', imageIds[i]);

      if (error) {
        console.error('Error reordering images:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error reordering images:', error);
    return false;
  }
}

// Enhanced getProducts function that includes images
export async function getProductsWithImages(): Promise<Product[]> {
  try {
    const products = await getProducts();
    
    // Fetch images for each product
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const images = await getProductImages(product.id);
        return {
          ...product,
          images: images
        };
      })
    );

    return productsWithImages;
  } catch (error) {
    console.error('Error fetching products with images:', error);
    return [];
  }
}

// Utility function to get the primary image URL from a product
export function getPrimaryImageUrl(product: Product): string {
  // If product has images array and it's not empty, use the primary image
  if (product.images && product.images.length > 0) {
    const primaryImage = product.images.find(img => img.is_primary)
    if (primaryImage && primaryImage.image_url) {
      return primaryImage.image_url
    }
    // If no primary image is set, use the first image
    if (product.images[0].image_url) {
      return product.images[0].image_url
    }
  }
  
  // Fallback to the original image_url field
  if (product.image_url) {
    return product.image_url
  }
  
  // Final fallback to a placeholder image
  return '/placeholder-product.svg'
}

// Utility function to get all images for a product
export function getProductImageUrls(product: Product): string[] {
  if (product.images && product.images.length > 0) {
    return product.images.map(img => img.image_url)
  }
  
  // Fallback to the original image_url field
  return product.image_url ? [product.image_url] : []
}

// CRUD functions for products
export async function addProduct(productData: Omit<Product, 'id' | 'rating' | 'reviews'> & { features?: string[], color?: string }): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        original_price: productData.original_price || productData.price, // Use provided original_price or fallback to current price
        image_url: productData.image_url,
        category: productData.category,
        rating: 0, // Default rating
        reviews: 0, // Default reviews
        features: productData.features || [], // Use provided features or default empty array
        color: productData.color || null, // Use provided color or null
        in_stock: productData.in_stock,
        discount: productData.discount,
        hidden_on_home: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      return null;
    }

    return data as unknown as Product;
  } catch (error) {
    console.error('Error adding product:', error);
    return null;
  }
}

export async function updateProduct(productId: number, productData: Partial<Omit<Product, 'id' | 'rating' | 'reviews'>> & { features?: string[], color?: string }): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        original_price: productData.original_price,
        image_url: productData.image_url,
        category: productData.category,
        features: productData.features,
        color: productData.color,
        in_stock: productData.in_stock,
        discount: productData.discount
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return null;
    }

    return data as unknown as Product;
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
}

export async function deleteProduct(productId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}