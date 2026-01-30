import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { cookies } from 'next/headers'
import config from '@/payload.config'
import type { CanvasElement } from '@/components/canvas/types/canvas-element'

interface SaveTemplateRequest {
  name: string
  usageType: 'participant' | 'partner' | 'both'
  team: string
  width: number
  height: number
  backgroundImage?: string // URL from existing media or base64
  backgroundColor?: string
  elements: CanvasElement[]
  previewImageBase64?: string
}

/**
 * POST /api/save-image-template
 * Saves current canvas state as an image template
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Get user from Payload session cookie
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')

    let user = null
    if (token) {
      try {
        const { user: authenticatedUser } = await payload.auth({
          headers: req.headers,
        })
        user = authenticatedUser
      } catch (error) {
        console.error('Auth error:', error)
      }
    }

    // For now, allow unauthenticated access for testing
    // TODO: Add proper authentication check once user context is available
    // if (!user) {
    //   return NextResponse.json(
    //     { error: 'Authentication required. Please log in to save templates.' },
    //     { status: 401 }
    //   )
    // }

    // Parse body with error handling for large payloads
    let body: SaveTemplateRequest
    try {
      body = (await req.json()) as SaveTemplateRequest
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid request body. Payload may be too large or malformed.' },
        { status: 400 },
      )
    }
    const {
      name,
      usageType,
      team,
      width,
      height,
      backgroundImage,
      backgroundColor,
      elements,
      previewImageBase64,
    } = body

    // Validate required fields
    if (!name || !usageType || !width || !height || !elements) {
      return NextResponse.json(
        { error: 'Missing required fields: name, usageType, width, height, elements' },
        { status: 400 },
      )
    }

    // Get organization from user if available
    let finalOrganization: string | undefined = undefined
    if (user) {
      // Try to get user's first organization
      try {
        const organizations = (user as any).teams
        if (organizations && Array.isArray(organizations) && organizations.length > 0) {
          // Get first organization (could be string ID or populated object)
          const firstOrganization = organizations[0]
          finalOrganization = typeof firstOrganization === 'string' ? firstOrganization : firstOrganization?.id
        }
      } catch (error) {
        console.error('Error getting user organization:', error)
      }
    }

    // If organization provided in request and it's valid, use it
    if (team && team !== '' && team !== 'default') {
      finalOrganization = team
    }

    // Upload preview image if provided
    let previewImageId: number | string | undefined
    if (previewImageBase64) {
      try {
        // Detect mime type from data URL
        const mimeMatch = previewImageBase64.match(/^data:(image\/\w+);base64,/)
        const mimetype = mimeMatch ? mimeMatch[1] : 'image/jpeg'
        const extension = mimetype.split('/')[1] || 'jpg'

        // Remove data URL prefix if present
        const base64Data = previewImageBase64.replace(/^data:image\/\w+;base64,/, '')

        // Validate base64 size (limit to ~5MB decoded)
        const bufferSize = (base64Data.length * 3) / 4 // Approximate decoded size
        if (bufferSize > 5 * 1024 * 1024) {
          console.warn('Preview image too large, skipping upload. Size:', bufferSize)
        } else {
          // Convert base64 to buffer
          const buffer = Buffer.from(base64Data, 'base64')

          console.log('Uploading preview image:', {
            mimetype,
            size: buffer.length,
            name: `${name.toLowerCase().replace(/\s+/g, '-')}-preview-${Date.now()}.${extension}`,
          })

          // Create media document with the image
          const previewMedia = await payload.create({
            collection: 'media',
            data: {
              alt: `${name} - Preview`,
            },
            file: {
              data: buffer,
              mimetype,
              name: `${name.toLowerCase().replace(/\s+/g, '-')}-preview-${Date.now()}.${extension}`,
              size: buffer.length,
            },
          })

          // Store as number - Payload relationship fields expect numbers
          previewImageId = previewMedia.id
          console.log('Preview image uploaded successfully:', previewImageId)
        }
      } catch (error) {
        console.error('Failed to upload preview image:', error)
        // Continue without preview image - don't set previewImageId
        previewImageId = undefined
      }
    }

    // Handle background image
    let backgroundImageId: number | string | undefined
    let finalBackgroundColor: string | undefined = backgroundColor

    if (backgroundImage) {
      // Check if it's a hex color code
      if (backgroundImage.startsWith('#')) {
        // It's a color code, store in backgroundColor field
        finalBackgroundColor = backgroundImage
        // Don't set backgroundImageId - leave it undefined
      } else if (backgroundImage.startsWith('http') || backgroundImage.startsWith('data:')) {
        // It's a URL or base64, try to upload it
        try {
          if (backgroundImage.startsWith('data:')) {
            // Detect mime type from data URL
            const mimeMatch = backgroundImage.match(/^data:(image\/\w+);base64,/)
            const mimetype = mimeMatch ? mimeMatch[1] : 'image/png'
            const extension = mimetype.split('/')[1] || 'png'

            const base64Data = backgroundImage.replace(/^data:image\/\w+;base64,/, '')

            // Validate base64 size (limit to ~5MB decoded)
            const bufferSize = (base64Data.length * 3) / 4
            if (bufferSize > 5 * 1024 * 1024) {
              console.warn('Background image too large, skipping upload. Size:', bufferSize)
            } else {
              const buffer = Buffer.from(base64Data, 'base64')

              const bgMedia = await payload.create({
                collection: 'media',
                data: {
                  alt: `${name} - Background`,
                },
                file: {
                  data: buffer,
                  mimetype,
                  name: `${name.toLowerCase().replace(/\s+/g, '-')}-bg-${Date.now()}.${extension}`,
                  size: buffer.length,
                },
              })

              // Store as number - Payload relationship fields expect numbers
              backgroundImageId = bgMedia.id
            }
          } else {
            // External URL - store as is for now
            // In a production app, you might want to download and upload to R2
          }
        } catch (error) {
          console.error('Failed to upload background image:', error)
          // Don't set backgroundImageId if upload failed
          backgroundImageId = undefined
        }
      } else {
        // Assume it's already a media ID
        backgroundImageId = backgroundImage
      }
    }

    // Clean elements array - remove HTMLImageElement instances and keep only serializable data
    const cleanedElements = elements.map((el) => {
      const { image, ...rest } = el as any
      return rest
    })

    // Create image template document
    const templateData: any = {
      name,
      usageType,
      width,
      height,
      backgroundColor: finalBackgroundColor,
      elements: cleanedElements,
      isActive: true,
    }

    // Only add optional fields if they exist
    if (finalOrganization) {
      templateData.team = finalOrganization
    }
    if (backgroundImageId) {
      templateData.backgroundImage = backgroundImageId
    }
    if (previewImageId) {
      templateData.previewImage = previewImageId
    }

    console.log('Creating template with data:', {
      ...templateData,
      elements: `${templateData.elements.length} elements`,
    })

    const template = await payload.create({
      collection: 'image-templates',
      data: templateData,
    })

    console.log('Template created successfully:', template.id)

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
      },
      message: 'Template saved successfully',
    })
  } catch (error) {
    console.error('Error saving template:', error)

    // Check for unique constraint violation (duplicate template name/slug)
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('UNIQUE constraint failed') && errorMessage.includes('slug')) {
      return NextResponse.json(
        {
          error: 'A template with this name already exists. Please choose a different name.',
        },
        { status: 409 }, // 409 Conflict
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to save template',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
