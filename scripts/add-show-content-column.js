const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://aizgswoelfdkhyosgvzu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1NTIyNSwiZXhwIjoyMDcwNjMxMjI1fQ.gLnsyAhR8VSjbe37LdEHuFBGNDufqC4jZ9X3UOSNuGc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addShowContentColumn() {
  try {
    console.log('🔧 Adding show_content column to hero_images table...')

    // Try to add the show_content column
    const { error: addError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE hero_images 
        ADD COLUMN IF NOT EXISTS show_content BOOLEAN DEFAULT true;
      `
    })

    if (addError) {
      console.error('❌ Error adding show_content column:', addError)
    } else {
      console.log('✅ show_content column added successfully')
    }

    // Update existing records
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE hero_images 
        SET show_content = true 
        WHERE show_content IS NULL;
      `
    })

    if (updateError) {
      console.error('❌ Error updating existing records:', updateError)
    } else {
      console.log('✅ Existing records updated with show_content = true')
    }

    // Make the column not nullable
    const { error: notNullError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE hero_images 
        ALTER COLUMN show_content SET NOT NULL,
        ALTER COLUMN show_content SET DEFAULT true;
      `
    })

    if (notNullError) {
      console.error('❌ Error making column not nullable:', notNullError)
    } else {
      console.log('✅ show_content column is now not nullable with default true')
    }

    console.log('✅ Schema update completed!')

  } catch (error) {
    console.error('❌ Error in addShowContentColumn:', error)
  }
}

addShowContentColumn()
