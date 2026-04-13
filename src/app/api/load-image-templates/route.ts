import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getUserOrganizationIds, checkRole } from '@/access/utilities'

/**
 * GET /api/load-image-templates
 * Fetches user's image templates scoped to their organizations
 * Query params: organization (optional - to filter within user's orgs)
 */
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Authenticate user
    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get user's organization IDs
    const userOrgIds = await getUserOrganizationIds(payload, user)

    if (userOrgIds.length === 0 && !checkRole(['super-admin', 'admin'], user)) {
      return NextResponse.json({
        success: true,
        templates: [],
        total: 0,
      })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const organizationFilter = searchParams.get('organization')

    // Build query - scope to user's organizations
    const where: any = {
      isActive: {
        equals: true,
      },
    }

    // Super-admins and admins can see all templates
    if (!checkRole(['super-admin', 'admin'], user)) {
      // Regular users only see templates from their organizations
      where.organization = {
        in: userOrgIds,
      }
    }

    // If specific organization filter provided, ensure it's within user's orgs
    if (organizationFilter) {
      const filterId = Number(organizationFilter)
      if (checkRole(['super-admin', 'admin'], user) || userOrgIds.includes(filterId)) {
        where.organization = {
          equals: filterId,
        }
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
