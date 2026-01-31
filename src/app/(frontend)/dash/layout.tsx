'use client'

import { AppSidebar } from '@/components/layout/app-sidebar'
import { MobileDashLayout } from '@/components/mobile-dash-layout'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation'
import { navItems, type NavItemId } from '@/components/layout/data'

export default function DashLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Detect active nav item from current pathname
  const activeNavItem = navItems.find((item) => item.url === pathname)?.id || 'dashboard'

  // Check if current page is messages (which has its own layout)
  const isMessagesPage = pathname === '/dash/messages'

  // Check if we should show ticket list on mobile (only for messages)
  const showTicketList = isMessagesPage

  return (
    <SidebarProvider className="h-screen">
      {/* Desktop Sidebar - hidden on mobile */}
      <AppSidebar
        activeNavItem={activeNavItem as NavItemId}
        onNavItemChange={() => {}} // Navigation handled by Next.js Link
        onSearchClick={() => console.log('Search clicked')}
        className="hidden md:flex"
      />

      {/* Mobile Layout - only shown on mobile */}
      <div className="md:hidden">
        <MobileDashLayout showTicketList={showTicketList}>{children}</MobileDashLayout>
      </div>

      {/* Desktop Content - only shown on desktop */}
      <div className="hidden md:flex flex-1 h-full">
        <SidebarInset className="flex-1">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  )
}
