'use client'

import { useState } from 'react'
import { Badge } from '@/components/catalyst/badge'
import { Divider } from '@/components/catalyst/divider'
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@/components/catalyst/dropdown'
import { Link } from '@/components/catalyst/link'
import { EllipsisVerticalIcon } from '@heroicons/react/16/solid'
import { QuickViewDrawer } from './QuickViewDrawer'
import type { CatalystEvent } from './data'

export function EventsList({ events }: { events: CatalystEvent[] }) {
  const [selected, setSelected] = useState<CatalystEvent | null>(null)

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
                    onClick={() => setSelected(event)}
                    className="block w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 rounded-lg"
                    aria-label={`Preview ${event.name}`}
                  >
                    <img className="aspect-3/2 rounded-lg shadow-sm" src={event.imgUrl} alt="" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  <div className="text-base/6 font-semibold">
                    <button
                      type="button"
                      onClick={() => setSelected(event)}
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
                  color={event.status === 'On Sale' ? 'lime' : 'zinc'}
                >
                  {event.status}
                </Badge>
                <Dropdown>
                  <DropdownButton plain aria-label="More options">
                    <EllipsisVerticalIcon />
                  </DropdownButton>
                  <DropdownMenu anchor="bottom end">
                    <DropdownItem href={event.url}>View</DropdownItem>
                    <DropdownItem onClick={() => setSelected(event)}>Preview</DropdownItem>
                    <DropdownItem>Edit</DropdownItem>
                    <DropdownItem>Delete</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <QuickViewDrawer event={selected} onClose={() => setSelected(null)} />
    </>
  )
}
