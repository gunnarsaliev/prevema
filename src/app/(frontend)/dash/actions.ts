'use server'

import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Event } from '@/payload-types'

export async function getDashboardCounts() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) {
    return {
      events: 0,
      participants: 0,
      partners: 0,
      creatives: 0,
    }
  }

  try {
    const [eventsResult, participantsResult, partnersResult, emailTemplatesResult, imageTemplatesResult] =
      await Promise.all([
        payload.find({
          collection: 'events',
          overrideAccess: false,
          user,
          depth: 0,
          limit: 1,
          pagination: true,
        }),
        payload.find({
          collection: 'participants',
          overrideAccess: false,
          user,
          depth: 0,
          limit: 1,
          pagination: true,
        }),
        payload.find({
          collection: 'partners',
          overrideAccess: false,
          user,
          depth: 0,
          limit: 1,
          pagination: true,
        }),
        payload.find({
          collection: 'email-templates',
          overrideAccess: false,
          user,
          depth: 0,
          limit: 1,
          pagination: true,
        }),
        payload.find({
          collection: 'image-templates',
          overrideAccess: false,
          user,
          depth: 0,
          limit: 1,
          pagination: true,
        }),
      ])

    return {
      events: eventsResult.totalDocs || 0,
      participants: participantsResult.totalDocs || 0,
      partners: partnersResult.totalDocs || 0,
      creatives: (emailTemplatesResult.totalDocs || 0) + (imageTemplatesResult.totalDocs || 0),
    }
  } catch (error) {
    console.error('Error fetching dashboard counts:', error)
    return {
      events: 0,
      participants: 0,
      partners: 0,
      creatives: 0,
    }
  }
}

export async function getUpcomingEvent(): Promise<Event | null> {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) {
    return null
  }

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { docs } = await payload.find({
      collection: 'events',
      overrideAccess: false,
      user,
      depth: 1, // Include image relationship
      limit: 1,
      where: {
        startDate: {
          greater_than_equal: today.toISOString(),
        },
      },
      sort: 'startDate', // Get the nearest upcoming event
    })

    return docs.length > 0 ? docs[0] : null
  } catch (error) {
    console.error('Error fetching upcoming event:', error)
    return null
  }
}
