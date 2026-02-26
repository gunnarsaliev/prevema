import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/events
 * Returns id + name for all events accessible to the authenticated user.
 */
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const events = await payload.find({
      collection: 'events',
      overrideAccess: false,
      user,
      depth: 0,
      limit: 100,
      sort: '-createdAt',
      select: {
        id: true,
        name: true,
      },
    })

    return NextResponse.json(events)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch events'
    console.error('[GET /api/events]', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * POST /api/events
 * Creates a new event for the authenticated user's organization.
 * This handler is required because the custom GET route above shadows
 * Payload's catch-all at (payload)/api/[...slug] for this path.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const event = await payload.create({
      collection: 'events',
      data: body,
      overrideAccess: false,
      user,
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create event'
    console.error('[POST /api/events]', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * DELETE /api/events
 * Deletes events based on query parameters (bulk delete support).
 * This handler is required because the custom GET route above shadows
 * Payload's catch-all at (payload)/api/[...slug] for this path.
 */
export async function DELETE(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters to extract event IDs
    const { searchParams } = new URL(req.url)

    // Collect all IDs from the query parameters (bulk delete support)
    const eventIds: string[] = []
    let index = 0
    while (true) {
      const id = searchParams.get(`where[and][0][id][in][${index}]`)
      if (!id) break
      eventIds.push(id)
      index++
    }

    if (eventIds.length === 0) {
      return NextResponse.json({ error: 'Missing event ID(s)' }, { status: 400 })
    }

    // Delete events and collect results
    const docs: any[] = []
    const errors: any[] = []

    for (const id of eventIds) {
      try {
        const result = await payload.delete({
          collection: 'events',
          id,
          overrideAccess: false,
          user,
        })
        docs.push(result)
      } catch (error: unknown) {
        console.error(`[DELETE /api/events] Failed to delete event ${id}:`, error)
        errors.push({
          id,
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Return bulk operation response format
    return NextResponse.json({ docs, errors }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete event(s)'
    console.error('[DELETE /api/events]', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
