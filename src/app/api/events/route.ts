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
  } catch (error: any) {
    console.error('[GET /api/events]', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch events' }, { status: 500 })
  }
}
