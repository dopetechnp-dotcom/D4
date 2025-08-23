const { createClient } = require('@supabase/supabase-js')

// Test Supabase connection
async function testSupabaseConnection() {
  console.log('🔧 Testing Supabase connection...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aizgswoelfdkhyosgvzu.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTUyMjUsImV4cCI6MjA3MDYzMTIyNX0.4a7Smvc_bueFLqZNvGk-AW0kD5dJusNwqaSAczJs0hU'
  
  console.log('📡 Supabase URL:', supabaseUrl)
  console.log('🔑 Anon Key exists:', !!supabaseAnonKey)
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test basic connection
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      process.exit(1)
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('📊 Database accessible')
    
    // Test storage buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.warn('⚠️ Could not list storage buckets:', bucketsError.message)
    } else {
      console.log('📦 Storage buckets accessible:', buckets.map(b => b.name))
    }
    
    console.log('🎉 All tests passed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

testSupabaseConnection()
