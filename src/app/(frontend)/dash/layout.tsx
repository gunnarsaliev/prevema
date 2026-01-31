'use client'

import { AppSidebar } from '@/components/layout/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { navItems, type NavItemId } from '@/components/layout/data'

export default function DashLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [activeBucket, setActiveBucket] = useState<
    'support' | 'bugs' | 'features' | 'internal' | null
  >(null)

  // Detect active nav item from current pathname
  const activeNavItem = navItems.find((item) => item.url === pathname)?.id || 'dashboard'

  return (
    <SidebarProvider>
      <AppSidebar
        activeNavItem={activeNavItem as NavItemId}
        activeBucket={activeBucket}
        onNavItemChange={() => {}} // Navigation handled by Next.js Link
        onBucketChange={setActiveBucket}
        onSearchClick={() => console.log('Search clicked')}
      />
      {children}
    </SidebarProvider>
  )
}
