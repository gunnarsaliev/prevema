import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getUserOrganizationIds } from '@/access/utilities'

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    // Check authentication
    const authResult = await payload.auth({ headers: request.headers })
    const user = authResult?.user

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organizations
    const organizationIds = await getUserOrganizationIds(payload, user)

    // Query all partners
    const allPartners = await payload.find({
      collection: 'partners',
      limit: 100,
      depth: 1,
      overrideAccess: true, // Bypass access control to see all partners
    })

    // Query partners for event (with access control)
    const partnersWithAccess = await payload.find({
      collection: 'partners',
      where: eventId
        ? {
            event: {
              equals: eventId,
            },
          }
        : undefined,
      limit: 100,
      depth: 1,
      user,
      overrideAccess: false, // Use access control
    })

    return NextResponse.json({
      eventId,
      userOrganizations: organizationIds,
      allPartners: {
        total: allPartners.totalDocs,
        docs: allPartners.docs.map((p: any) => ({
          id: p.id,
          companyName: p.companyName,
          event: p.event,
          organization: p.organization,
        })),
      },
      partnersWithAccess: {
        total: partnersWithAccess.totalDocs,
        docs: partnersWithAccess.docs.map((p: any) => ({
          id: p.id,
          companyName: p.companyName,
          event: p.event,
          organization: p.organization,
        })),
      },
    })
  } catch (error) {
    console.error('[Debug API] Error:', error)
    return NextResponse.json(
      { error: 'Debug failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
