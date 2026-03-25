import { format } from 'date-fns'
import type { Event, Media } from '@/payload-types'

/**
 * Extract day number from event start date
 */
export function getEventDay(startDate: string): number {
  return parseInt(format(new Date(startDate), 'd'))
}

/**
 * Extract month abbreviation from event start date
 */
export function getEventMonth(startDate: string): string {
  return format(new Date(startDate), 'MMM')
}

/**
 * Get event location string with intelligent fallback
 */
export function getEventLocation(event: Event): string {
  // Prefer 'where' field (more descriptive), then address, then fallback
  if (event.where) return event.where
  if (event.address) return event.address
  if (event.eventType === 'online') return 'Online'
  return 'Location TBA'
}

/**
 * Get event description with fallback to 'what' field
 */
export function getEventDescription(event: Event): string {
  if (event.description) return event.description
  if (event.what) return event.what
  return 'No description available'
}

/**
 * Resolve image URL from Media object or provide placeholder
 */
export function getEventImageUrl(image: Event['image']): string | null {
  if (image && typeof image === 'object' && 'url' in image) {
    return (image as Media).url || null
  }
  return null
}

/**
 * Get starting price text (placeholder until pricing is implemented)
 */
export function getEventPrice(event: Event): string {
  // This is a placeholder - in the future, you might want to add pricing
  // information to your Event model and query participant roles for pricing
  return 'See details'
}
