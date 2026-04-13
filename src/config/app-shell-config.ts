import { Home, Calendar, Users, Palette, Image, Handshake } from 'lucide-react'
import type { SidebarModule } from '@/components/layout/application-shell'

export const appShellModules: SidebarModule[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dash' },
  { id: 'events', label: 'Events', icon: Calendar, path: '/dash/events' },
  { id: 'guests', label: 'Guests', icon: Users, path: '/dash/participants' },
  { id: 'partners', label: 'Partners', icon: Handshake, path: '/dash/partners' },
  { id: 'assets', label: 'Assets', icon: Palette, path: '/dash/assets' },
  { id: 'image-generator', label: 'Image Generator', icon: Image, path: '/dash/image-generator' },
]
