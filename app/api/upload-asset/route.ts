import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { compressImage } from '@/lib/image-optimizer'

// Enable Edge Runtime for better performance
export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    // Configure request to handle larger files
    const formData = await request.formData()
    const file = formData.get('file') as File
    const assetName = formData.get('assetName') as string
    const assetType = formData.get('assetType') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log(`📁 Processing file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, WebP, SVG, MP4, and WebM files are allowed.' 
      }, { status: 400 })
    }

    // Validate file size (increased limits: 10MB for images, 20MB for videos)
    const maxSize = file.type.startsWith('video/') ? 20 * 1024 * 1024 : 10 * 1024 * 1024
    const originalFileSize = file.size
    
    // For images, we'll try compression first before rejecting
    if (file.size > maxSize && !file.type.startsWith('image/')) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0)
      return NextResponse.json({ 
        error: `File too large (${fileSizeMB}MB). Maximum size is ${maxSizeMB}MB for ${file.type.startsWith('video/') ? 'videos' : 'images'}. Please compress the file or use a smaller one.` 
      }, { status: 413 })
    }

    // Compress and optimize the image if it's an image file
    let optimizedFile = file
    if (file.type.startsWith('image/') && !file.type.includes('svg')) {
      try {
        // More aggressive compression for larger files
        const quality = file.size > 5 * 1024 * 1024 ? 0.6 : 0.8 // Lower quality for files > 5MB
        const maxDimension = file.size > 5 * 1024 * 1024 ? 800 : 1200 // Smaller dimensions for larger files
        
        optimizedFile = await compressImage(
          file,
          maxDimension, // max width
          maxDimension, // max height
          quality   // quality
        )
        
        console.log(`✅ Asset compressed: ${file.size} -> ${optimizedFile.size} bytes (${Math.round((1 - optimizedFile.size / file.size) * 100)}% reduction)`)
        
        // Check if compression made the file small enough
        if (optimizedFile.size > maxSize) {
          const fileSizeMB = (optimizedFile.size / 1024 / 1024).toFixed(2)
          const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0)
          return NextResponse.json({ 
            error: `File still too large after compression (${fileSizeMB}MB). Maximum size is ${maxSizeMB}MB. Please use a smaller file.` 
          }, { status: 413 })
        }
      } catch (compressionError) {
        console.warn('⚠️ Asset compression failed, using original file:', compressionError)
        // Continue with original file if compression fails
        
        // If compression failed and original file is too large, reject it
        if (file.size > maxSize) {
          const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
          const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0)
          return NextResponse.json({ 
            error: `File too large (${fileSizeMB}MB) and compression failed. Maximum size is ${maxSizeMB}MB. Please use a smaller file.` 
          }, { status: 413 })
        }
      }
    }

    // Generate unique filename with timestamp
    const fileExt = optimizedFile.name.split('.').pop()?.toLowerCase()
    const timestamp = Date.now()
    const fileName = `${assetType}/${assetName}_${timestamp}.${fileExt}`

    // Convert file to buffer
    const bytes = await optimizedFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Supabase Storage with optimized settings
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('assets')
      .upload(fileName, buffer, {
        contentType: optimizedFile.type,
        cacheControl: '31536000', // 1 year cache
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Error uploading asset:', uploadError)
      
      // Handle specific storage errors
      if (uploadError.message?.includes('maximum allowed size')) {
        return NextResponse.json({ 
          error: 'File is too large. Please compress the image or use a smaller file.' 
        }, { status: 413 })
      }
      
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('assets')
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
    response.headers.set('X-Asset-Optimized', 'true')
    response.headers.set('X-Compression-Ratio', Math.round((1 - optimizedFile.size / file.size) * 100).toString())

    return response

  } catch (error) {
    console.error('❌ Error in upload-asset:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
