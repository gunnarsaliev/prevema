import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Sparkles } from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getInitials } from '@/utils/ticket-helpers'
import { type Ticket } from '@/components/layout/data'

interface MobileAgentDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedTicket: Ticket | null
}

export function MobileAgentDrawer({ isOpen, onOpenChange, selectedTicket }: MobileAgentDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} dismissible>
      <DrawerContent className="h-[85vh] md:hidden">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Sparkles className="size-4" />
            Inbox Agent
          </DrawerTitle>
        </DrawerHeader>
        {selectedTicket && (
          <ScrollArea className="min-h-0 flex-1 px-4 pb-6">
            <div className="space-y-6">
              <section className="space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage
                      src={selectedTicket.customer.avatar}
                      alt={selectedTicket.customer.name}
                    />
                    <AvatarFallback>{getInitials(selectedTicket.customer.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{selectedTicket.customer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedTicket.customer.role}, {selectedTicket.customer.company}
                    </div>
                    {selectedTicket.customer.isHighValue && (
                      <Badge
                        variant="outline"
                        className="mt-1.5 border-amber-500 bg-amber-50 text-amber-700"
                      >
                        High value
                      </Badge>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                <p>Customer seems calm, but has potential to become frustrated.</p>
              </section>

              <section className="space-y-3">
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <p>Hi Sarah, just following up...</p>
                </div>
                <Button variant="outline" className="w-full gap-2">
                  <Clock className="size-4" />
                  Schedule follow up
                </Button>
              </section>
            </div>
          </ScrollArea>
        )}
      </DrawerContent>
    </Drawer>
  )
}
