import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/catalyst/button'
import { Heading } from '@/components/catalyst/heading'
import { Link } from '@/components/catalyst/link'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getCachedUserOrgIds } from '@/lib/cached-queries'
import { getTwDashEvent, mapEventToCatalyst } from '../data'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })
  if (!user) return {}
  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const event = await getTwDashEvent(id, userId)

  return {
    title: event?.name,
  }
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)

  if (organizationIds.length === 0) notFound()

  const rawEvent = await getTwDashEvent(id, userId)
  if (!rawEvent) notFound()

  const eventOrgId =
    typeof rawEvent.organization === 'object' && rawEvent.organization !== null
      ? rawEvent.organization.id
      : rawEvent.organization
  if (!organizationIds.includes(Number(eventOrgId))) notFound()

  const event = mapEventToCatalyst(rawEvent)

  return (
    <>
      <div className="max-lg:hidden">
        <Link
          href="/tw/dash/events"
          className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400"
        >
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Events
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          {event.imgUrl && (
            <div className="w-32 shrink-0">
              <img className="aspect-3/2 rounded-lg shadow-sm" src={event.imgUrl} alt="" />
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Heading>{event.name}</Heading>
              <Badge color={event.status === 'On Sale' ? 'lime' : 'zinc'}>{event.status}</Badge>
            </div>
            <div className="mt-2 text-sm/6 text-zinc-500">
              {event.date}
              {event.location && (
                <>
                  {' '}
                  <span aria-hidden="true">·</span> {event.location}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button outline href={`/tw/dash/events/${id}/edit`}>
            Edit
          </Button>
          <Button>View</Button>
        </div>
      </div>
    </>
  )
}
