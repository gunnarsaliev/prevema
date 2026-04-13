import { NextRequest, NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    const { docs } = await payload.find({
      collection: 'email-logs',
      where: {
        and: [
          { toEmail: { equals: email } },
          { direction: { equals: 'outbound' } },
        ],
      },
      overrideAccess: false,
      user,
      depth: 0,
      limit: 100,
      sort: '-createdAt',
    })

    return NextResponse.json({ emails: docs })
  } catch (error) {
    console.error('Error fetching email history:', error)
    return NextResponse.json({ error: 'Failed to fetch email history' }, { status: 500 })
  }
}
