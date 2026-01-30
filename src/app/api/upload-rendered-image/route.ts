import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

interface UploadImageRequest {
  imageData: string // base64 or blob URL
  filename?: string
  contentType?: string
}

/**
 * POST /api/upload-rendered-image
 * Upload a client-rendered image to R2 storage
 * Compatible with Cloudflare Workers - no server-side image processing
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as UploadImageRequest
    const { imageData, filename, contentType = 'image/png' } = body

    if (!imageData) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 })
    }

    // Get Cloudflare context to access R2
    const cloudflare = await getCloudflareContext({ async: true })
    if (!cloudflare?.env?.R2) {
      return NextResponse.json(
        { error: 'R2 storage not configured. Please check Cloudflare bindings.' },
        { status: 500 },
      )
    }

    // Convert base64 to buffer
    let buffer: ArrayBuffer
    try {
      // Remove data URL prefix if present (e.g., "data:image/png;base64,")
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')

      // Decode base64 to binary
      const binaryString = atob(base64Data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      buffer = bytes.buffer
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Invalid image data format',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 400 },
      )
    }

    // Generate unique filename if not provided
    const finalFilename = filename || `rendered-image-${Date.now()}.png`
    const key = `generated/${finalFilename}`

    // Upload to R2
    try {
      await cloudflare.env.R2.put(key, buffer, {
        httpMetadata: {
          contentType: contentType,
        },
      })

      // Generate public URL
      // Note: You may need to configure your R2 bucket with a custom domain or public access
      // For now, we'll return the key which can be used with Payload Media collection
      const publicUrl = `/api/r2/${key}`

      return NextResponse.json({
        success: true,
        url: publicUrl,
        key: key,
        filename: finalFilename,
        message: 'Image uploaded successfully to R2',
      })
    } catch (uploadError) {
      return NextResponse.json(
        {
          error: 'Failed to upload to R2',
          details: uploadError instanceof Error ? uploadError.message : 'Unknown upload error',
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

/**
 * Alternative approach: Create a Media document in Payload CMS
 * This would integrate better with the existing Media collection
 */
export async function createMediaDocument(params: {
  filename: string
  buffer: ArrayBuffer
  contentType: string
}) {
  // This would require importing Payload and creating a document
  // Left as a TODO for better integration with Payload Media collection
  // For now, direct R2 upload is sufficient
}
