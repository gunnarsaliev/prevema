'use client'

import * as React from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { DubSidebarProvider, useDubSidebar } from './dub-sidebar-provider'
import { DubSidebarRail } from './dub-sidebar-rail'
import { DubSidebarPanel } from './dub-sidebar-panel'
import type { DubSidebarConfig } from './types'

const SIDEBAR_WIDTH = 304
const SIDEBAR_RAIL_WIDTH = 64

interface DubSidebarLayoutProps {
  config: DubSidebarConfig
  activeModuleId: string
  onModuleChange: (moduleId: string) => void
  children: React.ReactNode
  topSlot?: React.ReactNode
  notificationBellSlot?: React.ReactNode
  userMenuSlot?: React.ReactNode
  logoSrc?: string
  logoAlt?: string
  customPanelContent?: React.ReactNode
  hideTopbar?: boolean
}

function DubSidebarContent({
  config,
  activeModuleId,
  onModuleChange,
  children,
  topSlot,
  notificationBellSlot,
  userMenuSlot,
  logoSrc,
  logoAlt,
  customPanelContent,
  hideTopbar,
}: DubSidebarLayoutProps) {
  const { isPanelOpen } = useDubSidebar()

  const activeModule = React.useMemo(
    () => config.modules.find((m) => m.id === activeModuleId) ?? config.modules[0],
    [config.modules, activeModuleId],
  )

  const hasContent = activeModule !== null
  const showPanel = hasContent && isPanelOpen

  return (
    <div
      className="flex h-screen flex-col overflow-hidden bg-sidebar dark:bg-sidebar"
      style={
        {
          '--shell-panel': 'color-mix(in oklch, var(--background) 94%, var(--foreground))',
          '--shell-chrome': 'color-mix(in oklch, var(--background) 88%, var(--foreground))',
        } as React.CSSProperties
      }
    >
      {/* Main Layout Grid */}
      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <TooltipProvider delayDuration={0}>
          <aside
            id="dub-sidebar"
            className={cn(
              'sticky top-0 z-40 h-screen transition-[width,filter,opacity] duration-300',
              '[&.modal-blur]:blur-sm [&.modal-blur]:opacity-50',
            )}
            style={
              {
                width: showPanel ? SIDEBAR_WIDTH : SIDEBAR_RAIL_WIDTH,
                '--sidebar-width': `${showPanel ? SIDEBAR_WIDTH : SIDEBAR_RAIL_WIDTH}px`,
                '--sidebar-rail-width': `${SIDEBAR_RAIL_WIDTH}px`,
              } as React.CSSProperties
            }
            data-panel-state={isPanelOpen ? 'expanded' : 'collapsed'}
            data-has-content={hasContent}
          >
            <nav className="grid size-full grid-cols-[64px_1fr]">
              {/* Rail */}
              <DubSidebarRail
                railIcons={config.railIcons}
                activeModuleId={activeModuleId}
                onModuleChange={onModuleChange}
                logoSrc={logoSrc}
                logoAlt={logoAlt}
                notificationBellSlot={notificationBellSlot}
                userMenuSlot={userMenuSlot}
              />

              {/* Panel */}
              <div
                className={cn(
                  'relative size-full overflow-hidden py-2 transition-opacity duration-300',
                  !showPanel && 'opacity-0',
                )}
              >
                <div
                  className={cn(
                    'top-0 left-0 flex size-full flex-col transition-[opacity,transform] duration-300',
                    showPanel
                      ? 'relative opacity-100'
                      : 'pointer-events-none absolute opacity-0 -translate-x-full',
                  )}
                  aria-hidden={!showPanel}
                  inert={!showPanel ? true : undefined}
                >
                  {activeModule && (
                    <DubSidebarPanel
                      module={activeModule}
                      utilities={config.utilities}
                      topSlot={topSlot}
                      customContent={customPanelContent}
                    />
                  )}
                </div>
              </div>
            </nav>
          </aside>
        </TooltipProvider>

        {/* Content Area */}
        <div className="flex min-h-0 flex-1 flex-col bg-background md:bg-sidebar dark:md:bg-sidebar md:py-2 md:pr-2">
          <div className="relative flex min-h-0 flex-1 flex-col">
            {/* Corner fills for visual effect */}
            {/* <div
              className={cn(
                'absolute top-0 -left-2 z-0 hidden h-3 w-5 bg-[var(--shell-panel)] transition-opacity duration-300 md:block',
                showPanel ? 'opacity-100' : 'opacity-0',
              )}
            /> */}
            <div
              className={cn(
                'absolute bottom-0 -left-2 z-0 hidden h-3 w-5 bg-[var(--shell-panel)] transition-opacity duration-300 md:block',
                showPanel ? 'opacity-100' : 'opacity-0',
              )}
            />

            {/* Main Content */}
            <main className="z-10 flex min-h-0 flex-1 flex-col overflow-auto bg-background md:rounded-xl">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DubSidebarLayout(props: DubSidebarLayoutProps) {
  return (
    <DubSidebarProvider>
      <DubSidebarContent {...props} />
    </DubSidebarProvider>
  )
}
