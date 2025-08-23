const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://aizgswoelfdkhyosgvzu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1NTIyNSwiZXhwIjoyMDcwNjMxMjI1fQ.gLnsyAhR8VSjbe37LdEHuFBGNDufqC4jZ9X3UOSNuGc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testFileUploadLimits() {
  try {
    console.log('🔍 Testing file upload limits...')

    // Get existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError)
      return
    }

    console.log('📋 Current bucket configurations:')
    
    for (const bucket of existingBuckets || []) {
      console.log(`\n📦 Bucket: ${bucket.name}`)
      console.log(`   Public: ${bucket.public}`)
      console.log(`   File Size Limit: ${bucket.fileSizeLimit ? (bucket.fileSizeLimit / 1024 / 1024).toFixed(1) + 'MB' : 'Not set'}`)
      console.log(`   Allowed MIME Types: ${bucket.allowedMimeTypes ? bucket.allowedMimeTypes.join(', ') : 'Not set'}`)
      
      // Check if this is the assets bucket
      if (bucket.name === 'assets') {
        if (!bucket.fileSizeLimit || bucket.fileSizeLimit < 20 * 1024 * 1024) {
          console.log(`   ⚠️  WARNING: Assets bucket needs to be updated to 20MB limit`)
          console.log(`   💡 Go to Supabase Dashboard > Storage > Buckets > assets > Edit`)
          console.log(`   💡 Set file size limit to 20971520 bytes (20MB)`)
        } else {
          console.log(`   ✅ Assets bucket has correct 20MB limit`)
        }
      }
    }

    console.log('\n🎯 Current Limits Summary:')
    console.log('   - Next.js API Body Limit: 10MB (configured in next.config.mjs)')
    console.log('   - Server-side Validation: 10MB images, 20MB videos')
    console.log('   - Client-side Validation: 10MB images, 20MB videos')
    console.log('   - Supabase Storage: Check bucket configuration above')

    console.log('\n📝 Recommendations:')
    console.log('   1. Restart your development server: npm run dev')
    console.log('   2. Update Supabase assets bucket to 20MB limit')
    console.log('   3. Try uploading a file under 10MB first')

  } catch (error) {
    console.error('❌ Error in testFileUploadLimits:', error)
  }
}

// Run the test
testFileUploadLimits()

