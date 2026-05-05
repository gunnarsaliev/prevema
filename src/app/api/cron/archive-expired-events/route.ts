import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config: await config })
  const now = new Date().toISOString()

  const { docs } = await payload.find({
    collection: 'events',
    where: {
      and: [
        { endDate: { less_than: now } },
        { status: { not_equals: 'archived' } },
      ],
    },
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })

  let archived = 0
  for (const ev of docs) {
    try {
      await payload.update({
        collection: 'events',
        id: ev.id,
        data: { status: 'archived' },
        overrideAccess: true,
      })
      archived++
    } catch (err) {
      payload.logger.error({ err, eventId: ev.id }, 'cron/archive-expired-events: update failed')
    }
  }

  return NextResponse.json({ archived, total: docs.length })
}
