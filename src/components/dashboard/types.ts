export type Guest = {
  name: string
  avatar?: string
  initials: string
}

export type Booking = {
  id: string
  guestName: string
  roomNumber: string
  roomType: string
  time: string
  guests: Guest[]
  guestCount: number
  source: 'Direct' | 'Booking.com' | 'Expedia' | 'Walk-in'
  status: string
  statusColor: string
  nights: number
  specialRequests?: string
  href?: string
}

export type RecentArrivalItem = {
  id: string | number
  name: string
  time: string
  initials: string
  avatar?: string
  subtitle?: string
  href?: string
}

export type RecentPartnerItem = {
  id: string | number
  companyName: string
  time: string
  initials: string
  logoUrl?: string
  eventName?: string
  href?: string
}

export type RegistrationDayData = {
  date: string
  participants: number
  partners: number
}

export type StatItem = {
  title: string
  value: number
  format: 'number' | 'currency' | 'percent'
  trendValue?: number
  footerLabel?: string
  footerSubtext?: string
}
