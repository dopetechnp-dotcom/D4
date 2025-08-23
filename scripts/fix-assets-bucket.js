const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://aizgswoelfdkhyosgvzu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1NTIyNSwiZXhwIjoyMDcwNjMxMjI1fQ.gLnsyAhR8VSjbe37LdEHuFBGNDufqC4jZ9X3UOSNuGc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixAssetsBucket() {
  try {
    console.log('🔧 Fixing assets bucket configuration...')

    // First, let's check what files are currently in the assets bucket
    const { data: existingFiles, error: listError } = await supabase.storage
      .from('assets')
      .list('', { limit: 100 })
    
    if (listError) {
      console.error('❌ Error listing assets:', listError)
      return
    }

    console.log(`📁 Found ${existingFiles?.length || 0} files in assets bucket`)
    
    if (existingFiles && existingFiles.length > 0) {
      console.log('📋 Existing files:')
      existingFiles.forEach(file => {
        console.log(`   - ${file.name} (${(file.metadata?.size / 1024 / 1024).toFixed(2)}MB)`)
      })
    }

    // Since we can't update bucket configuration directly, we need to recreate it
    // But first, let's backup the files
    console.log('\n⚠️  IMPORTANT: To fix the file size limit, we need to recreate the assets bucket.')
    console.log('   This will temporarily remove access to existing files.')
    console.log('   The files will still exist in Supabase but may need to be re-uploaded.')
    
    console.log('\n💡 RECOMMENDED APPROACH:')
    console.log('   1. Go to Supabase Dashboard > Storage > Buckets')
    console.log('   2. Find the "assets" bucket')
    console.log('   3. Click "Edit" or "Settings"')
    console.log('   4. Set File Size Limit to: 20971520 (20MB)')
    console.log('   5. Set Allowed MIME Types to: image/svg+xml,image/png,image/jpeg,image/jpg,image/webp,video/mp4,video/webm')
    console.log('   6. Save the changes')
    
    console.log('\n🚀 After updating the bucket in Supabase dashboard:')
    console.log('   1. Restart your development server: npm run dev')
    console.log('   2. Try uploading your logo file again')
    
    console.log('\n📊 Current Configuration Status:')
    console.log('   ✅ Next.js API limits: 10MB (configured)')
    console.log('   ✅ Server-side validation: 10MB images, 20MB videos (configured)')
    console.log('   ✅ Client-side validation: 10MB images, 20MB videos (configured)')
    console.log('   ❌ Supabase storage bucket: Needs manual update to 20MB')

  } catch (error) {
    console.error('❌ Error in fixAssetsBucket:', error)
  }
}

// Run the fix
fixAssetsBucket()

