import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { getInitials } from '@/utils/ticket-helpers'
import { type Ticket } from '@/components/layout/data'

interface MobileTicketListProps {
  tickets: Ticket[]
  selectedTicketId: string | null
  activeNavItem: string
  onTicketSelect: (ticketId: string) => void
  onClose?: () => void
}

export function MobileTicketList({
  tickets,
  selectedTicketId,
  activeNavItem,
  onTicketSelect,
  onClose,
}: MobileTicketListProps) {
  const handleTicketClick = (ticketId: string) => {
    onTicketSelect(ticketId)
    onClose?.()
  }

  return (
    <ScrollArea className="min-h-0 flex-1 px-4">
      {tickets.map((ticket) => {
        const isSelected = selectedTicketId === ticket.id
        return (
          <button
            type="button"
            key={ticket.id}
            onClick={() => handleTicketClick(ticket.id)}
            className={cn(
              'w-full border-b p-4 text-left text-sm',
              !ticket.read && 'bg-muted/30',
            )}
          >
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={cn('truncate', !ticket.read && 'font-semibold')}>
                  {ticket.subject}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {ticket.timestamp}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {ticket.preview}
              </p>
              {ticket.respondingUser && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Avatar className="size-4">
                    <AvatarImage
                      src={ticket.respondingUser.avatar}
                      alt={ticket.respondingUser.name}
                    />
                    <AvatarFallback className="text-[8px]">
                      {getInitials(ticket.respondingUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{ticket.respondingUser.name.split(' ')[0]} is responding...</span>
                </div>
              )}
            </div>
          </button>
        )
      })}
    </ScrollArea>
  )
}
