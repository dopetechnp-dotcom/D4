"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useLogoUrl, useVideoUrl } from "@/hooks/use-assets"

import { useRouter } from "next/navigation"
import { SlidingCardCarousel } from "@/components/sliding-card-carousel"
import { EnhancedHeader } from "@/components/enhanced-header"
import { EnhancedFooter } from "@/components/enhanced-footer"
import { useHeroCarousel } from "@/hooks/use-hero-carousel"
import { PageTransition, useFluidNavigation, useScrollAnimation, useSmoothScroll } from "@/components/page-transition"
import { DraggableMarquee } from "@/components/draggable-marquee"
import { LoadingSkeleton, LoadingSpinner, LoadingOverlay } from "@/components/loading-skeleton"
import { PerformanceOptimizer, useLoadingState } from "@/components/performance-optimizer"
import {
  Headphones,
  Keyboard,
  Mouse,
  Speaker,
  Search,
  ShoppingBag,
  Camera,
  Cable,
  Plus,
  Minus,
  X,
  Grid,
  Menu,
  Instagram,
  Gamepad2,
  Laptop,
  Smartphone,
  Monitor,
  ChevronDown,
  Edit,
} from "lucide-react"
// Removed CursorTracker (opt-in effect)
import LazyAIChat from "@/components/lazy-ai-chat"
import SupabaseCheckout from "@/components/supabase-checkout"
import { getProducts, getDopePicks, getWeeklyPicks, type Product, getPrimaryImageUrl } from "@/lib/products-data"
import { useCart } from "@/contexts/cart-context"
import { CartItemEditor } from "@/components/cart-item-editor"
import { supabase } from "@/lib/supabase"

// Client-side only component to prevent hydration mismatches
const ClientOnly = ({ children, fallback = null }: { children: React.ReactNode, fallback?: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Splash Screen Component - Client Only
const SplashScreen = ({ isVisible, onComplete }: { isVisible: boolean, onComplete: () => void }) => {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [currentIconIndex, setCurrentIconIndex] = useState(0)
  const [isIconTransitioning, setIsIconTransitioning] = useState(false)
  
  // Get categories from localStorage or use defaults
  const getCategories = () => {
    if (typeof window !== 'undefined') {
      try {
        const adminCategories = localStorage.getItem('adminCategories')
        if (adminCategories) {
          try {
            const parsed = JSON.parse(adminCategories)
            // Add icons to categories
            const result = parsed.map((cat: any) => {
              // If category has a custom icon, use it
              if (cat.icon && cat.icon !== "Grid") {
                if (cat.icon.startsWith('<svg')) {
                  // Return SVG content as a special object that will be handled by SvgIcon
                  return {
                    ...cat,
                    icon: { type: 'svg', content: cat.icon }
                  }
                } else {
                  // Map common Lucide icon names to components
                  const iconComponent = 
                    cat.icon === "Gamepad2" ? Gamepad2 :
                    cat.icon === "Laptop" ? Laptop :
                    cat.icon === "Smartphone" ? Smartphone :
                    cat.icon === "Headphones" ? Headphones :
                    cat.icon === "Speaker" ? Speaker :
                    cat.icon === "Monitor" ? Monitor :
                    cat.icon === "Cable" ? Cable :
                    cat.icon === "Keyboard" ? Keyboard :
                    cat.icon === "Mouse" ? Mouse :
                    cat.icon === "Camera" ? Camera :
                    Grid // Default fallback
                  
                  return {
                    ...cat,
                    icon: iconComponent as React.ComponentType<{ className?: string }>
                  }
                }
              }
              
              // Use default icon mapping for existing categories
              return {
                ...cat,
                icon: (cat.id === "all" ? Grid :
                      cat.id === "keyboard" ? Keyboard :
                      cat.id === "mouse" ? Mouse :
                      cat.id === "audio" ? Headphones :
                      cat.id === "speaker" ? Speaker :
                      cat.id === "monitor" ? Monitor :
                      cat.id === "accessory" ? Cable : Grid) as React.ComponentType<{ className?: string }>
              }
            })
            return result
          } catch (e) {
            console.error('Error parsing admin categories:', e)
          }
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error)
      }
    }
    return [
      { id: "all", name: "All Products", icon: Grid },
      { id: "keyboard", name: "Keyboards", icon: Keyboard },
      { id: "mouse", name: "Mouse", icon: Mouse },
      { id: "audio", name: "Audio", icon: Headphones },
      { id: "speaker", name: "Speakers", icon: Speaker },
      { id: "monitor", name: "Monitors", icon: Monitor },
      { id: "accessory", name: "Accessories", icon: Cable },
    ]
  }

  const categories = getCategories()
  
  const steps = [
    "Initializing DopeTech...",
    "Loading your curated picks...",
    "Preparing the experience...",
    "Almost ready..."
  ]

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 500) // Small delay for smooth transition
          return 100
        }
        return prev + 2
      })
    }, 50)

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) return prev
        return prev + 1
      })
    }, 800)

    // Rotate through every other icon (alternating) every 1.2 seconds, excluding "All Products"
    const iconInterval = setInterval(() => {
      setIsIconTransitioning(true)
      setTimeout(() => {
        setCurrentIconIndex(prev => {
          const nextIndex = prev + 2
          // Skip "All Products" (index 0) and only cycle through specific categories
          const filteredCategories = categories.filter(cat => cat.id !== "all")
          return nextIndex >= filteredCategories.length ? 0 : nextIndex
        })
        setTimeout(() => setIsIconTransitioning(false), 100)
      }, 250)
    }, 1200)

    return () => {
      clearInterval(interval)
      clearInterval(stepInterval)
      clearInterval(iconInterval)
    }
  }, [isVisible, onComplete, steps.length, categories.length])

  if (!isVisible) return null

  // Filter out "All Products" and get the current category
  const filteredCategories = categories.filter(cat => cat.id !== "all")
  const currentCategory = filteredCategories[currentIconIndex] || filteredCategories[0]
  const CurrentIcon = currentCategory.icon

  return (
    <div className="w-full h-screen bg-[#F7DD0F] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Rotating Category Icons */}
        <div className="mb-8">
          <div className="w-48 h-48 mx-auto mb-6 flex items-center justify-center">
            <div className="relative">
              {/* Icon Container - No black circle with smooth transitions */}
              <div className="w-32 h-32 flex items-center justify-center">
                <div className="relative w-16 h-16">
                  <CurrentIcon 
                    className={`w-16 h-16 text-black transition-all duration-300 ease-in-out transform ${
                      isIconTransitioning 
                        ? 'opacity-0 scale-75 rotate-12' 
                        : 'opacity-100 scale-100 rotate-0 animate-pulse'
                    }`} 
                  />
                </div>
              </div>
              
              {/* Category Name */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <p className={`text-black font-bold text-sm whitespace-nowrap transition-all duration-300 ease-in-out ${
                  isIconTransitioning 
                    ? 'opacity-0 translate-y-2' 
                    : 'opacity-100 translate-y-0'
                }`}>
                  {currentCategory.name}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading Text */}
        <p className="text-black font-semibold mb-2 text-lg">
          {steps[currentStep]}
        </p>
        
        {/* Progress Percentage */}
        <p className="text-black text-sm mb-6">
          {progress}%
        </p>
        
        {/* Animated Dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        {/* Tagline */}
        <p className="text-black text-xs mt-6">
          Your Setup, <span className="text-black font-bold">Perfected</span>
        </p>
      </div>
    </div>
  )
}

