'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/catalyst/button'
import { Divider } from '@/components/catalyst/divider'
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@/components/catalyst/dropdown'
import { Alert, AlertActions, AlertDescription, AlertTitle } from '@/components/catalyst/alert'
import {
  EllipsisVerticalIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  GlobeAltIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/16/solid'
import { Skeleton } from '@/components/ui/skeleton'
import { QuickViewDrawer } from './QuickViewDrawer'
import type { QuickViewItem } from './QuickViewDrawer'
import type { CatalystEvent } from './data'
import { deleteEvent } from './create/actions'

function EventImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)

  if (!src) {
    return <div className="aspect-3/2 w-full rounded-lg bg-zinc-100 dark:bg-zinc-800" />
  }

  return (
    <div className="relative aspect-3/2 w-full">
      {!loaded && <Skeleton className="absolute inset-0 rounded-lg" />}
      <img
        className={`aspect-3/2 rounded-lg shadow-sm transition-opacity duration-200 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}

function eventToItem(event: CatalystEvent): QuickViewItem {
  const fields: QuickViewItem['fields'] = []
  if (event.date) {
    const text =
      event.endDate && event.endDate !== event.date
        ? `${event.date} → ${event.endDate}`
        : event.date
    fields.push({
      icon: <CalendarIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />,
      text,
    })
  }
  if (event.timezone)
    fields.push({
      icon: <ClockIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />,
      text: event.timezone,
    })
  if (event.location)
    fields.push({
      icon: <MapPinIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />,
      text: event.location,
    })

  const sections: QuickViewItem['sections'] = []
  if (event.description) sections.push({ title: 'About', content: event.description })
  if (event.why) sections.push({ title: 'Why', content: event.why })
  if (event.what) sections.push({ title: 'What', content: event.what })
  if (event.who) sections.push({ title: 'Who', content: event.who })

  const badges: NonNullable<QuickViewItem['badges']> = [
    {
      label: event.status.charAt(0).toUpperCase() + event.status.slice(1),
      color:
        event.status === 'open'
          ? 'lime'
          : event.status === 'planning'
            ? 'yellow'
            : event.status === 'archived'
              ? 'zinc'
              : 'red',
    },
  ]
  if (event.eventType) {
    badges.push({
      label: event.eventType,
      color: 'blue',
      icon:
        event.eventType === 'online' ? (
          <GlobeAltIcon className="size-3" />
        ) : (
          <BuildingOffice2Icon className="size-3" />
        ),
    })
  }

  return {
    id: event.id,
    title: event.name,
    subtitle: event.theme,
    imageUrl: event.imgUrl,
    badges,
    fields,
    sections,
    detailHref: event.url,
  }
}

export function EventsList({ events }: { events: CatalystEvent[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<QuickViewItem | null>(null)
  const [toDelete, setToDelete] = useState<CatalystEvent | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!toDelete) return
    setDeleting(true)
    const result = await deleteEvent(toDelete.id)
    setDeleting(false)
    if (result.success) {
      setToDelete(null)
      router.refresh()
    }
  }

  return (
    <>
      <ul className="mt-10">
        {events.map((event, index) => (
          <li key={event.id}>
            <Divider soft={index > 0} />
            <div className="flex items-center justify-between">
              <div className="flex gap-6 py-6">
                <div className="w-32 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelected(eventToItem(event))}
                    className="block w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 rounded-lg"
                    aria-label={`Preview ${event.name}`}
                  >
                    <EventImage src={event.imgUrl} alt="" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  <div className="text-base/6 font-semibold">
                    <button
                      type="button"
                      onClick={() => setSelected(eventToItem(event))}
                      className="text-left hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 rounded"
                    >
                      {event.name}
                    </button>
                  </div>
                  <div className="text-xs/6 text-zinc-500">
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
              <div className="flex items-center gap-4">
                <Badge
                  className="max-sm:hidden"
                  color={
                    event.status === 'open'
                      ? 'lime'
                      : event.status === 'planning'
                        ? 'yellow'
                        : event.status === 'archived'
                          ? 'zinc'
                          : 'red'
                  }
                >
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Badge>
                <Dropdown>
                  <DropdownButton plain aria-label="More options">
                    <EllipsisVerticalIcon />
                  </DropdownButton>
                  <DropdownMenu anchor="bottom end">
                    <DropdownItem href={event.url}>View</DropdownItem>
                    <DropdownItem onClick={() => setSelected(eventToItem(event))}>
                      Preview
                    </DropdownItem>
                    <DropdownItem href={`/tw/dash/events/${event.id}/edit`}>Edit</DropdownItem>
                    <DropdownItem onClick={() => setToDelete(event)}>Delete</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <QuickViewDrawer item={selected} onClose={() => setSelected(null)} />

      <Alert open={toDelete !== null} onClose={() => setToDelete(null)}>
        <AlertTitle>Delete event?</AlertTitle>
        <AlertDescription>This action cannot be undone.</AlertDescription>
        <AlertActions>
          <Button plain onClick={() => setToDelete(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete event'}
          </Button>
        </AlertActions>
      </Alert>
    </>
  )
}
