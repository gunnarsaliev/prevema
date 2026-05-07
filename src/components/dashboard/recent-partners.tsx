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
import type { RecentPartnerItem } from './types'

interface RecentPartnersWidgetProps {
  items: RecentPartnerItem[]
  title?: string
  viewAllHref?: string
}

export function RecentPartnersWidget({
  items,
  title = 'Recent Partners',
  viewAllHref = '/dash/partners',
}: RecentPartnersWidgetProps) {
  return (
    <div className="flex h-full w-full flex-col rounded-xl border bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-pretty sm:text-base">{title}</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link href={viewAllHref}>View All</Link>
        </Button>
      </div>

      <div className="-mx-4 min-h-0 flex-1 overflow-hidden border-y sm:-mx-5">
        {items.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            No partners yet
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
                  Company
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
                      window.location.href = href
                    }}
                  >
                    <TableCell className="py-2 pl-4 sm:pl-5">
                      <div className="flex min-w-0 items-center gap-2">
                        <Avatar className="size-6 shrink-0">
                          {item.logoUrl && (
                            <AvatarImage src={item.logoUrl} alt={item.companyName} />
                          )}
                          <AvatarFallback className="text-[10px]">{item.initials}</AvatarFallback>
                        </Avatar>
                        <Link
                          href={href}
                          className="truncate text-xs font-medium text-foreground hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.companyName}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground truncate">
                      {item.eventName ?? '—'}
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
