import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { PublicParticipantForm } from '@/components/forms/PublicParticipantForm'
import { mergeOpenGraph } from '@/utils/mergeOpenGraph'

type Props = {
  params: Promise<{
    participantTypeId: string
  }>
}

export default async function RegisterPage({ params }: Props) {
  const { participantTypeId } = await params
  const payload = await getPayload({ config: configPromise })

  // Fetch the participant type
  let participantType
  try {
    participantType = await payload.findByID({
      collection: 'participant-types',
      id: participantTypeId,
      depth: 1,
    })
  } catch {
    notFound()
  }

  if (!participantType || !participantType.isActive) {
    notFound()
  }

  const orgId =
    typeof participantType.organization === 'object'
      ? participantType.organization.id
      : participantType.organization

  // If the participant type is linked to a specific event, use it directly
  if (participantType.event) {
    const eventId =
      typeof participantType.event === 'object'
        ? participantType.event.id
        : participantType.event

    let event
    try {
      event = await payload.findByID({
        collection: 'events',
        id: eventId,
        depth: 1,
      })
    } catch {
      notFound()
    }

    if (!event) notFound()

    if (event.status && !['open', 'planning'].includes(event.status)) {
      notFound()
    }

    const eventImage = event.image && typeof event.image === 'object' ? (event.image.url ?? null) : null

    return (
      <RegisterLayout
        participantType={participantType}
        event={event}
        eventImage={eventImage}
        participantTypeId={participantTypeId}
        eventId={String(eventId)}
        events={null}
      />
    )
  }

  // No event linked — fetch all open/planning events for the org so the registrant can pick
  const { docs: orgEvents } = await payload.find({
    collection: 'events',
    where: {
      and: [
        { organization: { equals: orgId } },
        { status: { in: ['open', 'planning'] } },
      ],
    },
    depth: 0,
    limit: 50,
    sort: 'name',
  })

  if (orgEvents.length === 0) notFound()

  const events = orgEvents.map((e) => ({ id: String(e.id), name: e.name }))

  return (
    <RegisterLayout
      participantType={participantType}
      event={null}
      eventImage={null}
      participantTypeId={participantTypeId}
      eventId={null}
      events={events}
    />
  )
}

type EventOption = { id: string; name: string }

function RegisterLayout({
  participantType,
  event,
  eventImage,
  participantTypeId,
  eventId,
  events,
}: {
  participantType: {
    name: string
    description?: string | null
    requiredFields?: string[] | null
    optionalFields?: string[] | null
  }
  event: {
    name: string
    description?: string | null
    startDate?: string
    endDate?: string | null
    eventType?: string | null
    address?: string | null
  } | null
  eventImage: string | null
  participantTypeId: string
  eventId: string | null
  events: EventOption[] | null
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container py-12 flex flex-col items-center">
        <div className="w-full max-w-3xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-block bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full mb-4">
              <span className="text-blue-700 dark:text-blue-300 font-medium text-sm">
                You're Invited!
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {event ? `Join ${event.name}` : 'Register Now'}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
              as a{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                {participantType.name}
              </span>
            </p>
            {participantType.description && (
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mt-4">
                {participantType.description}
              </p>
            )}
          </div>

          {/* Event Details Card — only when a specific event is linked */}
          {event && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100 dark:border-gray-700">
              {eventImage && (
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
                  <img
                    src={eventImage}
                    alt={event.name}
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              )}
              <div className="p-8">
                <div className="flex items-start gap-6 mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {event.name}
                    </h2>
                    {event.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.startDate && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Date</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {new Date(event.startDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        {event.endDate && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            to{' '}
                            {new Date(event.endDate).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Format</div>
                      <div className="font-medium text-gray-900 dark:text-white capitalize">
                        {event.eventType === 'physical' ? 'In-Person' : 'Virtual'}
                      </div>
                      {event.eventType === 'physical' && event.address && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {event.address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Complete the registration form below. Your submission will be reviewed by our
                    team, and we'll contact you at the email address you provide.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Registration Form Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Registration Form
            </h3>

            <PublicParticipantForm
              participantTypeId={participantTypeId}
              requiredFields={participantType.requiredFields || []}
              optionalFields={participantType.optionalFields || []}
              eventId={eventId}
              events={events}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { participantTypeId } = await params
  const payload = await getPayload({ config: configPromise })

  let participantType
  try {
    participantType = await payload.findByID({
      collection: 'participant-types',
      id: participantTypeId,
      depth: 0,
    })
  } catch {
    return { title: 'Registration' }
  }

  return {
    title: `Register as ${participantType.name}`,
    description: participantType.description || `Register as a ${participantType.name}`,
    openGraph: mergeOpenGraph({
      title: `Register as ${participantType.name}`,
      url: `/register/${participantTypeId}`,
    }),
  }
}