// Product type is now imported from lib/products-data

export default function DopeTechEcommerce() {
  const router = useRouter()
  const { logoUrl, loading: logoLoading } = useLogoUrl()
  const { videoUrl, loading: videoLoading } = useVideoUrl()
  const [scrollY, setScrollY] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [dopePicks, setDopePicks] = useState<Product[]>([])
  const [weeklyPicks, setWeeklyPicks] = useState<Product[]>([])
  
  // Fluid navigation hooks
  const { navigateWithTransition, isNavigating } = useFluidNavigation()
  const { scrollToElement, scrollToTop } = useSmoothScroll()
  useScrollAnimation()
  
  // Hero carousel hook
  const { slides: heroSlides, loading: heroLoading } = useHeroCarousel()
  
  // Performance optimization hooks
  const { isLoading: isDataLoading, withLoading } = useLoadingState()
  
  // Splash screen state
  const [showSplash, setShowSplash] = useState(true)
  const [isAppReady, setIsAppReady] = useState(false)

  const [editingCartItem, setEditingCartItem] = useState<number | null>(null)
  const { 
    cart, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    updateCartItemSelections,
    getCartCount, 
    getCartTotal, 
    cartOpen, 
    setCartOpen,
    checkoutModalOpen,
    setCheckoutModalOpen,
    clearCart
  } = useCart()

  // Get products from Supabase (no local storage fallback)
  const getLocalProducts = (): Product[] => {
    return products
  }
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchDraft, setSearchDraft] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchModalReady, setSearchModalReady] = useState(false)
  const [currentProducts, setCurrentProducts] = useState<Product[]>([])
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  

  
  const [showBackToCategories, setShowBackToCategories] = useState(false)
  const [showJumpButton, setShowJumpButton] = useState(false)
  const [isCategoryInView, setIsCategoryInView] = useState(true)
  const [categoryIconIndex, setCategoryIconIndex] = useState(0)
  const [headerOffset, setHeaderOffset] = useState<number>(72)
  const [isAdmin, setIsAdmin] = useState(false)
  const [promoOrder, setPromoOrder] = useState<number[]>([])
  const [draggedPromoIndex, setDraggedPromoIndex] = useState<number | null>(null)

  const [userBehavior, setUserBehavior] = useState({
    viewedProducts: [] as number[],
    cartItems: [] as number[],
    searchHistory: [] as string[]
  })

  const [animationKey, setAnimationKey] = useState(0)
  const [isLoading, setIsLoading] = useState(false) // Start as false to prevent hydration mismatch
  const [isClientLoading, setIsClientLoading] = useState(false) // Client-only loading state
  const [posterIndex, setPosterIndex] = useState(0)
  const searchModalRef = useRef<HTMLDivElement>(null)
  const categorySectionRef = useRef<HTMLDivElement>(null)
  

  // Handle splash screen completion
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false)
    setIsAppReady(true)
  }, [])

  // Optimized scroll handler with passive listener
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => setScrollY(window.scrollY)
      window.addEventListener("scroll", handleScroll, { passive: true })
      
      return () => {
        window.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])

  // Product fetching with optimized loading states and real-time updates
  useEffect(() => {
    let isMounted = true

    const fetchProducts = async () => {
      try {
        await withLoading(async () => {
          // Add timeout to prevent infinite loading
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 8000) // 8 second timeout
          })
          
          const productsPromise = getProducts()
          const supabaseProducts = await Promise.race([productsPromise, timeoutPromise]) as Product[]
          
          if (isMounted) {
            if (supabaseProducts && supabaseProducts.length > 0) {
              setProducts(supabaseProducts)
              setCurrentProducts(supabaseProducts)
            } else {
              setProducts([])
              setCurrentProducts([])
            }
            setIsClientLoading(false)
          }
        }, 'Loading products...')
      } catch (error) {
        console.error('❌ Error fetching products:', error)
        if (isMounted) {
          setProducts([])
          setCurrentProducts([])
          setIsClientLoading(false)
        }
      }
    }

    // Add a fallback timeout to ensure loading state is always cleared
    const fallbackTimeout = setTimeout(() => {
      if (isMounted) {
        setIsClientLoading(false)
      }
    }, 12000) // 12 second fallback

    fetchProducts()

    return () => {
      isMounted = false
      clearTimeout(fallbackTimeout)
    }
  }, [withLoading])

  // Real-time subscription to product changes
  useEffect(() => {
    const subscription = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          // Refresh products when any change occurs
          const refreshProducts = async () => {
            try {
              const updatedProducts = await getProducts()
              setProducts(updatedProducts)
              setCurrentProducts(updatedProducts)
              
              // Show a subtle notification that products were updated
              const notification = document.createElement('div')
              notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full'
              notification.textContent = '🔄 Products updated'
              document.body.appendChild(notification)
              
              // Animate in
              setTimeout(() => {
                notification.classList.remove('translate-x-full')
              }, 100)
              
              // Remove after 3 seconds
              setTimeout(() => {
                notification.classList.add('translate-x-full')
                setTimeout(() => {
                  document.body.removeChild(notification)
                }, 300)
              }, 3000)
            } catch (error) {
              console.error('Error refreshing products after real-time update:', error)
            }
          }
          
          refreshProducts()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Fetch dope picks (random selection of max 6 products)
  useEffect(() => {
    let isMounted = true

    const fetchDopePicks = async () => {
      try {
        // Fetching dope picks from Supabase
        
        const dopePicksData = await getDopePicks(6)
        
        if (isMounted) {
          // Dope picks fetched successfully
          setDopePicks(dopePicksData)
        }
      } catch (error) {
        console.error('❌ Error fetching dope picks:', error)
        if (isMounted) {
          setDopePicks([])
        }
      }
    }

    fetchDopePicks()

    return () => {
      isMounted = false
    }
  }, [])

  // Fetch weekly picks (random selection of max 4 products)
  useEffect(() => {
    let isMounted = true

    const fetchWeeklyPicks = async () => {
      try {
        // Fetching weekly picks from Supabase
        
        const weeklyPicksData = await getWeeklyPicks(4) // Fetch 4 products for 2x2 grid
        
        if (isMounted) {
          // Weekly picks fetched successfully
          setWeeklyPicks(weeklyPicksData)
        }
      } catch (error) {
        console.error('❌ Error fetching weekly picks:', error)
        if (isMounted) {
          setWeeklyPicks([])
        }
      }
    }

    fetchWeeklyPicks()

    return () => {
      isMounted = false
    }
  }, [])

  // Optimized header height measurement
  useEffect(() => {
    const updateOffset = () => {
      if (typeof window === 'undefined') return
      
      const header = document.querySelector('header.dopetech-nav') as HTMLElement | null
      const h = header ? header.getBoundingClientRect().height : 56
      const extra = window.innerWidth >= 1024 ? 8 : 16
      setHeaderOffset(Math.round(h + extra))
    }

    // Delay the initial update to ensure DOM is ready
    const timer = setTimeout(updateOffset, 0)

    const onResize = () => updateOffset()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onResize, { passive: true })
    }

    let ro: ResizeObserver | null = null
    if (typeof window !== 'undefined' && typeof ResizeObserver !== 'undefined') {
      const header = document.querySelector('header.dopetech-nav')
      if (header) {
        ro = new ResizeObserver(updateOffset)
        ro.observe(header)
      }
    }

    return () => {
      clearTimeout(timer)
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', onResize)
      }
      if (ro) ro.disconnect()
    }
  }, [isMobileMenuOpen, isSearchOpen])

  // Optimized search debouncing
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchDraft), 200)
    return () => clearTimeout(t)
  }, [searchDraft])

  // Update currentProducts when products state changes
  useEffect(() => {
    setCurrentProducts(products)
  }, [products])

  // Initialize admin mode and promo order preferences
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const flag = localStorage.getItem('adminAuthenticated') === 'true'
      setIsAdmin(!!flag)
      const stored = localStorage.getItem('promoOrderV1')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setPromoOrder(parsed.filter((id: any) => Number.isFinite(id)))
        }
      }
    } catch (e) {
      console.error('Error reading admin/promo order:', e)
    }
  }, [])

  // Optimized event listeners
  useEffect(() => {
    const handleGifChange = () => {
      setAnimationKey(prev => prev + 1)
    }

    window.addEventListener('gifUpdated', handleGifChange)
    
    return () => {
      window.removeEventListener('gifUpdated', handleGifChange)
    }
  }, [])

  // Optimized search modal handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false)
        setSearchQuery("")
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (searchModalRef.current && !searchModalRef.current.contains(e.target as Node) && searchModalReady) {
        setIsSearchOpen(false)
        setSearchQuery("")
      }
    }

    if (isSearchOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isSearchOpen, searchModalReady])

  // Optimized modal ready state
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        setSearchModalReady(true)
      }, 100)
      return () => {
        clearTimeout(timer)
        setSearchModalReady(false)
      }
    } else {
      setSearchModalReady(false)
    }
  }, [isSearchOpen])

  // Optimized mobile menu handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setIsMobileMenuOpen(false)
    }

    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobileMenuOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleDropdownClickOutside = (event: MouseEvent) => {
      if (activeDropdown && !(event.target as Element).closest('[data-dropdown]')) {
        setActiveDropdown(null)
      }
    }

    if (activeDropdown) {
      document.addEventListener('mousedown', handleDropdownClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleDropdownClickOutside)
    }
  }, [activeDropdown])

  // Optimized theme setting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        document.documentElement.classList.add("dark")
        localStorage.setItem("theme", "dark")
      } catch (error) {
        console.error('Error setting theme:', error)
      }
    }
  }, [])

  // Optimized animation restart
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1)
    }, 20000)

    return () => clearInterval(interval)
  }, [])

  // Optimized category section visibility with fallback
  useEffect(() => {
    const el = categorySectionRef.current
    if (!el || typeof window === 'undefined') return
    
    // Primary: Intersection Observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCategoryInView(entry.isIntersecting)
      },
      { root: null, threshold: 0.2 }
    )
    observer.observe(el)
    
    // Fallback: Scroll position check
    const handleScroll = () => {
      if (el) {
        const rect = el.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0
        setIsCategoryInView(isVisible)
      }
    }
    
    // Initial check with delay to ensure DOM is ready
    setTimeout(handleScroll, 100)
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    setShowBackToCategories(!isCategoryInView)
  }, [isCategoryInView])

  // Show jump button when categories are not in view
  useEffect(() => {
    setShowJumpButton(showBackToCategories)
  }, [showBackToCategories])

  // Optimized poster auto-scroll
  useEffect(() => {
    if (products.length === 0) return
    
    const interval = setInterval(() => {
      const container = document.querySelector('.flex.overflow-x-auto.scrollbar-hide') as HTMLElement;
      if (container && !container.classList.contains('user-interacting')) {
        const productsToShow = products.filter((p: any) => !p.hidden_on_home).slice(0, 5);
        if (productsToShow.length === 0) return
        
        const currentIndex = posterIndex;
        const nextIndex = (currentIndex + 1) % productsToShow.length;
        
        const slideWidth = container.clientWidth;
        const newScrollLeft = nextIndex * slideWidth;
        
        container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
        setPosterIndex(nextIndex);
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [posterIndex, products])

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
    // Clear search when switching categories
    setSearchQuery("")
    
    // Fluid scroll to products section with enhanced animation
    setTimeout(() => {
      const productsSection = document.querySelector('[data-products-section]')
      if (productsSection) {
        const header = document.querySelector('header.dopetech-nav') as HTMLElement | null
        const headerHeight = header ? header.offsetHeight + 12 : 72
        const rect = productsSection.getBoundingClientRect()
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const targetPosition = scrollTop + rect.top - headerHeight
        
        // Enhanced smooth scroll with easing
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        })
      }
    }, 100)
  }

  const scrollToCategoryFilters = () => {
    setTimeout(() => {
      const header = document.querySelector('header.dopetech-nav') as HTMLElement | null
      const headerHeight = header ? header.offsetHeight + 12 : 72
      const elem = categorySectionRef.current
      if (elem) {
        const rect = elem.getBoundingClientRect()
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const targetPosition = scrollTop + rect.top - headerHeight
        window.scrollTo({ top: targetPosition, behavior: 'smooth' })
      }
    }, 50)
  }

  const handleAddToCartWithTracking = (product: Product) => {
    addToCart(product, 1)
    
    // Track user behavior for AI recommendations
    setUserBehavior(prev => ({
      ...prev,
      cartItems: [...prev.cartItems, product.id]
    }))
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!")
      return
    }
    
    setCheckoutModalOpen(true)
  }

  const handleCartReset = () => {
    clearCart()
    setCheckoutModalOpen(false)
  }

  const filteredProducts = useMemo(() => {
    return currentProducts.filter(product => {
      // Hide products explicitly flagged to be hidden on home
      if (product.hidden_on_home) return false
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      // If there's a search query, prioritize search results over category filtering
      if (searchQuery.trim()) {
        return matchesSearch
      }
      
      // If no search query, filter by category
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      return matchesCategory
    })
  }, [currentProducts, searchQuery, selectedCategory])

  // Lightweight set of promo products for the top cards (hidden_on_home excluded)
  // Always fill to a max of 6 items deterministically (no Math.random for SSR safety)
  // Apply admin-defined ordering if available
  const promoProducts = useMemo(() => {
    const PROMO_CARD_MAX = 6
    const visible = currentProducts.filter((p) => !p.hidden_on_home)
    // Reorder by admin preference
    const orderSet = new Set(promoOrder)
    const orderedByAdmin = [
      ...promoOrder
        .map((id) => visible.find((p) => p.id === id))
        .filter((p): p is Product => !!p),
      ...visible.filter((p) => !orderSet.has(p.id)),
    ]
    const base = orderedByAdmin.slice(0, PROMO_CARD_MAX)
    if (base.length === PROMO_CARD_MAX) return base
    const remaining = PROMO_CARD_MAX - base.length
    const restPool = orderedByAdmin.slice(base.length)
    const extras: Product[] = []
    // Prefer unused visible items first
    for (let i = 0; i < remaining && i < restPool.length; i++) {
      extras.push(restPool[i])
    }
    // If still short, repeat from base with a deterministic offset
    if (extras.length < remaining && base.length > 0) {
      const start = currentProducts.length % base.length
      for (let i = 0; extras.length < remaining; i++) {
        const idx = (start + i) % base.length
        extras.push(base[idx])
      }
    }
    return [...base, ...extras]
  }, [currentProducts, promoOrder])

  // Desktop-only extra promo grid (up to 6 additional squares, avoid duplicates when possible)
  const promoProductsDesktopExtra = useMemo(() => {
    const EXTRA_MAX = 6
    const visible = currentProducts.filter((p) => !p.hidden_on_home)
    const orderSet = new Set(promoOrder)
    const orderedByAdmin = [
      ...promoOrder
        .map((id) => visible.find((p) => p.id === id))
        .filter((p): p is Product => !!p),
      ...visible.filter((p) => !orderSet.has(p.id)),
    ]
    // Skip the first 6 used in the main grid
    const start = 6
    const extra = orderedByAdmin.slice(start, start + EXTRA_MAX)
    return extra
  }, [currentProducts, promoOrder])

  // Debug logging removed for performance

  // Get categories from localStorage or use defaults
  // SVG Icon Component
  const SvgIcon = ({ svgContent, className }: { svgContent: string, className?: string }) => (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'currentColor'
      }}
    />
  )

  // Type for category icons
  type CategoryIcon = React.ComponentType<{ className?: string }> | { type: 'svg', content: string }

  // Helper function to render category icons
  const renderCategoryIcon = (icon: CategoryIcon, className: string) => {
    if (typeof icon === 'object' && 'type' in icon && icon.type === 'svg') {
      return <SvgIcon svgContent={icon.content} className={className} />
    }
    const IconComp = icon as React.ComponentType<{ className?: string }>
    return <IconComp className={className} />
  }

  // Promo card shape options and deterministic picker
  // Use a consistent radius across all promo cards to avoid visual unevenness
  const promoShapeOptions = [
    "rounded-2xl",
  ] as const

  // Deterministic shape picker to avoid hydration mismatches (SSR = Client)
  // Still gives variety across items by using id + index salt.
  const getPromoShape = (id: number, index: number) => {
    const seed = Number.isFinite(id) ? id + index * 7 : index
    const idx = Math.abs(seed) % promoShapeOptions.length
    return promoShapeOptions[idx]
  }

  // Mosaic layout for exactly up to 6 items (desktop-friendly, no gaps)
  // xs: all squares; sm+: hero + vertical + horizontals arranged to fill 3 columns
  const getPromoLayout = (index: number, total: number) => {
    // Always squares on xs
    const xs = "col-span-1 row-span-1"
    if (total <= 4) {
      return { wrapper: xs, ratio: "" }
    }
    if (total === 5) {
      // Layout for 5: hero(2x2), one vertical, two squares
      const map = [
        `${xs} sm:col-span-2 sm:row-span-2`, // 0 hero
        `${xs} sm:col-span-1 sm:row-span-2`, // 1 vertical
        xs,                                   // 2 square
        xs,                                   // 3 square
        xs,                                   // 4 square
      ]
      return { wrapper: map[index % 5], ratio: "" }
    }
    // total >= 6 (we cap at 6)
    // Layout for 6: hero(2x2), vertical(1x2), horizontal(2x1), square, horizontal(2x1), square
    // This produces two fully-filled rows after the top block (no gaps)
    const map6 = [
      `${xs} sm:col-span-2 sm:row-span-2`, // 0 hero
      `${xs} sm:col-span-1 sm:row-span-2`, // 1 vertical
      `${xs} sm:col-span-2 sm:row-span-1`, // 2 horizontal
      xs,                                   // 3 square
      `${xs} sm:col-span-2 sm:row-span-1`, // 4 horizontal
      xs,                                   // 5 square
    ]
    return { wrapper: map6[index % 6], ratio: "" }
  }

  // Admin drag helpers
  const handlePromoDragStart = (index: number) => {
    if (!isAdmin) return
    setDraggedPromoIndex(index)
  }

  const handlePromoDragOver = (e: React.DragEvent) => {
    if (!isAdmin) return
    e.preventDefault()
  }

  const handlePromoDrop = (dropIndex: number) => {
    if (!isAdmin) return
    if (draggedPromoIndex === null || draggedPromoIndex === dropIndex) return
    // Combine both grids for unified ordering on desktop
    const currentIds = [...promoProducts, ...promoProductsDesktopExtra].map((p) => p.id)
    const moved = [...currentIds]
    const [m] = moved.splice(draggedPromoIndex, 1)
    if (m === undefined) return
    moved.splice(Math.min(dropIndex, moved.length), 0, m)
    // Merge moved order to the front of existing preference
    const merged = [...moved, ...promoOrder.filter((id) => !moved.includes(id))]
    setPromoOrder(merged)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('promoOrderV1', JSON.stringify(merged))
        window.dispatchEvent(new Event('promoOrderUpdated'))
      }
    } catch {}
    setDraggedPromoIndex(null)
  }

  const getCategories = () => {
    if (typeof window !== 'undefined') {
      try {
        const adminCategories = localStorage.getItem('adminCategories')
        if (adminCategories) {
          try {
            const parsed = JSON.parse(adminCategories)
            // Add icons to categories
            const result = parsed.map((cat: any) => {
              // If category has a custom icon, use it
              if (cat.icon && cat.icon !== "Grid") {
                if (cat.icon.startsWith('<svg')) {
                  // Return SVG content as a special object that will be handled by SvgIcon
                  return {
                    ...cat,
                    icon: { type: 'svg', content: cat.icon }
                  }
                } else {
                  // Map common Lucide icon names to components
                  const iconComponent = 
                    cat.icon === "Gamepad2" ? Gamepad2 :
                    cat.icon === "Laptop" ? Laptop :
                    cat.icon === "Smartphone" ? Smartphone :
                    cat.icon === "Headphones" ? Headphones :
                    cat.icon === "Speaker" ? Speaker :
                    cat.icon === "Monitor" ? Monitor :
                    cat.icon === "Cable" ? Cable :
                    cat.icon === "Keyboard" ? Keyboard :
                    cat.icon === "Mouse" ? Mouse :
                    cat.icon === "Camera" ? Camera :
                    Grid // Default fallback
                  
                  return {
                    ...cat,
                    icon: iconComponent as React.ComponentType<{ className?: string }>
                  }
                }
              }
              
              // Use default icon mapping for existing categories
              return {
                ...cat,
                icon: (cat.id === "all" ? Grid :
                      cat.id === "keyboard" ? Keyboard :
                      cat.id === "mouse" ? Mouse :
                      cat.id === "audio" ? Headphones :
                      cat.id === "speaker" ? Speaker :
                      cat.id === "monitor" ? Monitor :
                      cat.id === "accessory" ? Cable : Grid) as React.ComponentType<{ className?: string }>
              }
            })
            return result
          } catch (e) {
            console.error('Error parsing admin categories:', e)
          }
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error)
      }
    }
    return [
      { id: "all", name: "All Products", icon: Grid },
      { id: "keyboard", name: "Keyboards", icon: Keyboard },
      { id: "mouse", name: "Mouse", icon: Mouse },
      { id: "audio", name: "Audio", icon: Headphones },
      { id: "speaker", name: "Speakers", icon: Speaker },
      { id: "monitor", name: "Monitors", icon: Monitor },
      { id: "accessory", name: "Accessories", icon: Cable },
    ]
  }

  const [categories, setCategories] = useState<{ id: string; name: string; icon: CategoryIcon }[]>([
    { id: "all", name: "All Products", icon: Grid },
    { id: "keyboard", name: "Keyboards", icon: Keyboard },
    { id: "mouse", name: "Mouse", icon: Mouse },
    { id: "audio", name: "Audio", icon: Headphones },
    { id: "speaker", name: "Speakers", icon: Speaker },
    { id: "monitor", name: "Monitors", icon: Camera },
    { id: "accessory", name: "Accessories", icon: Cable },
  ])

  // Initialize categories from localStorage or use defaults
  useEffect(() => {
    const adminCategories = getCategories()
    setCategories(adminCategories)
  }, [])

  // Optimized category icon cycling
  useEffect(() => {
    if (!showBackToCategories || categories.length === 0) return
    const id = setInterval(() => {
      setCategoryIconIndex((prev) => (prev + 1) % categories.length)
    }, 900)
    return () => clearInterval(id)
  }, [showBackToCategories, categories])

  return (
    <>
      {/* Splash Screen - Client Only */}
      <ClientOnly fallback={null}>
        <SplashScreen isVisible={showSplash} onComplete={handleSplashComplete} />
      </ClientOnly>

      {/* Main App Content - Only show when splash is complete */}
      {isAppReady && (
        <PageTransition>
          <div className="text-white min-h-screen transition-colors duration-100 tap-feedback scrollbar-hide gradient-bg">
            {/* SEO handled by layout.tsx metadata */}

      {/* Enhanced Frosted Glass Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 dopetech-nav animate-fade-in-down">
        <div className="container-full py-2">
          <nav className="flex items-center justify-between h-auto min-h-16">
            {/* Left Side - Mobile Menu Toggle (mobile only) */}
            <div className="flex items-center md:hidden pt-1">
              <ClientOnly fallback={<button className="p-2 touch-target flex items-center justify-center" aria-label="Menu"><Menu className="w-6 h-6 hover:text-[#F7DD0F] transition-colors" /></button>}>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 touch-target flex items-center justify-center"
                  aria-label="Menu"
                  data-mobile-menu
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6 hover:text-[#F7DD0F] transition-colors animate-scale-in" />
                  ) : (
                    <Menu className="w-6 h-6 hover:text-[#F7DD0F] transition-colors" />
                  )}
                </button>
              </ClientOnly>
            </div>

            {/* Left Side - Logo and Tagline */}
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <ClientOnly fallback={
                <img 
                  src="/logo/simple-logo.svg" 
                  alt="DopeTech" 
                  className="w-10 h-10 logo-adaptive flex-shrink-0 origin-left scale-[1.3]" 
                />
              }>
                <img 
                  src={logoLoading ? "/logo/simple-logo.svg" : logoUrl} 
                  alt="DopeTech" 
                  className="w-10 h-10 logo-adaptive flex-shrink-0 origin-left scale-[1.3]" 
                />
              </ClientOnly>
              
              {/* Tagline */}
              <div className="ml-3">
                <p className="text-sm text-gray-300 font-medium leading-tight">
                  Your Setup, <span className="text-[#F7DD0F]">Perfected</span>
                </p>
                <ClientOnly fallback={<p className="text-xs text-gray-400 leading-tight">Premium Tech Gear from <span className="text-[#F7DD0F]">DopeTech</span> Nepal</p>}>
                  <p className="hidden md:block text-xs text-gray-400 leading-tight">
                    Premium Tech Gear from <span className="text-[#F7DD0F]">DopeTech</span> Nepal
                  </p>
                </ClientOnly>
              </div>
            </div>

            {/* Center - Desktop Search Bar */}
            <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
              <div className="relative w-[28rem]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search for keyboards, mice, headphones, speakers..."
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-white/10 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F7DD0F] focus:border-transparent text-white placeholder-gray-400"
                />
              </div>
            </div>



            {/* Right Side - Controls */}
            <div className="flex items-center justify-end space-x-4 flex-shrink-0">
              {/* Search Toggle - Mobile Only */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden p-2 touch-target flex items-center justify-center"
                aria-label="Search"
              >
                <Search className="w-6 h-6 hover:text-[#F7DD0F] transition-colors" />
              </button>

              {/* Shopping Cart with Badge */}
              <button 
                onClick={() => setCartOpen(true)}
                className="relative p-2 touch-target flex items-center justify-center" 
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-6 h-6 hover:text-[#F7DD0F] transition-colors" />
                <ClientOnly fallback={null}>
                  {getCartCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#F7DD0F] text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-bounce">
                      {getCartCount()}
                    </span>
                  )}
                </ClientOnly>
              </button>

              {/* Instagram Button */}
              <a
                href="https://www.instagram.com/dopetech_np/?hl=ne"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 touch-target flex items-center justify-center"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6 hover:text-[#F7DD0F] transition-colors" />
              </a>
            </div>
          </nav>



          {/* Desktop Search Modal */}
          {isSearchOpen && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-4"
            >
              <div 
                ref={searchModalRef}
                className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md lg:max-w-2xl mx-4 animate-scale-in mt-16 sm:mt-20"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Search Products</h3>
                  <button
                    onClick={() => {
                      setIsSearchOpen(false)
                      setSearchQuery("")
                    }}
                    className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-lg transition-colors touch-target"
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Search for keyboards, mice, headphones, speakers..."
                    value={searchDraft}
                    onChange={(e) => setSearchDraft(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-base sm:text-lg bg-white/10 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F7DD0F] focus:border-transparent text-white placeholder-gray-400"
                    autoFocus
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 animate-slide-in-down bg-black/95 backdrop-blur-xl rounded-2xl p-3 sm:p-4 md:p-5 border border-gray-700 shadow-2xl md:hidden mobile-menu-enhanced z-50" data-mobile-menu>

              {/* Mobile Tagline */}
              <div className="text-center mb-3 pb-3 border-b border-gray-700">
                <p className="text-sm text-gray-300 font-medium">
                  Your Setup, <span className="text-[#F7DD0F]">Perfected</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Premium Tech Gear from <span className="text-[#F7DD0F]">DopeTech</span> Nepal
                </p>
              </div>
              
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      handleCategoryClick(category.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      selectedCategory === category.id
                        ? "bg-[#F7DD0F] text-black shadow-lg"
                        : "text-white bg-white/5 border border-white/20 hover:bg-white/10 shadow-lg"
                    }`}
                    style={{ minHeight: '48px', minWidth: '44px' }}
                  >
                    {/* Category Icon */}
                    <div className={`flex-shrink-0 ${
                      selectedCategory === category.id ? "text-black" : "text-[#F7DD0F]"
                    }`}>
                      {renderCategoryIcon(category.icon, "w-5 h-5")}
                    </div>
                    
                    {/* Category Name */}
                    <span className="font-medium text-sm">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

             {/* Welcome Section - Enhanced Spacing */}
       <section className="safe-top section-padding relative mobile-hero section-fade-in" style={{ background: 'linear-gradient(135deg, #000000 0%, #1a1a0a 50%, #000000 100%)', paddingTop: headerOffset }}>
        <div className="container-full">
          {/* Page Header */}
          <div className="text-center mb-8">
            {/* Hero heading removed - now in navigation */}
            {/* Tagline removed - now in navigation */}
            
            {/* Hero Sliding Card Carousel */}
            <div className="w-full mx-auto mt-2 mb-2 sm:mb-8 animate-fade-in-up stagger-3">
              <ClientOnly fallback={
                <div className="flex items-center justify-center h-64 bg-gradient-to-br from-gray-900 to-black rounded-2xl">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#F7DD0F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#F7DD0F] font-semibold">Loading Carousel...</p>
                  </div>
                </div>
              }>
                {heroLoading ? (
                  <div className="flex items-center justify-center h-64 bg-gradient-to-br from-gray-900 to-black rounded-2xl">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-[#F7DD0F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-[#F7DD0F] font-semibold">Loading Carousel...</p>
                    </div>
                  </div>
                ) : (
                  <SlidingCardCarousel slides={heroSlides} />
                )}
              </ClientOnly>
            </div>

            {/* Dope Picks Section - Mobile Optimized Spacing */}
            <div className="w-full mx-auto mt-1 sm:mt-6 mb-2 sm:mb-12 animate-fade-in-up stagger-4">
              <div className="text-center mb-2 sm:mb-8 px-2 sm:px-4">
                                 <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-4xl text-kelpt-a2 text-white mb-1 sm:mb-3 text-shadow">
                   Dope <span className="text-gradient">Picks</span>
                 </h2>
                <p className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-lg text-gray-300 font-medium">
                  Handpicked for you
                </p>
              </div>
              
              {/* Draggable Marquee */}
              <DraggableMarquee
                products={dopePicks}
                onAddToCart={handleAddToCartWithTracking}
                className="w-full"
                autoScroll={true}
                scrollSpeed={25}
                pauseOnHover={true}
                showScrollHint={true}
              />
            </div>
            
            {/* Dope Categories Header - Mobile Optimized Spacing */}
            <div className="text-center mb-4 sm:mb-4 animate-fade-in-up stagger-4 px-2 sm:px-4">
                                                             <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-4xl text-kelpt-a2 text-white mb-1 sm:mb-3 text-shadow">
                   Dope <span className="text-gradient">Categories</span>
                 </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-lg text-gray-300 font-medium">
                Filter by your favorite tech categories
              </p>
            </div>

                         {/* Category Filter - Mobile Optimized Spacing */}
             <div ref={categorySectionRef} className="mb-2 sm:mb-12 animate-fade-in-up stagger-5">
               {/* Horizontal Scroll Layout for Mobile, Flex Wrap for Desktop */}
               <div className="flex overflow-x-auto scrollbar-hide gap-2 sm:gap-3 sm:flex-wrap sm:justify-center w-full px-4">
                 {categories.map((category, index) => (
                   <div key={category.id} className="relative animate-fade-in-up flex-shrink-0 sm:flex-shrink" style={{ animationDelay: `${index * 0.1}s` }}>
                     <button
                       onClick={() => handleCategoryClick(category.id)}
                       className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-3 rounded-full transition-all duration-300 cursor-pointer text-xs sm:text-sm min-h-[32px] sm:min-h-[48px] shadow-lg whitespace-nowrap ${
                         selectedCategory === category.id
                           ? "bg-[#F7DD0F] text-black font-bold"
                           : "bg-white/10 hover:bg-white/15 font-medium border border-white/10"
                       }`}
                       aria-label={`Filter by ${category.name}`}
                     >
                       {/* Category Icon */}
                       <div className={`flex-shrink-0 ${
                         selectedCategory === category.id ? "text-black" : "text-[#F7DD0F]"
                       }`}>
                         {renderCategoryIcon(category.icon, "w-3 h-3 sm:w-5 sm:h-5")}
                       </div>
                       
                       {/* Category Name */}
                       <span className="font-medium">{category.name}</span>
                     </button>
                   </div>
                 ))}
               </div>
             </div>
          </div>

                     {/* Products Grid - Uniform Sizing */}
                       <div 
              data-products-section
              className={`grid gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 mt-4 sm:mt-8 md:mt-10 lg:mt-12 cv-auto ${
                viewMode === "grid" 
                  ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6" 
                  : "grid-cols-1"
              }`}>
            {(isLoading || isDataLoading) ? (
              // Loading skeletons
              Array.from({ length: 12 }).map((_, index) => (
                <div 
                  key={`skeleton-${index}`} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <LoadingSkeleton type="product-card" />
                </div>
              ))
            ) : (
                             filteredProducts.map((product, index) => (
               <div key={product.id} data-product-id={product.id} className="group animate-fade-in-up hover-lift product-card-fluid scroll-animate h-full" style={{ animationDelay: `${index * 0.1}s` }}>
                 <div 
                   className="relative bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-yellow-500/20 hover:border-yellow-500/40 cursor-pointer h-full flex flex-col"
                   onClick={() => router.push(`/product/${product.id}`)}
                 >
                   {/* Top Section - Image with White Background */}
                   <div className="relative aspect-[4/3] overflow-hidden bg-white flex-shrink-0">
                    <img
                      src={getPrimaryImageUrl(product)}
                      alt={product.name}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-product.svg';
                      }}
                    />

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
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="bg-yellow-400 text-black hover:bg-yellow-300 transition-all duration-200 font-semibold px-4 py-2 rounded-full"
                        disabled={!product.in_stock}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>

                  {/* Bottom Section - Product Info */}
                  <div className="p-2 sm:p-3 bg-black flex-1 flex flex-col justify-between">
                    {/* Product Name */}
                    <h3 className="text-kelpt-a2 text-white text-xs sm:text-sm mb-1 line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm sm:text-base price-proxima-nova text-yellow-400">
                          Rs {product.price.toLocaleString()}
                        </span>
                        {product.original_price > product.price && (
                          <span className="text-xs price-proxima-nova text-gray-400 line-through">
                            Rs {product.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      {/* Discount Badge */}
                      {product.discount > 0 && (
                        <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          -{product.discount}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </section>

             {/* Dope Weekly Picks Section - Mobile Optimized Spacing */}
       <section className="pt-1 sm:pt-6 md:pt-8 lg:pt-10 pb-2 sm:pb-10 md:pb-12 lg:pb-16 overflow-hidden relative section-slide-in" style={{ background: 'linear-gradient(135deg, #000000 0%, #1a1a0a 50%, #000000 100%)' }}>
        <div className="container-full">
          <div className="w-full mx-auto mt-1 sm:mt-4 md:mt-6 lg:mt-8 mb-2 sm:mb-6 md:mb-8 lg:mb-10 animate-fade-in-up stagger-5">
            {/* Section Header - Outside the Box */}
            <div className="text-center mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-4xl text-kelpt-a2 text-white mb-1 sm:mb-3 md:mb-4 text-shadow">
                Dope <span className="text-gradient">Weekly Picks</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-lg text-gray-300 font-medium mb-4 sm:mb-6 md:mb-8">
                This week's featured selections
              </p>
            </div>

            {/* Yellow Box Container - Products Only */}
            <div className="bg-[#F7DD0F] border-2 border-[#F7DD0F] rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 mx-2 sm:mx-4 md:mx-8 lg:mx-12">
            
            {/* Product Grid - Images and Text Combined */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-16 mx-auto px-4 max-w-7xl">
              {weeklyPicks.map((product, index) => (
                <div key={`weekly-pick-${product.id}`} className="animate-fade-in-up w-full max-w-xs mx-auto" style={{ animationDelay: `${index * 0.1}s` }}>
                  {/* Image Section */}
                  <div className="group relative mb-3">
                    <div 
                      className="relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                      onClick={() => router.push(`/product/${product.id}`)}
                    >
                      {/* Full Image Section */}
                      <div className="relative aspect-square overflow-hidden bg-white max-w-full">
                        <img
                          src={getPrimaryImageUrl(product)}
                          alt={product.name}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-product.svg';
                          }}
                        />

                        {/* Stock Badge */}
                        <div className="absolute top-2 right-2 z-10">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.in_stock 
                              ? "bg-green-500/90 text-white" 
                              : "bg-red-500/90 text-white"
                          }`}>
                            {product.in_stock ? "In Stock" : "Out of Stock"}
                          </div>
                        </div>

                        {/* Add to Cart Button Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCartWithTracking(product);
                            }}
                            className="bg-[#F7DD0F] text-black hover:bg-[#F7DD0F]/90 transition-all duration-200 font-semibold px-4 py-2 rounded-full"
                            disabled={!product.in_stock}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Text Section */}
                  <div className="text-center">
                    {/* Product Name - Bigger Text */}
                    <h3 className="text-black font-bold text-base sm:text-lg md:text-xl lg:text-2xl mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
      </section>

             {/* GIF Section - Moved from hero area */}
       <section className="pt-2 sm:pt-8 md:pt-12 lg:pt-16 pb-2 sm:pb-16 md:pb-20 lg:pb-24 overflow-hidden relative section-fade-in" style={{ background: 'linear-gradient(135deg, #000000 0%, #1a1a0a 50%, #000000 100%)' }}>
        <div className="container-full">
          {/* Section Header */}
          <div className="text-center mb-2 sm:mb-6 md:mb-8 lg:mb-10 animate-fade-in-up px-2 sm:px-4">
                         <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-4xl text-kelpt-a2 text-white mb-1 sm:mb-3 md:mb-4 text-shadow">
               Dope <span className="text-gradient">Recommendations</span>
             </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-lg text-gray-300 font-medium">
              Grab these and more on our Instagram
            </p>
          </div>

          {/* Video Container */}
          {videoUrl && (
            <div className="w-full mx-auto animate-fade-in-up borderless-glow cv-auto rounded-2xl overflow-hidden ring-1 ring-white/10 px-4">
              <video
                src={videoUrl}
                className="w-full h-40 sm:h-48 md:h-56 lg:h-64 xl:h-72 2xl:h-80 shadow-xl object-cover object-center"
                autoPlay
                loop
                muted
                playsInline
                key={animationKey}
                onError={(e) => {
                  // Silently handle video errors to prevent console spam
                  const videoElement = e.target as HTMLVideoElement;
                  if (videoElement) {
                    videoElement.style.display = 'none';
                  }
                }}
                onLoadStart={() => {}}
                onCanPlay={() => {}}
              />
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Shopping Cart Sidebar - Mobile Optimized */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          
          <div className="relative ml-auto w-full max-w-[85vw] sm:max-w-sm md:max-w-md bg-black shadow-2xl rounded-l-3xl border-l border-[#F7DD0F]/20">
            <div className="flex flex-col h-full">
              {/* Enhanced Cart Header - Mobile Optimized */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#F7DD0F]/20">
                <h2 className="text-lg sm:text-xl font-bold text-white">Shopping Cart</h2>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-3 sm:p-3 hover:bg-[#F7DD0F]/10 rounded-full transition-colors touch-target"
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              </div>

              {/* Enhanced Cart Items - Mobile Optimized */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 scrollbar-hide">
                {cart.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-3 sm:mb-4" />
                    <p className="text-gray-400 text-base sm:text-lg">Your cart is empty</p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-2">Add some products to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="bg-black border border-[#F7DD0F]/20 rounded-2xl p-3 sm:p-4 space-y-3 sm:space-y-4">
                        <div className="flex items-start space-x-3 sm:space-x-4">
                          <img
                            src={getPrimaryImageUrl(item)}
                            alt={item.name}
                            className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl flex-shrink-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-product.svg';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                                                                                      <h3 className="text-kelpt-a2 text-sm sm:text-base line-clamp-2 leading-tight text-white mb-1">{item.name}</h3>
                             <p className="text-[#F7DD0F] price-proxima-nova text-base sm:text-lg mb-2">Rs {item.price}</p>
                            
                            {/* Quantity Controls - Mobile Optimized */}
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-2 sm:p-2.5 hover:bg-[#F7DD0F]/20 rounded-lg transition-colors touch-target"
                                style={{ minHeight: '40px', minWidth: '40px' }}
                              >
                                <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </button>
                              <span className="w-8 sm:w-10 text-center font-bold text-white text-base sm:text-lg">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-2 sm:p-2.5 hover:bg-[#F7DD0F]/20 rounded-lg transition-colors touch-target"
                                style={{ minHeight: '40px', minWidth: '40px' }}
                              >
                                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Action Buttons - Mobile Optimized */}
                          <div className="flex flex-col space-y-2 flex-shrink-0">
                            <button
                              onClick={() => setEditingCartItem(item.id)}
                              className="p-2 sm:p-2.5 hover:bg-[#F7DD0F]/20 rounded-lg text-[#F7DD0F] transition-colors touch-target"
                              style={{ minHeight: '40px', minWidth: '40px' }}
                            >
                              <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-2 sm:p-2.5 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors touch-target"
                              style={{ minHeight: '40px', minWidth: '40px' }}
                            >
                              <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Product Options - Mobile Optimized */}
                        {(item.selectedColor || (item.selectedFeatures && item.selectedFeatures.length > 0)) && (
                          <div className="pl-0 sm:pl-20 space-y-2">
                            {item.selectedColor && (
                              <div className="flex items-center space-x-2">
                                <span className="text-xs sm:text-sm text-gray-400">Color:</span>
                                <span className="text-xs sm:text-sm font-medium text-white">{item.selectedColor}</span>
                              </div>
                            )}
                            {item.selectedFeatures && item.selectedFeatures.length > 0 && (
                              <div className="flex items-center space-x-2">
                                <span className="text-xs sm:text-sm text-gray-400">Features:</span>
                                <span className="text-xs sm:text-sm font-medium text-white">{item.selectedFeatures.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enhanced Cart Footer - Mobile Optimized */}
              {cart.length > 0 && (
                <div className="border-t border-[#F7DD0F]/20 p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4 sm:mb-4">
                    <span className="text-base sm:text-lg font-semibold text-white">Total:</span>
                                         <span className="text-lg sm:text-xl md:text-2xl price-proxima-nova text-[#F7DD0F]">
                       Rs {getCartTotal().toFixed(2)}
                     </span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-[#F7DD0F] hover:bg-[#F7DD0F]/90 text-black py-4 sm:py-4 px-4 sm:px-6 rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-base sm:text-base touch-target"
                    style={{ minHeight: '48px' }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer - Enhanced Spacing */}
      <footer className="bg-black py-6 sm:py-8 md:py-10 lg:py-12 border-t-2 border-[#F7DD0F]">
        <div className="container-full">
          <div className="flex flex-col md:flex-row justify-between items-center px-4">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 mb-6 sm:mb-8 md:mb-0">
              <ClientOnly fallback={
                <img 
                  src="/logo/simple-logo.svg" 
                  alt="DopeTech" 
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 logo-adaptive" 
                />
              }>
                <img 
                  src={logoLoading ? "/logo/simple-logo.svg" : logoUrl} 
                  alt="DopeTech" 
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 logo-adaptive" 
                />
              </ClientOnly>
              <span className="text-xs sm:text-sm md:text-base text-white jakarta-light font-medium">© 2025 DopeTech Nepal. All rights reserved.</span>
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10">
              <a href="/terms" className="text-xs sm:text-sm md:text-base text-gray-400 hover:text-[#F7DD0F] transition-colors cursor-hover jakarta-light font-medium">
                Terms & Conditions
              </a>
              <a href="/support" className="text-xs sm:text-sm md:text-base text-gray-400 hover:text-[#F7DD0F] transition-colors cursor-hover jakarta-light font-medium">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>



      {/* Jump to Categories floating button - Circular like AI chat */}
      {!cartOpen && !checkoutModalOpen && !isCategoryInView && categories.length > 0 && (
        <button
          onClick={scrollToCategoryFilters}
          className="fixed bottom-6 right-4 md:bottom-8 md:right-6 z-[9999] frosted-glass-yellow frosted-glass-yellow-hover text-black p-4 rounded-full touch-manipulation flex items-center justify-center transition-all duration-300 ease-in-out shadow-lg"
          style={{ minHeight: '56px', minWidth: '56px', maxWidth: '56px', maxHeight: '56px' }}
                     aria-label="Jump to categories"
        >
          {(() => {
            const item = categories[categoryIconIndex]
            if (!item) return null
            const key = `${item.id}-${categoryIconIndex}`
            const commonClasses = "w-5 h-5 block text-[#F7DD0F] animate-fade-in animate-scale-in will-change-opacity will-change-transform"
            if (typeof item.icon === 'object' && 'type' in item.icon && (item.icon as any).type === 'svg') {
              return (
                <span key={key} className="inline-flex items-center justify-center">
                  <SvgIcon svgContent={(item.icon as { type: 'svg', content: string }).content} className={commonClasses} />
                </span>
              )
            }
            const IconComp = item.icon as React.ComponentType<{ className?: string }>
            return (
              <span key={key} className="inline-flex items-center justify-center">
                <IconComp className={commonClasses} />
              </span>
            )
          })()}
        </button>
      )}

      {/* AI Chat Assistant (lazy) - hidden during checkout or cart open */}
      {!checkoutModalOpen && !cartOpen && (
        <LazyAIChat products={products} onAddToCart={addToCart} />
      )}

      {/* Checkout Modal */}
      <SupabaseCheckout
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        cart={cart}
        total={getCartTotal()}
        onCartReset={handleCartReset}
      />

      {/* Cart Item Editor Modal */}
      {editingCartItem && (() => {
        const item = cart.find(cartItem => cartItem.id === editingCartItem)
        if (!item) return null
        
        return (
          <CartItemEditor
            product={item}
            currentColor={item.selectedColor}
            currentFeatures={item.selectedFeatures}
            onSave={(color, features) => {
              updateCartItemSelections(editingCartItem, color, features)
              setEditingCartItem(null)
            }}
            onCancel={() => setEditingCartItem(null)}
            isOpen={true}
          />
        )
      })()}
        </div>
      </PageTransition>
      )}
    </>
  )
}
