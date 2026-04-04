import {
  Home,
  Calendar,
  Users,
  Building2,
  Palette,
  FileText,
  Mail,
  Settings,
  HelpCircle,
  UserCircle,
  Building,
  CreditCard,
} from 'lucide-react'
import type { DubSidebarConfig } from '@/components/layout/dub-sidebar'

export const dashSidebarConfig: DubSidebarConfig = {
  railIcons: [
    { moduleId: 'dashboard', label: 'Dashboard', icon: Home, defaultPath: '/dash' },
    { moduleId: 'events', label: 'Events', icon: Calendar, defaultPath: '/dash/events' },
    { moduleId: 'guests', label: 'Guests', icon: Users, defaultPath: '/dash/participants' },
    { moduleId: 'assets', label: 'Assets', icon: Palette, defaultPath: '/dash/assets' },
    { moduleId: 'settings', label: 'Settings', icon: Settings, defaultPath: '/dash/settings' },
  ],
  modules: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      defaultPath: '/dash',
      sections: [
        {
          id: 'main',
          label: 'Overview',
          description: 'View your event management dashboard',
          items: [
            { id: 'overview', label: 'Overview', icon: Home, path: '/dash' },
            { id: 'analytics', label: 'Analytics', icon: FileText, path: '/dash/analytics' },
          ],
        },
      ],
    },
    {
      id: 'events',
      label: 'Events',
      icon: Calendar,
      defaultPath: '/dash/events',
      sections: [
        {
          id: 'main',
          label: 'Event Management',
          description: 'Create and manage your events',
          items: [
            { id: 'all-events', label: 'All Events', icon: Calendar, path: '/dash/events' },
            { id: 'create-event', label: 'Create Event', icon: Calendar, path: '/dash/events/create' },
          ],
        },
      ],
    },
    {
      id: 'guests',
      label: 'Guests',
      icon: Users,
      defaultPath: '/dash/participants',
      sections: [
        {
          id: 'main',
          label: 'Participants',
          description: 'Manage event attendees and roles',
          items: [
            { id: 'all-participants', label: 'All Participants', icon: Users, path: '/dash/participants' },
            { id: 'participant-roles', label: 'Participant Roles', icon: UserCircle, path: '/dash/participant-roles' },
          ],
        },
        {
          id: 'partners',
          label: 'Partners',
          description: 'Manage sponsors and exhibitors',
          items: [
            { id: 'all-partners', label: 'All Partners', icon: Building2, path: '/dash/partners' },
            { id: 'partner-types', label: 'Partner Types', icon: Building, path: '/dash/partner-types' },
          ],
        },
      ],
    },
    {
      id: 'assets',
      label: 'Assets',
      icon: Palette,
      defaultPath: '/dash/assets',
      sections: [
        {
          id: 'main',
          label: 'Creative Assets',
          description: 'Manage templates and media',
          items: [
            { id: 'all-assets', label: 'All Assets', icon: Palette, path: '/dash/assets' },
            { id: 'email-templates', label: 'Email Templates', icon: Mail, path: '/dash/assets/email-templates' },
            { id: 'image-templates', label: 'Image Templates', icon: FileText, path: '/dash/assets/image-templates' },
          ],
        },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      defaultPath: '/dash/settings',
      sections: [
        {
          id: 'main',
          label: 'Configuration',
          description: 'Manage your account and preferences',
          items: [
            { id: 'personal', label: 'Personal', icon: UserCircle, path: '/dash/settings/personal' },
            { id: 'organization', label: 'Organization', icon: Building, path: '/dash/settings/organization' },
            { id: 'subscription', label: 'Subscription', icon: CreditCard, path: '/dash/settings/subscription' },
            { id: 'preferences', label: 'Preferences', icon: Settings, path: '/dash/settings/preferences' },
          ],
        },
      ],
    },
  ],
  utilities: [
    { id: 'help', label: 'Help & Support', icon: HelpCircle, path: '/dash/help' },
  ],
}
