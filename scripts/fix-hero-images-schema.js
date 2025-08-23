const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Please make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixHeroImagesSchema() {
  try {
    console.log('🔧 Fixing hero_images table schema...')
    
    // Add the show_content column if it doesn't exist
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE hero_images 
        ADD COLUMN IF NOT EXISTS show_content BOOLEAN DEFAULT true;
      `
    })

    if (alterError) {
      console.error('❌ Error adding show_content column:', alterError)
      return false
    }

    // Update existing records to have show_content = true
    const { error: updateError } = await supabase
      .from('hero_images')
      .update({ show_content: true })
      .is('show_content', null)

    if (updateError) {
      console.error('❌ Error updating existing records:', updateError)
      return false
    }

    // Make sure the column is not nullable and has a default value
    const { error: notNullError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE hero_images 
        ALTER COLUMN show_content SET NOT NULL,
        ALTER COLUMN show_content SET DEFAULT true;
      `
    })

    if (notNullError) {
      console.error('❌ Error setting column constraints:', notNullError)
      return false
    }

    console.log('✅ Hero images schema fixed successfully!')
    
    // Verify the fix by checking the table structure
    const { data: columns, error: describeError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'hero_images' 
        AND column_name = 'show_content';
      `
    })

    if (describeError) {
      console.error('❌ Error checking table structure:', describeError)
    } else {
      console.log('📋 show_content column details:', columns)
    }

    return true
  } catch (error) {
    console.error('❌ Error fixing hero images schema:', error)
    return false
  }
}

// Run the fix
fixHeroImagesSchema()
  .then(success => {
    if (success) {
      console.log('🎉 Hero images schema fix completed successfully!')
    } else {
      console.log('💥 Hero images schema fix failed!')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error)
    process.exit(1)
  })
