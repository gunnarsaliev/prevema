import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { ImageGenerationService } from '@/services/imageGeneration'
import { ZipArchiveService } from '@/services/zipArchive'
import { checkRole, getUserOrganizationIdsWithMinRole } from '@/access/utilities'
import type { Participant, ImageTemplate } from '@/payload-types'

/**
 * Request body interface for image generation endpoint
 */
interface GenerateImagesRequest {
  /** Array of participant IDs to generate images for */
  participantIds: string[]
  /** ID of the image template to use */
  templateId: string
}

/**
 * Error response interface for failed requests
 */
interface ErrorResponse {
  /** Always false for error responses */
  success: false
  /** User-friendly error message */
  error: string
  /** Error code for client-side handling */
  code: string
  /** Technical details (included in development mode) */
  details?: string
  /** List of participants that failed during bulk generation */
  failedParticipants?: Array<{
    id: string
    name: string
    error: string
  }>
}

/**
 * POST /api/generate-participant-images
 *
 * Generate personalized images for participants using a saved image template.
 * This endpoint handles both single and bulk image generation.
 *
 * **Authentication**: Required - User must be logged in
 * **Authorization**: User must have access to the template and all participants
 *
 * **Request Body**:
 * ```json
 * {
 *   "participantIds": ["participant-id-1", "participant-id-2"],
 *   "templateId": "template-id"
 * }
 * ```
 *
 * **Response**:
 * - Single participant: Returns PNG image with Content-Type: image/png
 * - Multiple participants: Returns ZIP archive with Content-Type: application/zip
 *
 * **Error Codes**:
 * - UNAUTHORIZED: User not authenticated
 * - INVALID_REQUEST: Missing or invalid request parameters
 * - FORBIDDEN: User lacks access to template or participants
 * - NOT_FOUND: Template or participants not found
 * - GENERATION_FAILED: All image generations failed
 * - INTERNAL_ERROR: Unexpected server error
 *
 * **Organization Isolation**:
 * - Non-admin users can only access templates and participants from their authorized organizations
 * - Super-admins can access all organizations
 *
 * @param req - Next.js request object
 * @returns NextResponse with image/ZIP buffer or error JSON
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Subtask 5.1: Authentication check
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

    // Subtask 5.1: Parse request body
    let body: GenerateImagesRequest
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

    const { participantIds, templateId } = body

    // Validate required fields
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'participantIds is required and must be a non-empty array',
          code: 'INVALID_REQUEST',
        } as ErrorResponse,
        { status: 400 },
      )
    }

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

    // Subtask 5.2: Get user's authorized organization IDs
    const isSuperAdmin = checkRole(['super-admin'], user)
    let authorizedOrganizationIds: (string | number)[] = []

    if (!isSuperAdmin) {
      authorizedOrganizationIds = await getUserOrganizationIdsWithMinRole(payload, user, 'viewer')

      if (authorizedOrganizationIds.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'User has no authorized organizations',
            code: 'FORBIDDEN',
          } as ErrorResponse,
          { status: 403 },
        )
      }
    }

    // Subtask 5.5: Fetch template from database
    let template: ImageTemplate
    try {
      template = await payload.findByID({
        collection: 'image-templates',
        id: templateId,
        depth: 2, // Populate backgroundImage
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

    // Subtask 5.2: Validate user has access to template
    if (!isSuperAdmin) {
      const templateOrganizationId =
        typeof template.organization === 'object'
          ? template.organization?.id
          : template.organization

      if (!templateOrganizationId || !authorizedOrganizationIds.includes(templateOrganizationId)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Access denied to this template',
            code: 'FORBIDDEN',
          } as ErrorResponse,
          { status: 403 },
        )
      }
    }

    // Subtask 5.5: Fetch participants from database
    let participants: Participant[]
    try {
      const participantsResult = await payload.find({
        collection: 'participants',
        where: {
          id: {
            in: participantIds,
          },
        },
        depth: 2, // Populate media fields (imageUrl, companyLogoUrl)
        limit: participantIds.length,
      })

      participants = participantsResult.docs
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch participants',
          code: 'DATABASE_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error',
        } as ErrorResponse,
        { status: 500 },
      )
    }

    // Check if all requested participants were found
    if (participants.length !== participantIds.length) {
      const foundIds = participants.map((p) => String(p.id))
      const missingIds = participantIds.filter((id) => !foundIds.includes(id))

      return NextResponse.json(
        {
          success: false,
          error: 'Some participants not found',
          code: 'NOT_FOUND',
          details: `Missing participant IDs: ${missingIds.join(', ')}`,
        } as ErrorResponse,
        { status: 404 },
      )
    }

    // Subtask 5.2: Validate user has access to all participants
    if (!isSuperAdmin) {
      const unauthorizedParticipants = participants.filter((participant) => {
        const participantOrganizationId =
          typeof participant.organization === 'object'
            ? participant.organization?.id
            : participant.organization

        return (
          !participantOrganizationId ||
          !authorizedOrganizationIds.includes(participantOrganizationId)
        )
      })

      if (unauthorizedParticipants.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Access denied to some participants',
            code: 'FORBIDDEN',
            details: `Unauthorized participant IDs: ${unauthorizedParticipants.map((p) => p.id).join(', ')}`,
          } as ErrorResponse,
          { status: 403 },
        )
      }
    }

    // Subtask 5.6: Call ImageGenerationService to generate images
    const imageGenerationService = new ImageGenerationService()
    const generatedImages = await imageGenerationService.generateImages(participants, template)

    // Subtask 5.8: Collect errors for failed generations
    const failedParticipants = generatedImages
      .filter((img) => !img.success)
      .map((img) => ({
        id: img.participantId,
        name: img.participantName,
        error: img.error || 'Unknown error',
      }))

    const successfulImages = generatedImages.filter((img) => img.success)

    // If all generations failed, return error
    if (successfulImages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'All image generations failed',
          code: 'GENERATION_FAILED',
          failedParticipants,
        } as ErrorResponse,
        { status: 500 },
      )
    }

    // Subtask 5.7: Return single image or ZIP based on count
    if (successfulImages.length === 1) {
      // Single image: return PNG buffer with download headers
      const image = successfulImages[0]

      return new NextResponse(new Uint8Array(image.buffer), {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${image.fileName}"`,
          'Content-Length': String(image.buffer.length),
        },
      })
    } else {
      // Multiple images: create ZIP and return with download headers
      const zipService = new ZipArchiveService()

      const imagesForZip = successfulImages.map((img) => ({
        buffer: img.buffer,
        fileName: img.fileName,
      }))

      const zipBuffer = await zipService.createZip(imagesForZip)
      const zipFileName = zipService.generateZipFilename(template.name)

      // If there were failures, log them
      if (failedParticipants.length > 0) {
        console.warn('Some participants failed during generation:', failedParticipants)
      }

      return new NextResponse(new Uint8Array(zipBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${zipFileName}"`,
          'Content-Length': String(zipBuffer.length),
          // Include failed participants info in a custom header (optional)
          'X-Failed-Count': String(failedParticipants.length),
        },
      })
    }
  } catch (error) {
    // Subtask 5.8: Log errors for debugging
    console.error('Error in generate-participant-images API:', error)

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
