'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Settings, ChevronRight, ChevronDown, ExternalLink } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { NavModuleConfig, NavItemConfig } from './types'

const SIDEBAR_PANEL_WIDTH = 240

interface SidebarPanelProps {
  module: NavModuleConfig
  utilities?: NavItemConfig[]
  topSlot?: React.ReactNode
  customContent?: React.ReactNode
}

export function DubSidebarPanel({
  module,
  utilities = [],
  topSlot,
  customContent,
}: SidebarPanelProps) {
  const [setupOpen, setSetupOpen] = React.useState(false)
  const prefersReducedMotion = useReducedMotion()
  const pathname = usePathname()

  const primarySections = module.sections.filter((s) => s.id !== 'studio-setup')
  const setupSection = module.sections.find((s) => s.id === 'studio-setup')

  const isItemActive = React.useCallback(
    (itemPath: string): boolean => {
      return pathname === itemPath
    },
    [pathname],
  )

  const isSetupActive =
    setupSection?.items.some((item) => isItemActive(item.path)) ?? false

  React.useEffect(() => {
    if (isSetupActive) {
      setSetupOpen(true)
    }
  }, [isSetupActive])

  return (
    <div
      className="relative flex h-screen flex-col overflow-hidden rounded-l-xl bg-[var(--shell-panel)]"
      style={{ width: `${SIDEBAR_PANEL_WIDTH}px` }}
    >
      <div
        key={module.id}
        className="relative flex min-h-0 flex-1 animate-in flex-col text-muted-foreground duration-200 fade-in slide-in-from-right-2"
      >
        {/* Top Slot (e.g., Event Switcher, Organization Switcher, New Button) */}
        {topSlot && <div className="shrink-0 p-3">{topSlot}</div>}

        {/* Custom Content (for specialized panels like Image Generator) */}
        {customContent ? (
          <ScrollArea className="min-h-0 flex-1">
            <div className="px-3 pb-3">{customContent}</div>
          </ScrollArea>
        ) : (
          <>
            {/* Standard Navigation Sections */}
            <ScrollArea className="min-h-0 flex-1">
              <div className="flex flex-col gap-5 px-3 pb-3">
                {primarySections.map((section) => (
                  <div key={section.id}>
                    {section.label && (
                      <div className="mb-2 pl-3 text-sm text-muted-foreground">
                        {section.label}
                      </div>
                    )}
                    <nav className="flex flex-col gap-0.5">
                      {section.items.map((item) => (
                        <NavItem
                          key={item.id}
                          item={item}
                          isActive={isItemActive(item.path)}
                        />
                      ))}
                    </nav>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Setup Section & Utilities (footer area) */}
            {((setupSection && setupSection.items.length > 0) || utilities.length > 0) && (
              <div className="shrink-0 px-3 pt-1 pb-3">
                {setupSection && setupSection.items.length > 0 && (
                  <Collapsible
                    open={setupOpen}
                    onOpenChange={setSetupOpen}
                    className="group/setup"
                  >
                    <div
                      className={cn(
                        'rounded-lg p-2',
                        setupOpen && 'bg-background/20',
                      )}
                    >
                      <CollapsibleTrigger
                        className={cn(
                          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                          setupOpen && 'hidden',
                          isSetupActive
                            ? 'bg-primary/10 font-medium text-primary'
                            : 'text-muted-foreground hover:bg-accent/50',
                        )}
                      >
                        <Settings
                          className={cn(
                            'size-4',
                            isSetupActive
                              ? 'text-primary'
                              : 'text-muted-foreground',
                          )}
                        />
                        <span className="font-medium">Configuration</span>
                        <ChevronRight
                          className={cn(
                            'ml-auto size-4',
                            isSetupActive
                              ? 'text-primary/60'
                              : 'text-muted-foreground/60',
                          )}
                        />
                      </CollapsibleTrigger>

                      <AnimatePresence initial={false}>
                        {setupOpen && (
                          <motion.nav
                            initial={
                              prefersReducedMotion
                                ? false
                                : { height: 0, opacity: 0 }
                            }
                            animate={{
                              height: 'auto',
                              opacity: 1,
                              transition: {
                                height: prefersReducedMotion
                                  ? { duration: 0 }
                                  : {
                                      type: 'spring',
                                      stiffness: 500,
                                      damping: 40,
                                      mass: 1,
                                    },
                                opacity: prefersReducedMotion
                                  ? { duration: 0 }
                                  : { duration: 0.2 },
                              },
                            }}
                            exit={{
                              height: 0,
                              opacity: 0,
                              transition: {
                                height: prefersReducedMotion
                                  ? { duration: 0 }
                                  : {
                                      type: 'spring',
                                      stiffness: 500,
                                      damping: 40,
                                      mass: 1,
                                    },
                                opacity: prefersReducedMotion
                                  ? { duration: 0 }
                                  : { duration: 0.15 },
                              },
                            }}
                            className="relative flex max-h-[40vh] flex-col gap-0.5 overflow-y-auto pr-6"
                          >
                            <CollapsibleTrigger
                              className="absolute top-0 right-0 p-1 text-muted-foreground/60 transition-colors hover:text-muted-foreground"
                              aria-label="Collapse configuration"
                            >
                              <ChevronDown className="size-4" />
                            </CollapsibleTrigger>
                            {setupSection.items.map((item, i) => (
                              <motion.div
                                key={item.id}
                                initial={
                                  prefersReducedMotion
                                    ? false
                                    : { opacity: 0, x: -8 }
                                }
                                animate={{
                                  opacity: 1,
                                  x: 0,
                                  transition: {
                                    delay: prefersReducedMotion ? 0 : i * 0.03,
                                    duration: prefersReducedMotion ? 0 : 0.2,
                                    ease: [0.25, 0.1, 0.25, 1],
                                  },
                                }}
                                exit={{
                                  opacity: 0,
                                  transition: {
                                    duration: prefersReducedMotion ? 0 : 0.1,
                                  },
                                }}
                              >
                                <NavItem item={item} isActive={isItemActive(item.path)} />
                              </motion.div>
                            ))}
                          </motion.nav>
                        )}
                      </AnimatePresence>
                    </div>
                  </Collapsible>
                )}

                {utilities.length > 0 && (
                  <div className="mt-3 border-t border-border pt-3">
                    <nav className="flex flex-col gap-0.5">
                      {utilities.map((item) => (
                        <NavItem
                          key={item.id}
                          item={item}
                          isActive={isItemActive(item.path)}
                        />
                      ))}
                    </nav>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function NavItem({ item, isActive }: { item: NavItemConfig; isActive: boolean }) {
  const isExternal = item.path.startsWith('http')
  const Icon = item.icon

  return (
    <Link
      href={item.path}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={cn(
        'group flex h-8 items-center justify-between rounded-lg p-2 text-sm leading-none transition-[background-color,color,font-weight] duration-75',
        isActive
          ? 'bg-primary/10 font-medium text-primary hover:bg-primary/15 active:bg-primary/20'
          : 'text-foreground hover:bg-accent active:bg-accent/80',
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <Icon
          className={cn(
            'size-4 shrink-0',
            isActive ? 'text-primary' : 'text-muted-foreground',
          )}
        />
        <span className="truncate">{item.label}</span>
      </span>
      {isExternal && (
        <ExternalLink className="size-3.5 text-muted-foreground transition-transform duration-75 group-hover:translate-x-px group-hover:-translate-y-px" />
      )}
    </Link>
  )
}
