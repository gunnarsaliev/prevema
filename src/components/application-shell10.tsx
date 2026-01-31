'use client'

import { LogoImage } from '@/components/shadcnblocks/logo'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarProvider } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { AppSidebar } from './layout/app-sidebar'
import { TicketCommandPalette } from './layout/ticket-command-palette'
import { navItems } from './layout/data'
import { useApplicationState } from '@/hooks/useApplicationState'
import { DesktopLayout } from './desktop-layout'
import { MobileNavigation } from './mobile-navigation'
import { MobileTicketList } from './mobile-ticket-list'
import { MobileConversationDrawer } from './mobile-conversation-drawer'
import { MobileAgentDrawer } from './mobile-agent-drawer'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'

export function ApplicationShell10() {
  const {
    activeNavItem,
    selectedTicketId,
    tickets,
    isAgentPanelOpen,
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
    setIsAgentPanelOpen,
    handleTicketSelect,
  } = useApplicationState()

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar
        activeNavItem={activeNavItem}
        onNavItemChange={setActiveNavItem}
        onSearchClick={() => setIsCommandOpen(true)}
        className="hidden md:flex"
      />

      <div className="flex h-full flex-col overflow-hidden pb-16 md:hidden">
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <LogoImage
              src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/block-1.svg"
              alt="Shadcnblocks"
              className="h-8 w-8 rounded-sm bg-muted p-1"
            />
            <span className="font-semibold">
              Your {navItems.find((item) => item.id === activeNavItem)?.label ?? 'Inbox'}
            </span>
          </div>
        </div>
        <MobileTicketList
          tickets={tickets}
          selectedTicketId={selectedTicketId}
          activeNavItem={activeNavItem}
          onTicketSelect={handleTicketSelect}
        />
      </div>

      <DesktopLayout
        tickets={tickets}
        selectedTicket={selectedTicket}
        selectedTicketId={selectedTicketId}
        activeNavItem={activeNavItem}
        isAgentPanelOpen={isAgentPanelOpen}
        onTicketSelect={handleTicketSelect}
        onAgentPanelToggle={() => setIsAgentPanelOpen(!isAgentPanelOpen)}
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

      <MobileNavigation
        activeNavItem={activeNavItem}
        onNavItemChange={setActiveNavItem}
        onMobileTicketListOpen={() => setIsMobileTicketListOpen(true)}
        onCommandOpen={() => setIsCommandOpen(true)}
      />
    </SidebarProvider>
  )
}
