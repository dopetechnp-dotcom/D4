# Supabase Migration Checklist

## Pre-Migration Steps
- [ ] Create new Supabase project at [supabase.com](https://supabase.com)
- [ ] Note down new project URL and API keys
- [ ] Backup current data (optional but recommended)

## Migration Process

### Option 1: Automated Migration (Recommended)
```bash
# Run the complete migration script
node scripts/migrate-supabase-complete.js
```

### Option 2: Step-by-Step Migration
```bash
# 1. Export data from current project
node scripts/export-supabase-data.js

# 2. Set up new project schema
# - Go to new Supabase project dashboard
# - Run complete-supabase-setup.sql in SQL Editor

# 3. Import data to new project
# Set environment variables first:
export NEW_SUPABASE_URL="your-new-project-url"
export NEW_SUPABASE_SERVICE_KEY="your-new-service-key"
node scripts/import-supabase-data.js

# 4. Migrate storage assets
node scripts/migrate-storage-assets.js

# 5. Test the migration
node scripts/test-new-supabase.js
```

## Manual Setup Required

### Storage Buckets
Create these buckets in your new Supabase project:
- [ ] `receipts` (Private)
- [ ] `hero-images` (Public)
- [ ] `product-images` (Public)
- [ ] `qr-codes` (Public)

### Storage Policies
For each bucket, set up appropriate policies:
- [ ] Public read access for public buckets
- [ ] Authenticated upload access
- [ ] Download access for receipts

## Environment Variables Update
Update your `.env.local` file with new credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-new-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-new-service-key
```

## Testing Checklist
- [ ] Database connection works
- [ ] Products load correctly
- [ ] Orders can be created
- [ ] File uploads work
- [ ] File downloads work
- [ ] Admin panel functions
- [ ] Email notifications work

## Deployment Update
- [ ] Update Vercel environment variables
- [ ] Update Netlify environment variables (if applicable)
- [ ] Test production deployment
- [ ] Verify all functionality works in production

## Post-Migration
- [ ] Keep old project for 1-2 weeks as backup
- [ ] Monitor for any issues
- [ ] Delete old project once confirmed stable

## Troubleshooting
- **CORS errors**: Check CORS settings in new project
- **RLS errors**: Verify Row Level Security policies
- **Storage errors**: Check bucket permissions and policies
- **API errors**: Verify API keys and rate limits

## Support Files Created
- `SUPABASE_MIGRATION_GUIDE.md` - Detailed migration guide
- `scripts/export-supabase-data.js` - Data export script
- `scripts/import-supabase-data.js` - Data import script
- `scripts/migrate-storage-assets.js` - Storage migration script
- `scripts/test-new-supabase.js` - Migration testing script
- `scripts/migrate-supabase-complete.js` - Complete migration script
- `scripts/setup-new-supabase.js` - New project setup script
- `supabase-data-export/` - Exported data directory
- `NEW_SUPABASE_SETUP_INSTRUCTIONS.md` - Setup instructions

## Quick Commands Reference
```bash
# Complete migration
node scripts/migrate-supabase-complete.js

# Test new setup
node scripts/test-new-supabase.js

# Setup new project
node scripts/setup-new-supabase.js

# Export only
node scripts/export-supabase-data.js

# Import only
node scripts/import-supabase-data.js

# Storage migration only
node scripts/migrate-storage-assets.js
```
