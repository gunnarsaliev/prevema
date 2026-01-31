import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getStatusColor } from '@/utils/ticket-helpers'
import { type Ticket } from '@/components/layout/data'

interface TicketStatusDropdownProps {
  ticket: Ticket
}

export function TicketStatusDropdown({ ticket }: TicketStatusDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <span
            className={cn(
              'size-2 rounded-full',
              getStatusColor(ticket.status),
            )}
          />
          <span className="capitalize">{ticket.status}</span>
          <ChevronDown className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Active</DropdownMenuItem>
        <DropdownMenuItem>Pending</DropdownMenuItem>
        <DropdownMenuItem>Closed</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
