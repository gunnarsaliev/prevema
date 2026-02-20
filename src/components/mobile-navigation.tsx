import { BarChart3, Inbox, MailOpen, MoreHorizontal, Palette, Search } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { navItems, type NavItemId } from '@/components/layout/data'

interface MobileNavigationProps {
  activeNavItem: NavItemId
  onNavItemChange: (navItemId: NavItemId) => void
  onMobileTicketListOpen: () => void
  onCommandOpen: () => void
}

export function MobileNavigation({
  activeNavItem,
  onNavItemChange,
  onMobileTicketListOpen,
  onCommandOpen,
}: MobileNavigationProps) {
  const pathname = usePathname()

  const mobileNavItems = [
    {
      id: 'dashboard' as NavItemId,
      label: 'Dashboard',
      icon: Inbox,
      url: '/dash',
    },
    // {
    //   id: 'messages' as NavItemId,
    //   label: 'Messages',
    //   icon: MailOpen,
    //   url: '/dash/messages',
    // },
    {
      id: 'analytics' as NavItemId,
      label: 'Analytics',
      icon: BarChart3,
      url: '/dash/analytics',
    },
    {
      id: 'graphics' as NavItemId,
      label: 'Graphics',
      icon: Palette,
      url: '/dash/graphics',
    },
    {
      id: 'search' as NavItemId,
      label: 'Search',
      icon: Search,
      specialAction: 'openCommand' as const,
    },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {mobileNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.url

          const handleClick = () => {
            if (item.specialAction === 'openCommand') {
              onCommandOpen()
            }
            // Navigation is handled by Next.js Link
          }

          if (item.url) {
            return (
              <Link
                key={item.id}
                href={item.url}
                onClick={handleClick}
                className={cn(
                  'flex flex-col items-center gap-1 py-2 text-xs',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
              </Link>
            )
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={handleClick}
              className={cn(
                'flex flex-col items-center gap-1 py-2 text-xs',
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
