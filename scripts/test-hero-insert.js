const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://aizgswoelfdkhyosgvzu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1NTIyNSwiZXhwIjoyMDcwNjMxMjI1fQ.gLnsyAhR8VSjbe37LdEHuFBGNDufqC4jZ9X3UOSNuGc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testHeroInsert() {
  try {
    console.log('🧪 Testing hero_images table insert with different column names...')

    // Test 1: Try with image_file_name and image_url
    console.log('\n📝 Test 1: Using image_file_name and image_url')
    const { data: data1, error: error1 } = await supabase
      .from('hero_images')
      .insert([{
        image_file_name: 'test-image.jpg',
        image_url: 'https://example.com/test.jpg',
        title: 'Test Image',
        subtitle: 'Test Subtitle',
        description: 'Test Description',
        display_order: 0,
        is_active: true
      }])
      .select()

    if (error1) {
      console.log('❌ Error with image_file_name/image_url:', error1.message)
    } else {
      console.log('✅ Success with image_file_name/image_url')
      // Clean up
      await supabase.from('hero_images').delete().eq('id', data1[0].id)
    }

    // Test 2: Try with file_name and file_url
    console.log('\n📝 Test 2: Using file_name and file_url')
    const { data: data2, error: error2 } = await supabase
      .from('hero_images')
      .insert([{
        file_name: 'test-image.jpg',
        file_url: 'https://example.com/test.jpg',
        title: 'Test Image',
        subtitle: 'Test Subtitle',
        description: 'Test Description',
        display_order: 0,
        is_active: true
      }])
      .select()

    if (error2) {
      console.log('❌ Error with file_name/file_url:', error2.message)
    } else {
      console.log('✅ Success with file_name/file_url')
      // Clean up
      await supabase.from('hero_images').delete().eq('id', data2[0].id)
    }

    // Test 3: Try with just basic columns
    console.log('\n📝 Test 3: Using only basic columns')
    const { data: data3, error: error3 } = await supabase
      .from('hero_images')
      .insert([{
        title: 'Test Image',
        subtitle: 'Test Subtitle',
        description: 'Test Description',
        display_order: 0,
        is_active: true
      }])
      .select()

    if (error3) {
      console.log('❌ Error with basic columns:', error3.message)
    } else {
      console.log('✅ Success with basic columns')
      // Clean up
      await supabase.from('hero_images').delete().eq('id', data3[0].id)
    }

    console.log('\n✅ Testing completed!')

  } catch (error) {
    console.error('❌ Error in testHeroInsert:', error)
  }
}

testHeroInsert()
