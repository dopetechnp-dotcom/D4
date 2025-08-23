import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { compressImage } from '@/lib/image-optimizer'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const productId = formData.get('productId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' 
      }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 })
    }

    // Compress and optimize the image
    let optimizedFile = file
    try {
      optimizedFile = await compressImage(
        file,
        1200, // max width
        1200, // max height
        0.8   // quality
      )
      
      console.log(`✅ Image compressed: ${file.size} -> ${optimizedFile.size} bytes (${Math.round((1 - optimizedFile.size / file.size) * 100)}% reduction)`)
    } catch (compressionError) {
      console.warn('⚠️ Image compression failed, using original file:', compressionError)
      // Continue with original file if compression fails
    }

    // Generate unique filename with timestamp
    const fileExt = optimizedFile.name.split('.').pop()?.toLowerCase()
    const timestamp = Date.now()
    const fileName = `${productId || 'temp'}-${timestamp}.${fileExt}`

    // Convert file to buffer
    const bytes = await optimizedFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Supabase Storage with optimized settings
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: optimizedFile.type,
        cacheControl: '31536000', // 1 year cache
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Error uploading file:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(fileName)

    // Return optimized response with cache headers
    const response = NextResponse.json({ 
      success: true, 
      url: urlData.publicUrl,
      fileName: fileName,
      originalSize: file.size,
      optimizedSize: optimizedFile.size,
      compressionRatio: Math.round((1 - optimizedFile.size / file.size) * 100)
    })

    // Add cache headers
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    response.headers.set('X-Image-Optimized', 'true')
    response.headers.set('X-Compression-Ratio', Math.round((1 - optimizedFile.size / file.size) * 100).toString())

    return response

  } catch (error) {
    console.error('❌ Error in upload-product-image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
