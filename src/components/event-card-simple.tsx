import Image from 'next/image'
import { CalendarDays, MapPin } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface EventCardSimpleProps {
  image?: string | null
  day: number | string
  month: string
  location: string
  title: string
  description: string
}

/**
 * Simplified, presentational event card built from shadcn/ui primitives.
 * Server-component safe (no client hooks, no event handlers).
 */
export function EventCardSimple({
  image,
  day,
  month,
  location,
  title,
  description,
}: EventCardSimpleProps) {
  return (
    <Card className="overflow-hidden gap-0 py-0 h-full transition-shadow hover:shadow-md">
      <CardHeader className="p-0 gap-0 grid-rows-1">
        <div className="relative aspect-[2/1] w-full bg-muted">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <CalendarDays className="size-7 text-muted-foreground/40" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="gap-1 px-2 py-0.5 text-xs font-medium">
            <CalendarDays className="size-3" aria-hidden />
            <span className="uppercase tracking-wide">{month}</span>
            <span className="text-muted-foreground">·</span>
            <span className="tabular-nums">{day}</span>
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
            <MapPin className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{location}</span>
          </div>
        </div>

        <CardTitle className="text-sm font-semibold leading-snug line-clamp-1">{title}</CardTitle>

        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
      </CardContent>
    </Card>
  )
}
