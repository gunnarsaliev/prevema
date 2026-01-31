import { MessageSquare } from 'lucide-react'

export function EmptyTicketState() {
  return (
    <div className="flex flex-1 items-center justify-center text-muted-foreground">
      <div className="text-center">
        <MessageSquare className="mx-auto size-12 opacity-50" />
        <p className="mt-2 text-sm">Select a ticket to view</p>
      </div>
    </div>
  )
}
