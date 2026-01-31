import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { navItems, type NavItemId, type Ticket } from './data'

interface TicketListPanelProps {
  tickets: Ticket[]
  selectedTicketId: string | null
  onTicketSelect: (ticketId: string) => void
  activeNavItem: NavItemId
}

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'
  )
}

export function TicketListPanel({
  tickets,
  selectedTicketId,
  onTicketSelect,
  activeNavItem,
}: TicketListPanelProps) {
  const navItem = navItems.find((item) => item.id === activeNavItem)
  const title = navItem?.label ?? 'Inbox'

  return (
    <div className="flex h-full w-1/4 max-w-[320px] min-w-[240px] shrink-0 flex-col overflow-hidden border-r bg-background">
      <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="truncate text-base font-medium text-foreground">Your {title}</div>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        {tickets.map((ticket) => {
          const isSelected = selectedTicketId === ticket.id
          return (
            <button
              type="button"
              key={ticket.id}
              onClick={() => onTicketSelect(ticket.id)}
              className={cn(
                'w-full border-b p-4 text-left text-sm leading-tight last:border-b-0 hover:bg-muted/50',
                !ticket.read && 'bg-muted/30',
                isSelected && 'bg-muted',
              )}
            >
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn('truncate text-sm', !ticket.read && 'font-semibold')}>
                    {ticket.subject}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
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
    </div>
  )
}
