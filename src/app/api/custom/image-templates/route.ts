import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { cookies } from 'next/headers'
import config from '@/payload.config'
import type { CanvasElement } from '@/components/canvas/types/canvas-element'

interface CreateTemplateRequest {
  name: string
  isPublic?: boolean
  isPremium?: boolean
  organization?: string
  width?: number
  height?: number
  backgroundImage?: string
  backgroundColor?: string
  elements?: CanvasElement[]
  previewImage?: string
}

/**
 * POST /api/custom/image-templates
 * Creates a new image template
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

    // Parse body
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }

    let body: CreateTemplateRequest
    try {
      body = (await req.json()) as CreateTemplateRequest
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid request body - must be valid JSON' },
        { status: 400 }
      )
    }

    const {
      name,
      isPublic,
      isPremium,
      organization,
      width = 800,
      height = 600,
      backgroundImage,
      backgroundColor,
      elements = [],
      previewImage,
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      )
    }

    // Get user's organization if not provided
    let finalOrganization: string | undefined = organization
    if (!finalOrganization && user) {
      try {
        const userOrgs = (user as any).organizations
        if (userOrgs && Array.isArray(userOrgs) && userOrgs.length > 0) {
          const firstOrg = userOrgs[0]
          finalOrganization = typeof firstOrg === 'string' ? firstOrg : firstOrg?.id
        }
      } catch (error) {
        console.error('Error getting user organization:', error)
      }
    }

    // Build template data
    const templateData: any = {
      name,
      isPublic: isPublic || false,
      isPremium: isPremium || false,
      width,
      height,
      backgroundColor: backgroundColor || '#ffffff',
      elements,
      isActive: true,
    }

    if (finalOrganization) {
      templateData.organization = finalOrganization
    }

    if (backgroundImage) {
      // Handle background image (could be ID, color, or base64)
      if (typeof backgroundImage === 'string' && !backgroundImage.startsWith('#') && !backgroundImage.startsWith('data:')) {
        templateData.backgroundImage = backgroundImage
      }
    }

    // Handle preview image upload if provided as base64
    if (previewImage && previewImage.startsWith('data:')) {
      try {
        const mimeMatch = previewImage.match(/^data:(image\/\w+);base64,/)
        const mimetype = mimeMatch ? mimeMatch[1] : 'image/jpeg'
        const extension = mimetype.split('/')[1] || 'jpg'
        const base64Data = previewImage.replace(/^data:image\/\w+;base64,/, '')

        const bufferSize = (base64Data.length * 3) / 4
        if (bufferSize <= 5 * 1024 * 1024) {
          const buffer = Buffer.from(base64Data, 'base64')

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
            user: user || undefined,
            overrideAccess: !user,
          })

          templateData.previewImage = previewMedia.id
        }
      } catch (error) {
        console.error('Failed to upload preview image:', error)
      }
    }

    // Create the template
    const template = await payload.create({
      collection: 'image-templates',
      data: templateData,
      user: user || undefined,
      overrideAccess: !user,
    })

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
      },
      message: 'Template created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)

    // Check for unique constraint violation
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('UNIQUE constraint failed') && errorMessage.includes('slug')) {
      return NextResponse.json(
        { error: 'A template with this name already exists. Please choose a different name.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to create template',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
