# Supabase Migration Guide

This guide will help you migrate your current Supabase project to a new Supabase account while preserving all data and functionality.

## Current Configuration
- **Current Project URL**: `https://aizgswoelfdkhyosgvzu.supabase.co`
- **Current Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTUyMjUsImV4cCI6MjA3MDYzMTIyNX0.4a7Smvc_bueFLqZNvGk-AW0kD5dJusNwqaSAczJs0hU`
- **Current Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1NTIyNSwiZXhwIjoyMDcwNjMxMjI1fQ.gLnsyAhR8VSjbe37LdEHuFBGNDufqC4jZ9X3UOSNuGc`

## Migration Steps

### Step 1: Create New Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign in with your new account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `dopetech-nepal-new` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose the same region as your current project
6. Click "Create new project"

### Step 2: Export Data from Current Project
Run the data export script to backup all your current data:

```bash
node scripts/export-supabase-data.js
```

This will create:
- `supabase-data-export/products.json`
- `supabase-data-export/orders.json`
- `supabase-data-export/order_items.json`
- `supabase-data-export/hero_images.json`
- `supabase-data-export/qr_codes.json`

### Step 3: Set Up New Project Schema
1. Go to your new Supabase project dashboard
2. Navigate to SQL Editor
3. Run the complete schema setup:
   ```sql
   -- Copy and paste the contents of complete-supabase-setup.sql
   ```

### Step 4: Import Data to New Project
Run the data import script:

```bash
node scripts/import-supabase-data.js
```

### Step 5: Set Up Storage Buckets
1. Go to Storage in your new project
2. Create the following buckets:
   - `receipts` (for order receipts)
   - `hero-images` (for hero carousel images)
   - `product-images` (for product images)
   - `qr-codes` (for QR code images)

### Step 6: Upload Assets to New Storage
Run the asset migration script:

```bash
node scripts/migrate-storage-assets.js
```

### Step 7: Update Environment Variables
1. Get your new project credentials from the API settings
2. Update your `.env.local` file with new values
3. Update deployment environment variables (Vercel/Netlify)

### Step 8: Test the Migration
1. Run the test script to verify everything works:
   ```bash
   node scripts/test-new-supabase.js
   ```
2. Test your application locally
3. Deploy and test in production

## Files Created for Migration

- `scripts/export-supabase-data.js` - Exports all data from current project
- `scripts/import-supabase-data.js` - Imports data to new project
- `scripts/migrate-storage-assets.js` - Migrates storage assets
- `scripts/test-new-supabase.js` - Tests new Supabase connection
- `supabase-data-export/` - Directory containing exported data

## Important Notes

1. **Backup First**: Always backup your current data before migration
2. **Test Thoroughly**: Test all functionality after migration
3. **Update All References**: Make sure all environment variables are updated
4. **Monitor Logs**: Check for any errors during and after migration
5. **Keep Old Project**: Don't delete the old project until you're sure everything works

## Troubleshooting

### Common Issues
1. **CORS Errors**: Update CORS settings in new project
2. **RLS Policies**: Ensure Row Level Security policies are properly set
3. **Storage Permissions**: Check storage bucket permissions
4. **API Limits**: Verify API rate limits in new project

### Rollback Plan
If migration fails:
1. Keep old project running
2. Update environment variables back to old project
3. Investigate and fix issues
4. Retry migration

## Verification Checklist

- [ ] All tables created successfully
- [ ] All data imported correctly
- [ ] Storage buckets created and assets uploaded
- [ ] RLS policies configured
- [ ] Environment variables updated
- [ ] Application tests pass
- [ ] Production deployment successful
- [ ] All functionality working as expected
