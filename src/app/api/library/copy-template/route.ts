import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { ImageTemplate, EmailTemplate } from '@/payload-types'
import { checkRole, getUserOrganizationIds } from '@/access/utilities'

/**
 * Request body for copying a template
 */
interface CopyTemplateRequest {
  /** ID of the template to copy */
  templateId: string | number
  /** Type of template: 'image' or 'email' */
  templateType: 'image' | 'email'
}

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false
  error: string
  code: string
  details?: string
}

/**
 * Success response interface
 */
interface SuccessResponse {
  success: true
  templateId: number
  message: string
}

/**
 * POST /api/library/copy-template
 *
 * Copy a public library template to the user's organization.
 * Creates a private copy that the user can edit.
 *
 * **Authentication**: Required
 * **Authorization**: User must have an organization
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Authentication check
    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          code: 'UNAUTHORIZED',
        } as ErrorResponse,
        { status: 401 },
      )
    }

    // Parse request body
    let body: CopyTemplateRequest
    try {
      body = await req.json()
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          code: 'INVALID_REQUEST',
          details: error instanceof Error ? error.message : 'Failed to parse JSON',
        } as ErrorResponse,
        { status: 400 },
      )
    }

    const { templateId, templateType } = body

    // Validate required fields
    if (!templateId) {
      return NextResponse.json(
        {
          success: false,
          error: 'templateId is required',
          code: 'INVALID_REQUEST',
        } as ErrorResponse,
        { status: 400 },
      )
    }

    if (!templateType || !['image', 'email'].includes(templateType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'templateType must be "image" or "email"',
          code: 'INVALID_REQUEST',
        } as ErrorResponse,
        { status: 400 },
      )
    }

    // Get user's organizations
    const isSuperAdmin = checkRole(['super-admin'], user)
    const userOrganizationIds = await getUserOrganizationIds(payload, user)

    if (!isSuperAdmin && userOrganizationIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'User must belong to an organization to copy templates',
          code: 'NO_ORGANIZATION',
        } as ErrorResponse,
        { status: 403 },
      )
    }

    // Determine which collection to use
    const collection = templateType === 'image' ? 'image-templates' : 'email-templates'

    // Fetch the original template
    let originalTemplate: ImageTemplate | EmailTemplate
    try {
      originalTemplate = await payload.findByID({
        collection,
        id: templateId,
        depth: 2, // Populate relationships
      })
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template not found',
          code: 'NOT_FOUND',
          details: error instanceof Error ? error.message : 'Unknown error',
        } as ErrorResponse,
        { status: 404 },
      )
    }

    // Verify the template is in the public library
    if (!originalTemplate.isPublicLibrary) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template is not available in the public library',
          code: 'NOT_PUBLIC_LIBRARY',
        } as ErrorResponse,
        { status: 403 },
      )
    }

    // Get the organization to assign the copy to
    // Use the first organization for regular users, or allow super-admins to specify
    let targetOrganizationId: number | string

    if (isSuperAdmin) {
      // Super-admins can copy to any organization, default to the template's publisher org or first available
      const publisherOrgId =
        typeof (originalTemplate as any).publisherOrganization === 'object'
          ? (originalTemplate as any).publisherOrganization?.id
          : (originalTemplate as any).publisherOrganization

      targetOrganizationId = publisherOrgId || userOrganizationIds[0] || 1
    } else {
      targetOrganizationId = userOrganizationIds[0]
    }

    // Prepare the copy data based on template type
    let copyData: Partial<ImageTemplate> | Partial<EmailTemplate>

    if (templateType === 'image') {
      const imageTemplate = originalTemplate as ImageTemplate
      copyData = {
        name: `${imageTemplate.name} (Copy)`,
        organization: targetOrganizationId,
        isActive: true,
        isPublic: false,
        isPublicLibrary: false,
        isPremium: false,
        isCopy: true,
        copiedFrom: imageTemplate.id,
        publisherOrganization: null,
        width: imageTemplate.width,
        height: imageTemplate.height,
        backgroundImage: imageTemplate.backgroundImage,
        backgroundColor: imageTemplate.backgroundColor,
        elements: imageTemplate.elements,
        previewImage: imageTemplate.previewImage,
      } as Partial<ImageTemplate>
    } else {
      const emailTemplate = originalTemplate as EmailTemplate
      copyData = {
        name: `${emailTemplate.name} (Copy)`,
        description: emailTemplate.description,
        organization: targetOrganizationId,
        isActive: true,
        isPublic: false,
        isPublicLibrary: false,
        isPremium: false,
        isCopy: true,
        copiedFrom: emailTemplate.id,
        publisherOrganization: null,
        subject: emailTemplate.subject,
        htmlBody: emailTemplate.htmlBody,
        automationTriggers: emailTemplate.automationTriggers,
      } as Partial<EmailTemplate>
    }

    // Create the copy
    try {
      const newTemplate = await payload.create({
        collection,
        data: copyData as any,
      })

      return NextResponse.json(
        {
          success: true,
          templateId: newTemplate.id,
          message: `Template copied successfully to your organization`,
        } as SuccessResponse,
        { status: 201 },
      )
    } catch (error) {
      console.error('Error copying template:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create template copy',
          code: 'CREATE_FAILED',
          details: error instanceof Error ? error.message : 'Unknown error',
        } as ErrorResponse,
        { status: 500 },
      )
    }
  } catch (error) {
    console.error('Error in copy-template API:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      } as ErrorResponse,
      { status: 500 },
    )
  }
}
