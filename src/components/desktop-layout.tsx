import { MessageSquare, PanelRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarInset } from '@/components/ui/sidebar'
import { TicketListPanel } from '@/components/layout/guest-list'
import { TicketStatusDropdown } from './ticket-status-dropdown'
import { EmptyTicketState } from './empty-ticket-state'
import { MessageBubble } from '@/components/layout/message-bubble'
import { ReplyComposer } from '@/components/layout/reply-composer'
import { InboxAgentPanel } from '@/components/layout/inbox-agent-panel'
import { previousConversations, type NavItemId, type Ticket } from '@/components/layout/data'

interface DesktopLayoutProps {
  tickets: Ticket[]
  selectedTicket: Ticket | null
  selectedTicketId: string | null
  activeNavItem: NavItemId
  isAgentPanelOpen: boolean
  onTicketSelect: (ticketId: string) => void
  onAgentPanelToggle: () => void
}

export function DesktopLayout({
  tickets,
  selectedTicket,
  selectedTicketId,
  activeNavItem,
  isAgentPanelOpen,
  onTicketSelect,
  onAgentPanelToggle,
}: DesktopLayoutProps) {
  return (
    <SidebarInset className="hidden min-h-0 overflow-hidden md:flex h-full">
      <div className="flex h-full w-full">
        <TicketListPanel
          tickets={tickets}
          selectedTicketId={selectedTicketId}
          onTicketSelect={onTicketSelect}
          activeNavItem={activeNavItem}
        />

        <div
          className={`flex min-w-0 flex-col overflow-hidden transition-all duration-200 ${
            isAgentPanelOpen ? 'flex-1' : 'flex-1'
          }`}
        >
          {selectedTicket ? (
            <>
              <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="size-5" />
                  <span className="font-medium">Re: {selectedTicket.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TicketStatusDropdown ticket={selectedTicket} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={onAgentPanelToggle}
                  >
                    <PanelRight className={`size-4 ${isAgentPanelOpen ? 'text-primary' : ''}`} />
                  </Button>
                </div>
              </header>

              <ScrollArea className="min-h-0 flex-1">
                <div
                  className={`px-6 py-6 transition-all duration-200 ${
                    isAgentPanelOpen ? 'lg:px-10' : 'lg:px-10 xl:px-16'
                  }`}
                >
                  <div
                    className={`mx-auto space-y-8 transition-all duration-200 ${
                      isAgentPanelOpen ? 'max-w-3xl' : 'max-w-4xl xl:max-w-5xl'
                    }`}
                  >
                    {selectedTicket.messages.map((message: any) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                  </div>
                </div>
              </ScrollArea>

              <ReplyComposer
                recipientEmail={selectedTicket.customer.email}
                respondingUser={selectedTicket.respondingUser}
                isAgentPanelOpen={isAgentPanelOpen}
              />
            </>
          ) : (
            <EmptyTicketState />
          )}
        </div>

        {isAgentPanelOpen && selectedTicket && (
          <InboxAgentPanel ticket={selectedTicket} previousConversations={previousConversations} />
        )}
      </div>
    </SidebarInset>
  )
}
