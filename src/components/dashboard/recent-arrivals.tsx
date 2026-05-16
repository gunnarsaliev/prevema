'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { RecentArrivalItem } from './types'

interface RecentArrivalsWidgetProps {
  items: RecentArrivalItem[]
  title?: string
  viewAllHref?: string
}

export function RecentArrivalsWidget({
  items,
  title = 'Recent Participants',
  viewAllHref,
}: RecentArrivalsWidgetProps) {
  return (
    <div className="flex h-full w-full flex-col rounded-xl border bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-pretty sm:text-base">{title}</h2>
        {viewAllHref && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href={viewAllHref}>View All</Link>
          </Button>
        )}
      </div>

      <div className="-mx-4 min-h-0 flex-1 overflow-hidden border-y sm:-mx-5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center px-4">
            <div className="rounded-full bg-muted p-3">
              <svg
                className="size-5 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No participants yet</p>
              <p className="text-xs text-muted-foreground">
                Create your first event to start adding participants
              </p>
            </div>
            <Link
              href="/dash/events/create"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              Create your first event
              <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        ) : (
          <Table className="w-full table-fixed">
            <colgroup>
              <col className="w-[52%]" />
              <col className="w-[30%]" />
              <col className="w-[18%]" />
            </colgroup>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="h-8 pl-4 text-[11px] font-medium text-muted-foreground sm:pl-5">
                  Name
                </TableHead>
                <TableHead className="h-8 text-[11px] font-medium text-muted-foreground">
                  Event
                </TableHead>
                <TableHead className="h-8 pr-4 text-[11px] font-medium text-muted-foreground sm:pr-5">
                  Registered
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const href = item.href ?? viewAllHref
                return (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      if (href) window.location.href = href
                    }}
                  >
                    <TableCell className="py-2 pl-4 sm:pl-5">
                      <div className="flex min-w-0 items-center gap-2">
                        <Avatar className="size-6 shrink-0">
                          {item.avatar && <AvatarImage src={item.avatar} alt={item.name} />}
                          <AvatarFallback className="text-[10px]">{item.initials}</AvatarFallback>
                        </Avatar>
                        {href ? (
                          <Link
                            href={href}
                            className="truncate text-xs font-medium text-foreground hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.name}
                          </Link>
                        ) : (
                          <span className="truncate text-xs font-medium text-foreground">
                            {item.name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground truncate">
                      {item.subtitle ?? '—'}
                    </TableCell>
                    <TableCell className="py-2 pr-4 text-xs text-muted-foreground sm:pr-5">
                      {item.time}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
