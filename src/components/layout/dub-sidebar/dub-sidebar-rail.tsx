'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PanelLeft, PanelLeftClose } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useDubSidebar } from './dub-sidebar-provider'
import type { RailIconConfig } from './types'

interface SidebarRailProps {
  railIcons: RailIconConfig[]
  activeModuleId: string
  onModuleChange: (moduleId: string) => void
  logoSrc?: string
  logoAlt?: string
  userMenuSlot?: React.ReactNode
}

export function DubSidebarRail({
  railIcons,
  activeModuleId,
  onModuleChange,
  logoSrc = '/logo.png',
  logoAlt = 'Logo',
  userMenuSlot,
}: SidebarRailProps) {
  const { isPanelOpen, togglePanel } = useDubSidebar()

  return (
    <div className="flex h-full w-16 flex-col items-center justify-between bg-sidebar-accent dark:bg-sidebar">
      <div className="flex flex-col items-center gap-3 p-2">
        {/* Logo */}
        <div className="pt-2 pb-1">
          <Link
            href="/dash"
            className="flex items-center justify-center rounded-lg transition-opacity outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="relative w-10 h-10 flex items-center justify-center">
              <Image
                src={logoSrc}
                alt={logoAlt}
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Rail Icons */}
        <div className="flex flex-col items-center gap-3">
          {railIcons.map((item) => {
            const isActive = item.moduleId === activeModuleId
            const Icon = item.icon
            return (
              <Tooltip key={item.moduleId}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onModuleChange(item.moduleId)}
                    aria-label={item.label}
                    className={cn(
                      'relative flex size-11 items-center justify-center rounded-lg transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isActive
                        ? 'bg-background text-foreground'
                        : 'text-muted-foreground hover:bg-accent active:bg-accent/80',
                    )}
                  >
                    <Icon className="size-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center gap-3 py-3">
        {/* Toggle Panel Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-11 text-muted-foreground hover:bg-accent active:bg-accent/80"
              onClick={togglePanel}
              aria-label={isPanelOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              aria-expanded={isPanelOpen}
            >
              {isPanelOpen ? (
                <PanelLeftClose className="size-4" />
              ) : (
                <PanelLeft className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            <span>{isPanelOpen ? 'Collapse' : 'Expand'}</span>
            <kbd className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              ⌘B
            </kbd>
          </TooltipContent>
        </Tooltip>

        {/* User Menu Slot */}
        {userMenuSlot && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex size-11 items-center justify-center">{userMenuSlot}</div>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              Account
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}
