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
