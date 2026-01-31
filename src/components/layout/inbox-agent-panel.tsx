import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock, Sparkles } from 'lucide-react'
import { type PreviousConversation, type Ticket } from './data'

interface InboxAgentPanelProps {
  ticket: Ticket
  previousConversations: PreviousConversation[]
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

export function InboxAgentPanel({ ticket, previousConversations }: InboxAgentPanelProps) {
  const customer = ticket.customer

  return (
    <div className="flex h-full w-1/4 max-w-[360px] min-w-[280px] shrink-0 flex-col overflow-hidden border-l bg-background">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <Sparkles className="size-4" />
        <span className="font-semibold">Inbox Agent</span>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-6 p-4">
          <section className="space-y-3">
            <div className="flex items-start gap-3">
              <Avatar className="size-10 shrink-0">
                <AvatarImage src={customer.avatar} alt={customer.name} />
                <AvatarFallback className="bg-primary font-medium text-primary-foreground">
                  {getInitials(customer.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{customer.name}</div>
                <div className="text-sm text-muted-foreground">
                  {customer.role}, {customer.company}
                </div>
                {customer.isHighValue && (
                  <Badge
                    variant="outline"
                    className="mt-1.5 border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                  >
                    High value customer
                  </Badge>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="text-muted-foreground">
                Customer seems calm, but has potential to become frustrated. Likely non-technical as
                she hasn&apos;t read the documentation guide on the Slack integration.
              </p>
              <p className="mt-3 text-muted-foreground">
                Peter replied with the necessary details to fix her issue, but she has yet to
                confirm whether or not her issue has been resolved.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-sm text-muted-foreground">
              If the customer doesn&apos;t reply within the next 12 hours a follow up should be
              sent:
            </p>
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <p>
                Hi Sarah, just following up to see if you managed to get the integration working?
              </p>
              <p className="mt-2">
                If you&apos;re still struggling, I&apos;d be happy to schedule a call to make sure
                we can get you up and running.
              </p>
              <p className="mt-2">Regards, Peter Lann</p>
            </div>
            <Button variant="outline" className="w-full gap-2">
              <Clock className="size-4" />
              Schedule follow up
            </Button>
          </section>

          <section className="space-y-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground">
              Previous conversations
            </p>
            <div className="space-y-2">
              {previousConversations.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  className="flex w-full items-start justify-between gap-2 rounded-md p-2 text-left hover:bg-muted"
                >
                  <span className="line-clamp-2 text-sm">{conv.subject}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{conv.timestamp}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  )
}
