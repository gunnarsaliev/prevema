import { type TicketStatus } from '@/components/layout/data'

export function getInitials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'
  )
}

export function getStatusColor(status: TicketStatus) {
  switch (status) {
    case 'active':
      return 'bg-emerald-500'
    case 'pending':
      return 'bg-amber-500'
    case 'closed':
      return 'bg-muted-foreground'
    default:
      return 'bg-muted-foreground'
  }
}
