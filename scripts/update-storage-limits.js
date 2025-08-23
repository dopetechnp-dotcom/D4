const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://aizgswoelfdkhyosgvzu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1NTIyNSwiZXhwIjoyMDcwNjMxMjI1fQ.gLnsyAhR8VSjbe37LdEHuFBGNDufqC4jZ9X3UOSNuGc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateStorageLimits() {
  try {
    console.log('🚀 Updating storage bucket file size limits...')

    // Get existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError)
      return
    }

    console.log('📋 Existing buckets:', existingBuckets?.map(b => b.name) || [])

    // Define updated bucket configurations with larger file size limits
    const updatedBuckets = [
      {
        name: 'assets',
        public: true,
        allowedMimeTypes: ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'video/mp4', 'video/webm'],
        fileSizeLimit: 20971520 // 20MB (increased from 10MB)
      },
      {
        name: 'hero-images',
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      },
      {
        name: 'product-images',
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      },
      {
        name: 'receipts',
        public: false,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'],
        fileSizeLimit: 10485760 // 10MB
      },
      {
        name: 'avatars',
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      }
    ]

    // Update existing buckets
    for (const bucketConfig of updatedBuckets) {
      const existingBucket = existingBuckets?.find(b => b.name === bucketConfig.name)
      
      if (existingBucket) {
        console.log(`📦 Updating ${bucketConfig.name} bucket...`)
        
        // Note: Supabase doesn't allow updating bucket configuration directly
        // We need to delete and recreate the bucket (this will lose existing files)
        // For production, we should backup files first
        
        console.log(`⚠️  Warning: Updating ${bucketConfig.name} bucket will require recreating it.`)
        console.log(`   This will delete existing files in the bucket.`)
        console.log(`   Consider backing up files first if needed.`)
        
        // For now, just log the intended changes
        console.log(`   Intended file size limit: ${bucketConfig.fileSizeLimit / 1024 / 1024}MB`)
        console.log(`   Allowed MIME types: ${bucketConfig.allowedMimeTypes.join(', ')}`)
      } else {
        console.log(`📦 Creating ${bucketConfig.name} bucket...`)
        
        const { error: createError } = await supabase.storage.createBucket(bucketConfig.name, {
          public: bucketConfig.public,
          allowedMimeTypes: bucketConfig.allowedMimeTypes,
          fileSizeLimit: bucketConfig.fileSizeLimit
        })
        
        if (createError) {
          console.error(`❌ Error creating ${bucketConfig.name} bucket:`, createError)
        } else {
          console.log(`✅ ${bucketConfig.name} bucket created successfully`)
        }
      }
    }

    console.log('\n🎉 Storage limits update complete!')
    console.log('📋 Note: For existing buckets, you may need to manually update the limits in the Supabase dashboard')
    console.log('   or recreate the buckets if file size limits are critical.')

  } catch (error) {
    console.error('❌ Error in updateStorageLimits:', error)
  }
}

// Run the update
updateStorageLimits()

