import { Inbox, MailOpen, MoreHorizontal, Search, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type NavItemId } from '@/components/layout/data'

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
  const navItems = [
    {
      id: 'inbox' as NavItemId,
      label: 'Inbox',
      icon: Inbox,
      onClick: () => {
        onNavItemChange('inbox')
        onMobileTicketListOpen()
      },
    },
    {
      id: 'unassigned' as NavItemId,
      label: 'Unassigned',
      icon: MailOpen,
      onClick: () => {
        onNavItemChange('unassigned')
        onMobileTicketListOpen()
      },
    },
    {
      id: 'assigned' as NavItemId,
      label: 'Assigned',
      icon: UserCheck,
      onClick: () => {
        onNavItemChange('assigned')
        onMobileTicketListOpen()
      },
    },
    {
      id: 'search' as NavItemId,
      label: 'Search',
      icon: Search,
      onClick: () => onCommandOpen(),
    },
    {
      id: 'more' as NavItemId,
      label: 'More',
      icon: MoreHorizontal,
      onClick: () => {},
    },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeNavItem === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
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
