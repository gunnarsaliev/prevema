import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * GET /api/load-image-templates
 * Fetches user's image templates with optional filtering
 * Query params: organization
 */
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const organizationFilter = searchParams.get('organization')

    // Build query
    const where: any = {
      isActive: {
        equals: true,
      },
    }

    if (organizationFilter) {
      where.organization = {
        equals: organizationFilter,
      }
    }

    // Fetch templates with populated relationships
    const templates = await payload.find({
      collection: 'image-templates',
      where,
      sort: '-createdAt',
      limit: 100,
      depth: 2, // Populate backgroundImage and previewImage relationships
    })

    // Format response
    const formattedTemplates = templates.docs.map((template) => ({
      id: template.id,
      name: template.name,
      isPublic: template.isPublic,
      isPremium: template.isPremium,
      width: template.width,
      height: template.height,
      backgroundImage:
        typeof template.backgroundImage === 'object' && template.backgroundImage !== null
          ? (template.backgroundImage as any).url
          : template.backgroundImage,
      backgroundImageId:
        typeof template.backgroundImage === 'object' && template.backgroundImage !== null
          ? (template.backgroundImage as any).id
          : template.backgroundImage,
      backgroundColor: template.backgroundColor,
      elements: template.elements,
      previewImage:
        typeof template.previewImage === 'object' && template.previewImage !== null
          ? (template.previewImage as any).url
          : template.previewImage,
      previewImageId:
        typeof template.previewImage === 'object' && template.previewImage !== null
          ? (template.previewImage as any).id
          : template.previewImage,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      templates: formattedTemplates,
      total: templates.totalDocs,
    })
  } catch (error) {
    console.error('Error loading templates:', error)
    return NextResponse.json(
      {
        error: 'Failed to load templates',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
