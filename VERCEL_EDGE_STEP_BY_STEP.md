# 🚀 Vercel Edge Deployment - Step by Step Guide

## Prerequisites
- GitHub account with your DopeTech repository
- Vercel account (free)

## Step 1: Push Your Code to GitHub

First, commit and push your current changes:

```bash
# In your project directory
git add .
git commit -m "🚀 Add Vercel Edge optimization"
git push origin main
```

## Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" 
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub

## Step 3: Import Your Project

1. In Vercel dashboard, click "New Project"
2. Find your `dopetech` repository
3. Click "Import"

## Step 4: Configure Project Settings

Vercel will auto-detect Next.js. Keep these default settings:
- **Framework Preset**: Next.js ✅
- **Root Directory**: `./` ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `.next` ✅
- **Install Command**: `npm install` ✅

## Step 5: Add Environment Variables

Click "Environment Variables" and add these:

### Required Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://aizgswoelfdkhyosgvzu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTUyMjUsImV4cCI6MjA3MDYzMTIyNX0.4a7Smvc_bueFLqZNvGk-AW0kD5dJusNwqaSAczJs0hU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1NTIyNSwiZXhwIjoyMDcwNjMxMjI1fQ.gLnsyAhR8VSjbe37LdEHuFBGNDufqC4jZ9X3UOSNuGc
```

### Email Variables (if you have them):
```
RESEND_API_KEY=your-resend-api-key
ADMIN_EMAIL=dopetechnp@gmail.com
```

## Step 6: Deploy!

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Your site will be live at: `https://your-project-name.vercel.app`

## Step 7: Verify Edge Functions

1. Go to your Vercel dashboard
2. Click on your project
3. Go to "Functions" tab
4. You should see your API routes listed as Edge Functions

## Step 8: Test Your Site

Visit your new Vercel URL and test:
- ✅ Homepage loads
- ✅ Product pages work
- ✅ Admin panel accessible
- ✅ File uploads work
- ✅ Orders can be placed

## Step 9: Set Custom Domain (Optional)

1. In Vercel dashboard, go to "Settings" → "Domains"
2. Add your custom domain (e.g., `dopetech.com`)
3. Update DNS records as instructed

## 🎉 You're Done!

Your DopeTech site is now running on Vercel Edge with:
- ⚡ Faster performance globally
- 💰 Zero egress costs
- 🌍 Global edge locations
- 🔄 Automatic deployments

## Troubleshooting

### If Build Fails:
1. Check the build logs in Vercel dashboard
2. Make sure all environment variables are set
3. Verify your code pushes to GitHub successfully

### If Functions Don't Work:
1. Check the "Functions" tab in Vercel dashboard
2. Look for error logs
3. Verify environment variables are correct

### Need Help?
- Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Vercel community: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

## Next Steps

1. **Monitor Performance**: Check Vercel dashboard for analytics
2. **Set Up Monitoring**: Enable error tracking
3. **Optimize Further**: Add caching headers to API routes
4. **Scale Up**: Upgrade to Pro plan if you exceed free limits

Your site is now future-proof and cost-effective! 🚀
