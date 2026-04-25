import { CalendarDays, MapPin } from 'lucide-react'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton variant of the events grid.
 * Renders the full Card chrome (border, padding, icons) and only replaces
 * dynamic values (image, day, month, location, title, description) with
 * <Skeleton /> placeholders.
 */
export function EventsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden gap-0 py-0 h-full">
          <CardHeader className="p-0 gap-0 grid-rows-1">
            <div className="relative aspect-[16/9] w-full bg-muted">
              <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-md border bg-secondary/50 px-2.5 py-1">
                <CalendarDays className="size-3.5 text-muted-foreground/60" aria-hidden />
                <Skeleton className="h-3 w-8" />
                <span className="text-muted-foreground/40">·</span>
                <Skeleton className="h-3 w-5" />
              </div>
              <div className="flex items-center gap-1 min-w-0">
                <MapPin className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>

            <Skeleton className="h-5 w-3/4" />

            <div className="space-y-2">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
              <Skeleton className="h-3.5 w-2/3" />
            </div>
          </CardContent>

          <CardFooter className="px-5 pb-5 pt-0" />
        </Card>
      ))}
    </div>
  )
}
