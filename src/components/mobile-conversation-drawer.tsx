import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from '@/components/layout/message-bubble'
import { ReplyComposer } from '@/components/layout/reply-composer'
import { type Ticket } from '@/components/layout/data'

interface MobileConversationDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedTicket: Ticket | null
  onMobileAgentOpen: () => void
}

export function MobileConversationDrawer({
  isOpen,
  onOpenChange,
  selectedTicket,
  onMobileAgentOpen,
}: MobileConversationDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} dismissible>
      <DrawerContent className="h-[90vh] overflow-hidden md:hidden">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Conversation</DrawerTitle>
        </DrawerHeader>
        {selectedTicket && (
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
              <span className="line-clamp-1 font-medium">{selectedTicket.subject}</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                onClick={onMobileAgentOpen}
              >
                <Sparkles className="size-4" />
              </Button>
            </div>
            <ScrollArea className="min-h-0 flex-1">
              <div className="space-y-6 p-4">
                {selectedTicket.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
            </ScrollArea>
            <div className="shrink-0">
              <ReplyComposer
                recipientEmail={selectedTicket.customer.email}
                respondingUser={selectedTicket.respondingUser}
              />
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}
