import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import Image from 'next/image'
import Link from 'next/link'
import config from '@/payload.config'
import { Button } from '@/components/ui/button'
import { ParticipantImageUpload } from './ParticipantImageUpload'

export default async function ParticipantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const participant = await payload
    .findByID({
      collection: 'participants',
      id: Number(id),
      overrideAccess: false,
      user,
      depth: 1,
    })
    .catch(() => null)

  if (!participant) notFound()

  const imageUrl =
    participant.imageUrl && typeof participant.imageUrl === 'object'
      ? participant.imageUrl.url
      : null
  const eventName =
    participant.event && typeof participant.event === 'object' ? participant.event.name : null
  const participantTypeName =
    participant.participantType && typeof participant.participantType === 'object'
      ? participant.participantType.name
      : null

  return (
    <div className="px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Participant Details</h1>
          <p className="text-sm text-muted-foreground mt-1">{participant.name}</p>
        </div>
        <Link href={`/dash/participants/${id}/edit`}>
          <Button>Edit Participant</Button>
        </Link>
      </div>
      <div className="bg-card rounded-lg border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Image Section */}
          <div className="md:col-span-1">
            {imageUrl ? (
              <div className="relative aspect-square w-full max-w-sm rounded-lg overflow-hidden bg-muted">
                <Image
                  src={imageUrl}
                  alt={participant.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            ) : (
              <ParticipantImageUpload participantId={id} />
            )}
          </div>

          {/* Details Section */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="mt-1 text-sm">{participant.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd className="mt-1 text-sm">{participant.email}</dd>
              </div>
              {eventName && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Event</dt>
                  <dd className="mt-1 text-sm">{eventName}</dd>
                </div>
              )}
              {participantTypeName && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Participant Type</dt>
                  <dd className="mt-1 text-sm">{participantTypeName}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      participant.status === 'approved'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : participant.status === 'need-info'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : participant.status === 'cancelled'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}
                  >
                    {participant.status === 'not-approved'
                      ? 'Not Approved'
                      : participant.status === 'approved'
                        ? 'Approved'
                        : participant.status === 'need-info'
                          ? 'Need Info'
                          : 'Cancelled'}
                  </span>
                </dd>
              </div>
              {participant.country && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Country</dt>
                  <dd className="mt-1 text-sm">{participant.country}</dd>
                </div>
              )}
              {participant.phoneNumber && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                  <dd className="mt-1 text-sm">{participant.phoneNumber}</dd>
                </div>
              )}
            </div>

            {participant.biography && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Biography</dt>
                <dd className="mt-1 text-sm whitespace-pre-wrap">{participant.biography}</dd>
              </div>
            )}

            {/* Company Information */}
            {(participant.companyName ||
              participant.companyPosition ||
              participant.companyWebsite) && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-3">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {participant.companyName && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Company</dt>
                      <dd className="mt-1 text-sm">{participant.companyName}</dd>
                    </div>
                  )}
                  {participant.companyPosition && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Position</dt>
                      <dd className="mt-1 text-sm">{participant.companyPosition}</dd>
                    </div>
                  )}
                  {participant.companyWebsite && (
                    <div className="md:col-span-2">
                      <dt className="text-sm font-medium text-muted-foreground">Website</dt>
                      <dd className="mt-1 text-sm">
                        <a
                          href={participant.companyWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {participant.companyWebsite}
                        </a>
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Presentation Information */}
            {(participant.presentationTopic ||
              participant.presentationSummary ||
              participant.technicalRequirements) && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-3">Presentation Details</h3>
                <div className="space-y-4">
                  {participant.presentationTopic && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Topic</dt>
                      <dd className="mt-1 text-sm">{participant.presentationTopic}</dd>
                    </div>
                  )}
                  {participant.presentationSummary && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Summary</dt>
                      <dd className="mt-1 text-sm whitespace-pre-wrap">
                        {participant.presentationSummary}
                      </dd>
                    </div>
                  )}
                  {participant.technicalRequirements && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Technical Requirements
                      </dt>
                      <dd className="mt-1 text-sm whitespace-pre-wrap">
                        {participant.technicalRequirements}
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social Links */}
            {participant.socialLinks && participant.socialLinks.length > 0 && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-3">Social Links</h3>
                <div className="flex flex-wrap gap-2">
                  {participant.socialLinks.map((link: any, index: number) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-sm"
                    >
                      {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
