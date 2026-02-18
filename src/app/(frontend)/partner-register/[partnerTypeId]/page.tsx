import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { PublicPartnerForm } from '@/components/forms/PublicPartnerForm'
import { mergeOpenGraph } from '@/utils/mergeOpenGraph'

type Props = {
  params: Promise<{
    partnerTypeId: string
  }>
}

export default async function PartnerRegisterPage({ params }: Props) {
  const { partnerTypeId } = await params
  const payload = await getPayload({ config: configPromise })

  // Fetch the partner type
  let partnerType
  try {
    partnerType = await payload.findByID({
      collection: 'partner-types',
      id: partnerTypeId,
      depth: 1,
    })
  } catch {
    notFound()
  }

  if (!partnerType || !partnerType.isActive) {
    notFound()
  }

  const orgId =
    typeof partnerType.organization === 'object'
      ? partnerType.organization.id
      : partnerType.organization

  // If the partner type is linked to a specific event, use it directly
  if (partnerType.event) {
    const eventId = typeof partnerType.event === 'object' ? partnerType.event.id : partnerType.event

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
      <PartnerRegisterLayout
        partnerType={partnerType}
        event={event}
        eventImage={eventImage}
        partnerTypeId={partnerTypeId}
        eventId={String(eventId)}
        events={null}
      />
    )
  }

  // No event linked — fetch all open/planning events for the org so the registrant can pick
  const { docs: orgEvents } = await payload.find({
    collection: 'events',
    where: {
      and: [{ organization: { equals: orgId } }, { status: { in: ['open', 'planning'] } }],
    },
    depth: 0,
    limit: 50,
    sort: 'name',
  })

  if (orgEvents.length === 0) notFound()

  const events = orgEvents.map((e) => ({ id: String(e.id), name: e.name }))

  return (
    <PartnerRegisterLayout
      partnerType={partnerType}
      event={null}
      eventImage={null}
      partnerTypeId={partnerTypeId}
      eventId={null}
      events={events}
    />
  )
}

type EventOption = { id: string; name: string }

function PartnerRegisterLayout({
  partnerType,
  event,
  eventImage,
  partnerTypeId,
  eventId,
  events,
}: {
  partnerType: {
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
  partnerTypeId: string
  eventId: string | null
  events: EventOption[] | null
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container py-12 flex flex-col items-center">
        <div className="w-full max-w-3xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-block bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full mb-4">
              <span className="text-purple-700 dark:text-purple-300 font-medium text-sm">
                Partnership Opportunity
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {event ? `Partner with ${event.name}` : 'Partner with Us'}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
              as a{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                {partnerType.name}
              </span>
            </p>
            {partnerType.description && (
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mt-4">
                {partnerType.description}
              </p>
            )}
          </div>

          {/* Event Details Card — only when a specific event is linked */}
          {event && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100 dark:border-gray-700">
              {eventImage && (
                <div className="h-48 bg-gradient-to-r from-purple-500 to-blue-600 relative overflow-hidden">
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
                    Complete the partnership registration form below. Your submission will be
                    reviewed by our team, and we'll contact you at the email address you provide.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Registration Form Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Partnership Registration Form
            </h3>

            <PublicPartnerForm
              partnerTypeId={partnerTypeId}
              requiredFields={partnerType.requiredFields || []}
              optionalFields={partnerType.optionalFields || []}
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
  const { partnerTypeId } = await params
  const payload = await getPayload({ config: configPromise })

  let partnerType
  try {
    partnerType = await payload.findByID({
      collection: 'partner-types',
      id: partnerTypeId,
      depth: 0,
    })
  } catch {
    return { title: 'Partnership Registration' }
  }

  return {
    title: `Partner as ${partnerType.name}`,
    description: partnerType.description || `Register as a ${partnerType.name} partner`,
    openGraph: mergeOpenGraph({
      title: `Partner as ${partnerType.name}`,
      url: `/partner-register/${partnerTypeId}`,
    }),
  }
}
