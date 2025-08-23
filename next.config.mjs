import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for Netlify deployment with static export
  // output: 'export', // Commented out for development
  // trailingSlash: true, // Commented out for development
  // distDir: 'out', // Commented out for development
  
  // Enhanced Image Optimization
  images: {
    unoptimized: false, // Enable image optimization
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache
    loader: 'default',
    path: '',
    // Add image optimization settings
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Enable responsive images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flrcwmmdveylmcbjuwfc.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  // Enhanced experimental features for optimization
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    optimizeCss: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Enhanced build configuration
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  
  // Enhanced compiler settings
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Enhanced performance settings
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Performance optimizations
  reactStrictMode: true,
  
  // Enhanced asset optimization
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Enhanced headers for caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=600',
          },
        ],
      },
      {
        source: '/:path*.(jpg|jpeg|png|gif|webp|avif|svg)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Bundle analyzer
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
        })
      )
      return config
    },
  }),
  
  // Enhanced webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Exclude nested directories that contain API routes
    config.watchOptions = {
      ignored: ['**/dopetechdbinit/**', '**/backup/**']
    }
    
    // Ensure proper path resolution for @ alias
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './'),
    }
    
    // Enhanced bundle optimization
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
          },
          // Separate React chunks
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
        },
      };
      
      // Enhanced tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Enable module concatenation
      config.optimization.concatenateModules = true;
    }
    
    // SVG optimization
    const svgRule = config.module.rules.find(rule => rule.test && rule.test.toString().includes('svg'));
    if (!svgRule) {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      });
    }
    
    // Compression plugin can be added later if needed
    // if (!dev && !isServer) {
    //   const { default: CompressionPlugin } = await import('compression-webpack-plugin');
    //   config.plugins.push(
    //     new CompressionPlugin({
    //       algorithm: 'gzip',
    //       test: /\.(js|css|html|svg)$/,
    //       threshold: 10240,
    //       minRatio: 0.8,
    //     })
    //   );
    // }
    
    return config;
  },
}

export default nextConfig
