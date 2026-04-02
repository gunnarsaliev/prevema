import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { cookies } from 'next/headers'
import config from '@/payload.config'
import type { CanvasElement } from '@/components/canvas/types/canvas-element'

interface UpdateTemplateRequest {
  name?: string
  isPublic?: boolean
  isPremium?: boolean
  width?: number
  height?: number
  backgroundImage?: string
  backgroundColor?: string
  elements?: CanvasElement[]
  previewImageBase64?: string
  isActive?: boolean
}

/**
 * PATCH /api/image-templates/[id]
 * Updates an existing image template
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Verify template exists and user has access
    const existingTemplate = await payload
      .findByID({
        collection: 'image-templates',
        id: Number(id),
        overrideAccess: false,
        user: user || undefined,
        depth: 0,
      })
      .catch(() => null)

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found or access denied' },
        { status: 404 }
      )
    }

    // Parse body
    let body: UpdateTemplateRequest
    try {
      body = (await req.json()) as UpdateTemplateRequest
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const {
      name,
      isPublic,
      isPremium,
      width,
      height,
      backgroundImage,
      backgroundColor,
      elements,
      previewImageBase64,
      isActive,
    } = body

    // Upload preview image if provided
    let previewImageId: number | string | undefined
    if (previewImageBase64) {
      try {
        const mimeMatch = previewImageBase64.match(/^data:(image\/\w+);base64,/)
        const mimetype = mimeMatch ? mimeMatch[1] : 'image/jpeg'
        const extension = mimetype.split('/')[1] || 'jpg'
        const base64Data = previewImageBase64.replace(/^data:image\/\w+;base64,/, '')

        const bufferSize = (base64Data.length * 3) / 4
        if (bufferSize <= 5 * 1024 * 1024) {
          const buffer = Buffer.from(base64Data, 'base64')

          const previewMedia = await payload.create({
            collection: 'media',
            data: {
              alt: `${name || existingTemplate.name} - Preview`,
            },
            file: {
              data: buffer,
              mimetype,
              name: `${(name || existingTemplate.name).toLowerCase().replace(/\s+/g, '-')}-preview-${Date.now()}.${extension}`,
              size: buffer.length,
            },
            user: user || undefined,
            overrideAccess: !user,
          })

          previewImageId = previewMedia.id
        }
      } catch (error) {
        console.error('Failed to upload preview image:', error)
      }
    }

    // Handle background image
    let backgroundImageId: number | string | undefined
    let finalBackgroundColor: string | undefined = backgroundColor

    console.log('Received backgroundImage:', typeof backgroundImage, backgroundImage)

    if (backgroundImage !== undefined) {
      // If it's already a number, use it as the ID
      if (typeof backgroundImage === 'number') {
        backgroundImageId = backgroundImage
      } else if (typeof backgroundImage === 'string' && backgroundImage.startsWith('#')) {
        finalBackgroundColor = backgroundImage
      } else if (typeof backgroundImage === 'string' && backgroundImage.startsWith('data:')) {
        try {
          const mimeMatch = backgroundImage.match(/^data:(image\/\w+);base64,/)
          const mimetype = mimeMatch ? mimeMatch[1] : 'image/png'
          const extension = mimetype.split('/')[1] || 'png'
          const base64Data = backgroundImage.replace(/^data:image\/\w+;base64,/, '')

          const bufferSize = (base64Data.length * 3) / 4
          if (bufferSize <= 5 * 1024 * 1024) {
            const buffer = Buffer.from(base64Data, 'base64')

            const bgMedia = await payload.create({
              collection: 'media',
              data: {
                alt: `${name || existingTemplate.name} - Background`,
              },
              file: {
                data: buffer,
                mimetype,
                name: `${(name || existingTemplate.name).toLowerCase().replace(/\s+/g, '-')}-bg-${Date.now()}.${extension}`,
                size: buffer.length,
              },
              user: user || undefined,
              overrideAccess: !user,
            })

            backgroundImageId = bgMedia.id
          }
        } catch (error) {
          console.error('Failed to upload background image:', error)
        }
      } else if (typeof backgroundImage === 'string' && backgroundImage) {
        // It's a string but not a color or base64 - could be an ID or URL
        // Try to parse as number, otherwise use as-is
        const parsedId = parseInt(backgroundImage, 10)
        backgroundImageId = isNaN(parsedId) ? backgroundImage : parsedId
      }
    }

    // Clean elements array - remove HTMLImageElement instances
    const cleanedElements = elements
      ? elements.map((el) => {
          const { image, ...rest } = el as any
          return rest
        })
      : undefined

    // Build update data
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (isPublic !== undefined) updateData.isPublic = isPublic
    if (isPremium !== undefined) updateData.isPremium = isPremium
    if (width !== undefined) updateData.width = width
    if (height !== undefined) updateData.height = height
    if (finalBackgroundColor !== undefined) updateData.backgroundColor = finalBackgroundColor
    if (cleanedElements !== undefined) updateData.elements = cleanedElements
    if (isActive !== undefined) updateData.isActive = isActive
    if (backgroundImageId !== undefined) updateData.backgroundImage = backgroundImageId
    if (previewImageId !== undefined) updateData.previewImage = previewImageId

    console.log('Updating template:', {
      id,
      ...updateData,
      elements: updateData.elements ? `${updateData.elements.length} elements` : undefined,
    })

    // Update the template
    const updatedTemplate = await payload.update({
      collection: 'image-templates',
      id: Number(id),
      data: updateData,
      user: user || undefined,
      overrideAccess: !user,
    })

    console.log('Template updated successfully:', updatedTemplate.id)

    return NextResponse.json({
      success: true,
      template: {
        id: updatedTemplate.id,
        name: updatedTemplate.name,
      },
      message: 'Template updated successfully',
    })
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      {
        error: 'Failed to update template',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
