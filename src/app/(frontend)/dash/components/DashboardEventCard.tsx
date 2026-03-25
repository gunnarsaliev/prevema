'use client'

import Image from 'next/image'
import { Icon } from '@iconify/react'
import { MapPin, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'

interface DashboardEventCardProps {
  image?: string | null
  startDate: string
  endDate?: string | null
  location: string
  title: string
  description: string
  eventType?: 'in-person' | 'online' | 'hybrid'
}

export function DashboardEventCard({
  image,
  startDate,
  endDate,
  location,
  title,
  description,
  eventType,
}: DashboardEventCardProps) {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : null

  const formatDate = (date: Date) => {
    return format(date, 'EEEE, MMMM d, yyyy')
  }

  const formatTime = (date: Date) => {
    return format(date, 'h:mm a')
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="grid md:grid-cols-[400px_1fr] gap-0">
        {/* Image Section */}
        <div className="relative h-[250px] md:h-full min-h-[250px] bg-muted">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Icon icon="solar:calendar-bold-duotone" className="text-muted-foreground/30 size-24" />
            </div>
          )}
          {eventType && (
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
                {eventType === 'in-person' && '📍 In Person'}
                {eventType === 'online' && '💻 Online'}
                {eventType === 'hybrid' && '🔄 Hybrid'}
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="p-6 md:p-8 flex flex-col justify-center">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
                {title}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground line-clamp-2">
                {description}
              </p>
            </div>

            {/* Event Details */}
            <div className="flex flex-col gap-3 pt-2">
              {/* Date */}
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">
                    {formatDate(start)}
                  </span>
                  {end && (
                    <span className="text-sm text-muted-foreground">
                      to {formatDate(end)}
                    </span>
                  )}
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-foreground">
                  {formatTime(start)}
                  {end && ` - ${formatTime(end)}`}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">{location}</span>
              </div>
            </div>

            {/* CTA Badge */}
            <div className="pt-2">
              <div className="inline-flex items-center text-sm font-medium text-primary">
                View event details →
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
