'use client'

import { LogoImage } from '@/components/shadcnblocks/logo'
import { MobileNavigation } from '@/components/mobile-navigation'
import { MobileTicketList } from '@/components/mobile-ticket-list'
import { MobileConversationDrawer } from '@/components/mobile-conversation-drawer'
import { MobileAgentDrawer } from '@/components/mobile-agent-drawer'
import { TicketCommandPalette } from '@/components/layout/ticket-command-palette'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { useApplicationState } from '@/hooks/useApplicationState'
import { navItems } from '@/components/layout/data'
import { MobileNavUser } from '@/components/layout/avatar-menu'
import { ReactNode } from 'react'

interface MobileDashLayoutProps {
  children: ReactNode
  showTicketList?: boolean
}

export function MobileDashLayout({ children, showTicketList = false }: MobileDashLayoutProps) {
  const {
    activeNavItem,
    selectedTicketId,
    tickets,
    isCommandOpen,
    isMobileTicketListOpen,
    isMobileConversationOpen,
    isMobileAgentOpen,
    selectedTicket,
    setActiveNavItem,
    setIsCommandOpen,
    setIsMobileTicketListOpen,
    setIsMobileConversationOpen,
    setIsMobileAgentOpen,
    handleTicketSelect,
  } = useApplicationState()

  return (
    <>
      {/* Mobile Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b px-4 md:hidden">
        <div className="flex items-center gap-2">
          <LogoImage
            src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/block-1.svg"
            alt="Shadcnblocks"
            className="h-8 w-8 rounded-sm bg-muted p-1"
          />
          <span className="font-semibold">
            {navItems.find((item) => item.id === activeNavItem)?.label ?? 'Dashboard'}
          </span>
        </div>
        <MobileNavUser
          user={{
            name: 'John Doe',
            email: 'john@example.com',
            avatar: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp',
          }}
        />
      </div>

      {/* Mobile Content */}
      <div className="flex flex-1 flex-col overflow-hidden pb-16 md:hidden">
        {showTicketList ? (
          <MobileTicketList
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            activeNavItem={activeNavItem}
            onTicketSelect={handleTicketSelect}
          />
        ) : (
          <div className="flex-1 overflow-auto">{children}</div>
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation
        activeNavItem={activeNavItem}
        onNavItemChange={setActiveNavItem}
        onMobileTicketListOpen={() => setIsMobileTicketListOpen(true)}
        onCommandOpen={() => setIsCommandOpen(true)}
      />

      {/* Mobile Drawers */}
      <Drawer open={isMobileTicketListOpen} onOpenChange={setIsMobileTicketListOpen} dismissible>
        <DrawerContent className="h-[85vh] md:hidden">
          <DrawerHeader>
            <DrawerTitle>Tickets</DrawerTitle>
          </DrawerHeader>
          <MobileTicketList
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            activeNavItem={activeNavItem}
            onTicketSelect={handleTicketSelect}
            onClose={() => setIsMobileTicketListOpen(false)}
          />
        </DrawerContent>
      </Drawer>

      <MobileConversationDrawer
        isOpen={isMobileConversationOpen}
        onOpenChange={setIsMobileConversationOpen}
        selectedTicket={selectedTicket}
        onMobileAgentOpen={() => setIsMobileAgentOpen(true)}
      />

      <MobileAgentDrawer
        isOpen={isMobileAgentOpen}
        onOpenChange={setIsMobileAgentOpen}
        selectedTicket={selectedTicket}
      />

      <TicketCommandPalette
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
        tickets={tickets}
        onTicketSelect={handleTicketSelect}
        onNavItemSelect={(navItemId) => {
          setActiveNavItem(navItemId)
        }}
      />
    </>
  )
}
