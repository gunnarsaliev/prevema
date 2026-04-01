import type { LucideIcon } from 'lucide-react'

export interface NavItemConfig {
  id: string
  label: string
  icon: LucideIcon
  path: string
}

export interface NavSectionConfig {
  id: string
  label?: string
  items: NavItemConfig[]
}

export interface NavModuleConfig {
  id: string
  label: string
  icon: LucideIcon
  defaultPath: string
  sections: NavSectionConfig[]
}

export interface RailIconConfig {
  moduleId: string
  label: string
  icon: LucideIcon
  defaultPath: string
}

export interface DubSidebarConfig {
  railIcons: RailIconConfig[]
  modules: NavModuleConfig[]
  utilities?: NavItemConfig[]
}

export interface SidebarContextValue {
  isPanelOpen: boolean
  setPanelOpen: (open: boolean) => void
  togglePanel: () => void
  panelState: 'expanded' | 'collapsed'
}
