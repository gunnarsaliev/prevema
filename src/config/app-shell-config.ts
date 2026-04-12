import { Home, Calendar, Users, Palette, Settings, Mail } from 'lucide-react'
import type { SidebarModule } from '@/components/layout/application-shell'

export const appShellModules: SidebarModule[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dash' },
  { id: 'events', label: 'Events', icon: Calendar, path: '/dash/events' },
  { id: 'emails', label: 'Emails', icon: Mail, path: '/demo/emails' },
  { id: 'guests', label: 'Guests', icon: Users, path: '/dash/participants' },
  { id: 'assets', label: 'Assets', icon: Palette, path: '/dash/assets' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/dash/settings' },
]
