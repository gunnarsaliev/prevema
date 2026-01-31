import { Badge } from '@/components/ui/badge'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { MessageSquare, User as UserIcon } from 'lucide-react'
import { mockCustomers, navItems, type NavItemId, type Ticket } from './data'

interface TicketCommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tickets: Ticket[]
  onTicketSelect: (ticketId: string) => void
  onNavItemSelect: (navItemId: NavItemId) => void
}

export function TicketCommandPalette({
  open,
  onOpenChange,
  tickets,
  onTicketSelect,
  onNavItemSelect,
}: TicketCommandPaletteProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search tickets, customers, or navigate..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Tickets">
          {tickets.slice(0, 5).map((ticket) => (
            <CommandItem
              key={ticket.id}
              onSelect={() => {
                onTicketSelect(ticket.id)
                onOpenChange(false)
              }}
            >
              <MessageSquare className="mr-2 size-4" />
              <span className="truncate">{ticket.subject}</span>
              <span className="ml-auto text-xs text-muted-foreground">{ticket.timestamp}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Customers">
          {mockCustomers.map((customer) => (
            <CommandItem key={customer.id}>
              <UserIcon className="mr-2 size-4" />
              <span>{customer.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">{customer.company}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <CommandItem
                key={item.id}
                onSelect={() => {
                  onNavItemSelect(item.id)
                  onOpenChange(false)
                }}
              >
                <Icon className="mr-2 size-4" />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.count}
                  </Badge>
                )}
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
