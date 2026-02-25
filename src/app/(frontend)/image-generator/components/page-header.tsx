'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Tab {
  id: string
  label: string
  badge?: number
  active?: boolean
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
  tabs?: Tab[]
  activeTab?: string
  onTabChange?: (tabId: string) => void
  avatars?: string[]
  extraCount?: number
  className?: string
}

function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  tabs,
  activeTab,
  onTabChange,
  avatars = [],
  extraCount,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('border-b border-border bg-background', className)}>
      {/* Top section with title and action */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {actionLabel && (
            <Button onClick={onAction} className="bg-yellow-500 hover:bg-yellow-400">
              {actionLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs section */}
      {tabs && tabs.length > 0 && (
        <div className="px-6 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-t-md transition-colors relative',
                  activeTab === tab.id
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                )}
              >
                <span className="flex items-center gap-2">
                  {tab.label}
                  {tab.badge !== undefined && (
                    <span className="bg-muted-foreground/20 text-muted-foreground text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {tab.badge}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* Avatar group */}
          {avatars.length > 0 && (
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {avatars.slice(0, 3).map((avatar, index) => (
                  <img
                    key={index}
                    src={avatar}
                    alt=""
                    className="w-8 h-8 rounded-full border-2 border-background object-cover"
                  />
                ))}
              </div>
              {extraCount && extraCount > 0 && (
                <span className="ml-2 text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  +{extraCount}
                </span>
              )}
              <button className="ml-2 w-8 h-8 rounded-full border border-dashed border-muted-foreground/50 flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"></button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export { PageHeader }
export type { PageHeaderProps, Tab }
