import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { PublicParticipantForm } from '@/components/forms/PublicParticipantForm'
import { mergeOpenGraph } from '@/utils/mergeOpenGraph'

type Props = {
  params: Promise<{
    participantRoleId: string
    eventId: string
  }>
}

export default async function RegisterPage({ params }: Props) {
  const { participantRoleId, eventId } = await params
  const payload = await getPayload({ config: configPromise })

  // Fetch the participant role
  let participantRole
  try {
    participantRole = await payload.findByID({
      collection: 'participant-roles',
      id: participantRoleId,
      depth: 1,
    })
  } catch {
    notFound()
  }

  if (!participantRole || !participantRole.isActive) {
    notFound()
  }

  const orgId =
    typeof participantRole.organization === 'object'
      ? participantRole.organization.id
      : participantRole.organization

  // Fetch the specific event
  let event = null
  let eventImage = null
  try {
    const fetchedEvent = await payload.findByID({
      collection: 'events',
      id: eventId,
      depth: 1,
    })

    // Verify event belongs to the same organization and is open/planning
    if (
      fetchedEvent &&
      (fetchedEvent.organization === orgId ||
        (typeof fetchedEvent.organization === 'object' &&
          fetchedEvent.organization.id === orgId)) &&
      (fetchedEvent.status === 'open' || fetchedEvent.status === 'planning')
    ) {
      event = {
        name: fetchedEvent.name,
        description: fetchedEvent.description || null,
        startDate: fetchedEvent.startDate || undefined,
        endDate: fetchedEvent.endDate || null,
        eventType: fetchedEvent.eventType || null,
        address: fetchedEvent.address || null,
      }

      // Extract event image if available
      if (fetchedEvent.image && typeof fetchedEvent.image === 'object') {
        eventImage = (fetchedEvent.image as { url?: string | null }).url || null
      }
    } else {
      // Event doesn't belong to org or isn't open/planning
      notFound()
    }
  } catch {
    notFound()
  }

  return (
    <RegisterLayout
      participantRole={participantRole}
      event={event}
      eventImage={eventImage}
      participantRoleId={participantRoleId}
      eventId={eventId}
    />
  )
}

function RegisterLayout({
  participantRole,
  event,
  eventImage,
  participantRoleId,
  eventId,
}: {
  participantRole: {
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
  participantRoleId: string
  eventId: string
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
                {participantRole.name}
              </span>
            </p>
            {participantRole.description && (
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mt-4">
                {participantRole.description}
              </p>
            )}
          </div>

          {/* Event Details Card */}
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
              participantRoleId={participantRoleId}
              requiredFields={participantRole.requiredFields || []}
              optionalFields={participantRole.optionalFields || []}
              eventId={eventId}
              events={null}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { participantRoleId, eventId } = await params
  const payload = await getPayload({ config: configPromise })

  let participantRole
  try {
    participantRole = await payload.findByID({
      collection: 'participant-roles',
      id: participantRoleId,
      depth: 0,
    })
  } catch {
    return { title: 'Registration' }
  }

  let eventName = ''
  if (eventId) {
    try {
      const event = await payload.findByID({
        collection: 'events',
        id: eventId,
        depth: 0,
      })
      eventName = event.name ? ` - ${event.name}` : ''
    } catch {
      // Event not found, continue without event name
    }
  }

  return {
    title: `Register as ${participantRole.name}${eventName}`,
    description: participantRole.description || `Register as a ${participantRole.name}`,
    openGraph: mergeOpenGraph({
      title: `Register as ${participantRole.name}${eventName}`,
      url: `/participant-register/${participantRoleId}/${eventId}`,
    }),
  }
}
