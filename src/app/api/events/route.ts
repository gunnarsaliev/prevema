import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getUserOrganizationIds } from '@/access/utilities'

/**
 * GET /api/events
 * Returns events for the authenticated user's organizations
 * Requires authentication
 */
export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config })

    // Check authentication
    const authResult = await payload.auth({ headers: request.headers })
    const user = authResult?.user

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organizations
    const organizationIds = await getUserOrganizationIds(payload, user)

    if (organizationIds.length === 0) {
      return NextResponse.json({ docs: [] })
    }

    // Query events for the user's organizations (exclude archived events)
    const events = await payload.find({
      collection: 'events',
      where: {
        and: [
          {
            organization: {
              in: organizationIds,
            },
          },
          {
            status: {
              not_equals: 'archived',
            },
          },
        ],
      },
      sort: '-startDate',
      limit: 100,
      depth: 0,
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        startDate: true,
        endDate: true,
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('[API Events] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

/**
 * POST /api/events
 * Handles event creation from Payload admin
 * Delegates to Payload's native create operation
 */
export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config })

    // Check authentication first
    const authResult = await payload.auth({ headers: request.headers })
    const user = authResult?.user

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get form data from Payload admin
    const formData = await request.formData()

    // Payload sends data in _payload field as JSON string
    const payloadData = formData.get('_payload')
    if (!payloadData || typeof payloadData !== 'string') {
      return NextResponse.json({ error: 'No payload data found' }, { status: 400 })
    }

    // Parse the JSON payload
    const data = JSON.parse(payloadData)

    // Debug: Log the parsed data
    console.log('[API Events] Parsed data:', data)

    // Ensure required fields are present
    if (!data.organization) {
      return NextResponse.json({ error: 'Organization is required' }, { status: 400 })
    }
    if (!data.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!data.startDate) {
      return NextResponse.json({ error: 'Start date is required' }, { status: 400 })
    }

    // Create event using Payload's native API with access control
    const result = await payload.create({
      collection: 'events',
      data,
      draft: false,
      user,
      overrideAccess: false, // Enforce access control
    })

    console.log('[API Events] Created event:', result)

    // Return in the format Payload expects for admin redirect
    return NextResponse.json(
      {
        doc: result,
        message: 'Event created successfully',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[API Events] POST Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create event',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
