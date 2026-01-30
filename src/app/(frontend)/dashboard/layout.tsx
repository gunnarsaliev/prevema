'use client'

import { AppSidebar } from '@/components/layout/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { useState } from 'react'

export default function DashLayout({ children }: { children: React.ReactNode }) {
  const [activeNavItem, setActiveNavItem] = useState<
    'inbox' | 'unassigned' | 'assigned' | 'drafts' | 'archived' | 'spam'
  >('inbox')
  const [activeBucket, setActiveBucket] = useState<
    'support' | 'bugs' | 'features' | 'internal' | null
  >(null)

  return (
    <SidebarProvider>
      <AppSidebar
        activeNavItem={activeNavItem}
        activeBucket={activeBucket}
        onNavItemChange={setActiveNavItem}
        onBucketChange={setActiveBucket}
        onSearchClick={() => console.log('Search clicked')}
      />
      {children}
    </SidebarProvider>
  )
}
