import type { LucideIcon } from 'lucide-react'

export interface SidebarModule {
  id: string
  label: string
  icon: LucideIcon
  path?: string
}

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  path: string
  badge?: number | string
}

export interface NavSection {
  id: string
  label?: string
  items: NavItem[]
}

export interface ApplicationShellProps {
  children: React.ReactNode
  modules: SidebarModule[]
  activeModuleId: string
  onModuleChange: (moduleId: string) => void
  user?: {
    name: string
    email: string
    avatar?: string
  }
  logo?: {
    src: string
    alt: string
  }
  headerContent?: React.ReactNode
  mobileNavigation?: boolean
  secondarySidebar?: React.ReactNode
}
