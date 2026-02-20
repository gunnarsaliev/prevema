'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, Link2, Mail, Settings, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const sections = [
  { id: 'personal', label: 'Personal Info', icon: User, href: '/dash/settings/personal' },
  { id: 'contact', label: 'Contact', icon: Mail, href: '/dash/settings/contact' },
  { id: 'social', label: 'Social Links', icon: Link2, href: '/dash/settings/social' },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: Settings,
    href: '/dash/settings/preferences',
  },
  {
    id: 'organization',
    label: 'Organization',
    icon: Building2,
    href: '/dash/settings/organization',
  },
]

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {sections.map((section) => {
        const Icon = section.icon
        const isActive = pathname === section.href
        return (
          <Link
            key={section.id}
            href={section.href}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
            {section.label}
          </Link>
        )
      })}
    </nav>
  )
}
