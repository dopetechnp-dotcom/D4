# Vercel Deployment Guide for DopeTech Nepal

## 🚀 Quick Start

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   Add these environment variables in your Vercel project settings:

### Required Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://aizgswoelfdkhyosgvzu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTUyMjUsImV4cCI6MjA3MDYzMTIyNX0.4a7Smvc_bueFLqZNvGk-AW0kD5dJusNwqaSAczJs0hU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1NTIyNSwiZXhwIjoyMDcwNjMxMjI1fQ.gLnsyAhR8VSjbe37LdEHuFBGNDufqC4jZ9X3UOSNuGc

# Email Configuration
RESEND_API_KEY=your-resend-api-key
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
ADMIN_EMAIL=admin@yourdomain.com
```

### Optional Environment Variables

```bash
# Analytics and Monitoring
NEXT_PUBLIC_GA_ID=your-google-analytics-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Payment Processing
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Image Optimization
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

## 📋 Pre-Deployment Checklist

### ✅ Code Changes Made
- [x] Created API routes in `app/api/` directory
- [x] Updated `next.config.mjs` for Vercel compatibility
- [x] Configured `vercel.json` with proper settings
- [x] Removed static export configuration
- [x] Added proper CORS headers

### ✅ API Routes Created
- [x] `/api/orders` - Order management
- [x] `/api/supabase-checkout` - Checkout processing
- [x] `/api/send-order-emails` - Email notifications
- [x] `/api/hero-images/upload` - Hero image upload
- [x] `/api/hero-images/delete` - Hero image deletion
- [x] `/api/hero-images/update` - Hero image updates

### ✅ Database Setup
- [x] Supabase project configured
- [x] Database tables created
- [x] Storage buckets configured
- [x] RLS policies set up

## 🔧 Configuration Files

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

### next.config.mjs
- Removed static export configuration
- Enabled image optimization
- Configured for Vercel deployment
- Added proper webpack optimizations

## 🚀 Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Vercel will automatically detect Next.js
   - Build command: `npm run build`
   - Output directory: `.next`
   - Install command: `npm install`

3. **Verify Deployment**
   - Check build logs for any errors
   - Test all API routes
   - Verify environment variables are loaded
   - Test admin functionality

## 🔍 Post-Deployment Testing

### API Routes Testing
```bash
# Test orders API
curl -X GET https://your-domain.vercel.app/api/orders?orderId=test

# Test hero images upload
curl -X POST https://your-domain.vercel.app/api/hero-images/upload

# Test checkout
curl -X POST https://your-domain.vercel.app/api/supabase-checkout
```

### Functionality Testing
- [ ] Homepage loads correctly
- [ ] Product pages work
- [ ] Admin panel accessible
- [ ] Hero image management works
- [ ] Order processing functions
- [ ] Email notifications sent
- [ ] File uploads work

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (18.x required)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **API Route Errors**
   - Verify environment variables are set
   - Check Supabase connection
   - Review function timeout settings

3. **Image Upload Issues**
   - Verify Supabase storage bucket exists
   - Check RLS policies
   - Verify file size limits

4. **Email Service Issues**
   - Check Resend API key
   - Verify Gmail credentials
   - Check admin email configuration

### Debug Commands
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL

# Test Supabase connection
npm run test:supabase

# Check build locally
npm run build
```

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review environment variable configuration
3. Test API routes individually
4. Verify database connectivity

## 🔄 Continuous Deployment

Once deployed, Vercel will automatically:
- Deploy on every push to main branch
- Run build checks
- Provide preview deployments for PRs
- Handle environment variable updates

## 📊 Monitoring

- Use Vercel Analytics for performance monitoring
- Check Function logs for API route debugging
- Monitor Supabase dashboard for database issues
- Set up error tracking with Sentry (optional)
