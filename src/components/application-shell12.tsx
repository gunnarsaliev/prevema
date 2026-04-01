'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Bell,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  HelpCircle,
  Home,
  type LucideIcon,
  MessageSquare,
  PanelLeft,
  PanelLeftClose,
  Plus,
  Settings,
  Users,
} from 'lucide-react'
import * as React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const SIDEBAR_WIDTH = 304
const SIDEBAR_RAIL_WIDTH = 64
const SIDEBAR_PANEL_WIDTH = SIDEBAR_WIDTH - SIDEBAR_RAIL_WIDTH
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

interface SidebarContextValue {
  isPanelOpen: boolean
  setPanelOpen: (open: boolean) => void
  togglePanel: () => void
  panelState: 'expanded' | 'collapsed'
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

interface SidebarProviderProps {
  defaultOpen?: boolean
  children: React.ReactNode
}

function SidebarProvider({ defaultOpen = true, children }: SidebarProviderProps) {
  const [_isPanelOpen, _setIsPanelOpen] = React.useState(defaultOpen)
  const isPanelOpen = _isPanelOpen

  const setPanelOpen = React.useCallback((open: boolean) => {
    _setIsPanelOpen(open)
  }, [])

  const togglePanel = React.useCallback(() => {
    setPanelOpen(!isPanelOpen)
  }, [isPanelOpen, setPanelOpen])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        togglePanel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePanel])

  const panelState = isPanelOpen ? 'expanded' : 'collapsed'

  const value = React.useMemo<SidebarContextValue>(
    () => ({
      isPanelOpen,
      setPanelOpen,
      togglePanel,
      panelState,
    }),
    [isPanelOpen, setPanelOpen, togglePanel, panelState],
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

interface NavItemConfig {
  id: string
  label: string
  icon: LucideIcon
  path: string
}

interface NavSectionConfig {
  id: string
  label?: string
  items: NavItemConfig[]
}

interface NavModuleConfig {
  id: string
  label: string
  icon: LucideIcon
  defaultPath: string
  sections: NavSectionConfig[]
}

interface RailIconConfig {
  moduleId: string
  label: string
  icon: LucideIcon
  defaultPath: string
}

const data = {
  user: {
    name: 'Jordan Lee',
    email: 'jordan@example.com',
    avatar: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar1.jpg',
  },
  organization: {
    name: 'Acme Inc',
    logo: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg',
  },
  railIcons: [
    { moduleId: 'home', label: 'Home', icon: Home, defaultPath: '#' },
    {
      moduleId: 'projects',
      label: 'Projects',
      icon: FileText,
      defaultPath: '#',
    },
    {
      moduleId: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      defaultPath: '#',
    },
    { moduleId: 'team', label: 'Team', icon: Users, defaultPath: '#' },
  ] as RailIconConfig[],
  modules: [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      defaultPath: '#',
      sections: [
        {
          id: 'main',
          items: [
            { id: 'overview', label: 'Overview', icon: Home, path: '#' },
            { id: 'documents', label: 'Documents', icon: FileText, path: '#' },
            {
              id: 'messages',
              label: 'Messages',
              icon: MessageSquare,
              path: '#',
            },
          ],
        },
        {
          id: 'library',
          label: 'Library',
          items: [
            { id: 'guides', label: 'Guides', icon: BookOpen, path: '#' },
            { id: 'resources', label: 'Resources', icon: FileText, path: '#' },
          ],
        },
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FileText,
      defaultPath: '#',
      sections: [
        {
          id: 'main',
          items: [
            {
              id: 'all-projects',
              label: 'All Projects',
              icon: FileText,
              path: '#',
            },
            { id: 'recent', label: 'Recent', icon: Calendar, path: '#' },
            { id: 'starred', label: 'Starred', icon: BookOpen, path: '#' },
          ],
        },
      ],
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      defaultPath: '#',
      sections: [
        {
          id: 'main',
          items: [
            { id: 'schedule', label: 'Schedule', icon: Calendar, path: '#' },
            { id: 'events', label: 'Events', icon: Bell, path: '#' },
          ],
        },
      ],
    },
    {
      id: 'team',
      label: 'Team',
      icon: Users,
      defaultPath: '#',
      sections: [
        {
          id: 'main',
          items: [
            { id: 'members', label: 'Members', icon: Users, path: '#' },
            {
              id: 'activity',
              label: 'Activity',
              icon: MessageSquare,
              path: '#',
            },
          ],
        },
      ],
    },
  ] as NavModuleConfig[],
  utilities: [
    { id: 'help', label: 'Help & Support', icon: HelpCircle, path: '#' },
  ] as NavItemConfig[],
}

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'
  )
}

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button> & { showTooltip?: boolean }
>(({ className, onClick, showTooltip = true, ...props }, ref) => {
  const { isPanelOpen, togglePanel } = useSidebar()

  const button = (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn('size-8', className)}
      onClick={(event) => {
        onClick?.(event)
        togglePanel()
      }}
      aria-label={isPanelOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      aria-expanded={isPanelOpen}
      {...props}
    >
      {isPanelOpen ? <PanelLeftClose className="size-4" /> : <PanelLeft className="size-4" />}
    </Button>
  )

  if (!showTooltip) {
    return button
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        <span>{isPanelOpen ? 'Collapse' : 'Expand'}</span>
        <kbd className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {'\u2318'}B
        </kbd>
      </TooltipContent>
    </Tooltip>
  )
})
SidebarTrigger.displayName = 'SidebarTrigger'

interface SidebarRailProps {
  railIcons: RailIconConfig[]
  activeModuleId: string
  onModuleChange: (moduleId: string) => void
}

function SidebarRail({ railIcons, activeModuleId, onModuleChange }: SidebarRailProps) {
  return (
    <div className="flex h-full w-16 flex-col items-center justify-between">
      <div className="flex flex-col items-center gap-3 p-2">
        <div className="pt-2 pb-1">
          <a
            href="#"
            className="flex items-center justify-center rounded-lg transition-opacity outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex size-8 items-center justify-center rounded-sm bg-primary">
              <img
                src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg"
                alt="Logo"
                className="size-5 invert dark:invert-0"
              />
            </div>
          </a>
        </div>

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

      <div className="flex flex-col items-center gap-3 py-3">
        <SidebarTrigger className="size-11 text-muted-foreground hover:bg-accent active:bg-accent/80" />

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex size-11 items-center justify-center">
              <UserMenu />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Account
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex size-11 items-center justify-center rounded-lg hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring active:bg-accent/80"
          aria-label="Account"
        >
          <Avatar className="size-7">
            <AvatarImage src={data.user.avatar} alt={data.user.name} />
            <AvatarFallback className="text-xs">{getInitials(data.user.name)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{data.user.name}</p>
            <p className="text-xs text-muted-foreground">{data.user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Account</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Notifications</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function OrganizationSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-accent">
          <span className="flex-1 truncate text-sm font-medium text-foreground">
            {data.organization.name}
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <span>{data.organization.name}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Plus className="mr-2 size-4" />
          Create organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NotificationBell() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="ml-auto size-8 text-muted-foreground hover:bg-accent"
      aria-label="Notifications"
    >
      <Bell className="size-4" />
    </Button>
  )
}

function NewActionButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="size-4" />
          New
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem>New Document</DropdownMenuItem>
        <DropdownMenuItem>New Project</DropdownMenuItem>
        <DropdownMenuItem>New Event</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface SidebarPanelProps {
  module: NavModuleConfig
  utilities: NavItemConfig[]
}

function isItemActive(_pathname: string, itemPath: string): boolean {
  return itemPath === '#' && _pathname === '#'
}

function SidebarPanel({ module, utilities }: SidebarPanelProps) {
  const [setupOpen, setSetupOpen] = React.useState(false)
  const prefersReducedMotion = useReducedMotion()
  const pathname = '#'

  const primarySections = module.sections.filter((s) => s.id !== 'studio-setup')
  const setupSection = module.sections.find((s) => s.id === 'studio-setup')

  const isSetupActive =
    setupSection?.items.some((item) => isItemActive(pathname, item.path)) ?? false

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
        <div className="shrink-0 p-3">
          <div className="mb-2 flex items-center gap-2">
            <OrganizationSwitcher />
            <NotificationBell />
          </div>

          <div>
            <NewActionButton />
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-5 px-3 pb-3">
            {primarySections.map((section) => (
              <div key={section.id}>
                {section.label && (
                  <div className="mb-2 pl-3 text-sm text-muted-foreground">{section.label}</div>
                )}
                <nav className="flex flex-col gap-0.5">
                  {section.items.map((item, index) => (
                    <NavItem
                      key={item.id}
                      item={item}
                      isActive={index === 0 && section.id === 'main'}
                    />
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </ScrollArea>

        {(setupSection && setupSection.items.length > 0) || utilities.length > 0 ? (
          <div className="shrink-0 px-3 pt-1 pb-3">
            {setupSection && setupSection.items.length > 0 && (
              <Collapsible open={setupOpen} onOpenChange={setSetupOpen} className="group/setup">
                <div className={cn('rounded-lg p-2', setupOpen && 'bg-background/20')}>
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
                        isSetupActive ? 'text-primary' : 'text-muted-foreground',
                      )}
                    />
                    <span className="font-medium">Configuration</span>
                    <ChevronRight
                      className={cn(
                        'ml-auto size-4',
                        isSetupActive ? 'text-primary/60' : 'text-muted-foreground/60',
                      )}
                    />
                  </CollapsibleTrigger>

                  <AnimatePresence initial={false}>
                    {setupOpen && (
                      <motion.nav
                        initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
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
                            opacity: prefersReducedMotion ? { duration: 0 } : { duration: 0.2 },
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
                            opacity: prefersReducedMotion ? { duration: 0 } : { duration: 0.15 },
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
                            initial={prefersReducedMotion ? false : { opacity: 0, x: -8 }}
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
                            <NavItem item={item} isActive={isItemActive(pathname, item.path)} />
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
                      isActive={isItemActive(pathname, item.path)}
                    />
                  ))}
                </nav>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function NavItem({ item, isActive }: { item: NavItemConfig; isActive: boolean }) {
  const isExternal = item.path.startsWith('http')
  const Icon = item.icon

  return (
    <a
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
          className={cn('size-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}
        />
        <span className="truncate">{item.label}</span>
      </span>
      {isExternal && (
        <ExternalLink className="size-3.5 text-muted-foreground transition-transform duration-75 group-hover:translate-x-px group-hover:-translate-y-px" />
      )}
    </a>
  )
}

function Area({
  visible,
  direction = 'right',
  children,
}: {
  visible: boolean
  direction?: 'left' | 'right'
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'top-0 left-0 flex size-full flex-col transition-[opacity,transform] duration-300',
        visible
          ? 'relative opacity-100'
          : cn(
              'pointer-events-none absolute opacity-0',
              direction === 'left' ? '-translate-x-full' : 'translate-x-full',
            ),
      )}
      aria-hidden={!visible}
      inert={!visible ? true : undefined}
    >
      {children}
    </div>
  )
}

function ContentArea({ activeModule }: { activeModule: NavModuleConfig }) {
  const { isPanelOpen } = useSidebar()
  const showCornerFills = isPanelOpen

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background md:bg-slate-200 md:py-2 md:pr-2">
      <div className="relative flex min-h-0 flex-1 flex-col">
        {/* <div
          className={cn(
            'absolute top-0 -left-2 z-0 hidden h-3 w-5 bg-[var(--shell-panel)] transition-opacity duration-300 md:block',
            showCornerFills ? 'opacity-100' : 'opacity-0',
          )}
        /> */}
        <div
          className={cn(
            'absolute bottom-0 -left-2 z-0 hidden h-3 w-5 bg-[var(--shell-panel)] transition-opacity duration-300 md:block',
            showCornerFills ? 'opacity-100' : 'opacity-0',
          )}
        />
        <main className="z-10 flex min-h-0 flex-1 flex-col overflow-hidden bg-background pb-20 md:rounded-xl md:pb-0">
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-0">
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 p-6 pb-28 md:min-h-min md:pb-6">
              <div className="mx-auto max-w-4xl space-y-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {activeModule.label}
                  </h1>
                  <p className="text-muted-foreground">
                    Welcome to your {activeModule.label.toLowerCase()} dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

interface DubSidebarProps {
  railIcons: RailIconConfig[]
  activeModule: NavModuleConfig | null
  activeModuleId: string
  utilities: NavItemConfig[]
  onModuleChange: (moduleId: string) => void
}

function DubSidebar({
  railIcons,
  activeModule,
  activeModuleId,
  utilities,
  onModuleChange,
}: DubSidebarProps) {
  const { isPanelOpen } = useSidebar()

  const hasContent = activeModule !== null
  const showPanel = hasContent && isPanelOpen

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn('sticky top-0 z-40 hidden h-screen transition-[width] duration-300 md:block')}
        style={
          {
            width: showPanel ? SIDEBAR_WIDTH : SIDEBAR_RAIL_WIDTH,
            '--sidebar-width': `${showPanel ? SIDEBAR_WIDTH : SIDEBAR_RAIL_WIDTH}px`,
            '--sidebar-rail-width': `${SIDEBAR_RAIL_WIDTH}px`,
            '--sidebar-panel-width': `${SIDEBAR_PANEL_WIDTH}px`,
          } as React.CSSProperties
        }
        data-panel-state={isPanelOpen ? 'expanded' : 'collapsed'}
        data-has-content={hasContent}
      >
        <nav className="grid size-full grid-cols-[64px_1fr]">
          <SidebarRail
            railIcons={railIcons}
            activeModuleId={activeModuleId}
            onModuleChange={onModuleChange}
          />
          <div
            className={cn(
              'relative size-full overflow-hidden py-2 transition-opacity duration-300',
              !showPanel && 'opacity-0',
            )}
          >
            <Area visible={true} direction="left">
              {activeModule && <SidebarPanel module={activeModule} utilities={utilities} />}
            </Area>
          </div>
        </nav>
      </aside>
    </TooltipProvider>
  )
}

interface MobileNavigationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  railIcons: RailIconConfig[]
  activeModule: NavModuleConfig | null
  activeModuleId: string
  utilities: NavItemConfig[]
  onModuleChange: (moduleId: string) => void
}

function MobileNavigation({
  open,
  onOpenChange,
  railIcons,
  activeModule,
  activeModuleId,
  utilities,
  onModuleChange,
}: MobileNavigationProps) {
  const pathname = '#'
  const handleItemSelect = () => onOpenChange(false)

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="md:hidden">
          <DrawerHeader>
            <DrawerTitle>{activeModule?.label ?? 'Navigation'}</DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="max-h-[70vh] px-4 pb-6">
            {activeModule ? (
              <>
                <div className="flex flex-col gap-6">
                  {activeModule.sections.map((section) => (
                    <div key={section.id}>
                      {section.label && (
                        <div className="mb-2 pl-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          {section.label}
                        </div>
                      )}
                      <nav className="flex flex-col gap-0.5">
                        {section.items.map((item, index) => (
                          <MobileNavItem
                            key={item.id}
                            item={item}
                            isActive={index === 0 && section.id === 'main'}
                            onSelect={handleItemSelect}
                          />
                        ))}
                      </nav>
                    </div>
                  ))}
                </div>

                {utilities.length > 0 && (
                  <div className="mt-6 border-t border-border pt-3">
                    <div className="mb-2 pl-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Utilities
                    </div>
                    <nav className="flex flex-col gap-0.5">
                      {utilities.map((item) => (
                        <MobileNavItem
                          key={item.id}
                          item={item}
                          isActive={isItemActive(pathname, item.path)}
                          onSelect={handleItemSelect}
                        />
                      ))}
                    </nav>
                  </div>
                )}
              </>
            ) : null}
          </ScrollArea>
        </DrawerContent>
      </Drawer>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 md:hidden">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${railIcons.length}, minmax(0, 1fr))`,
          }}
        >
          {railIcons.map((module) => {
            const Icon = module.icon
            const isActive = module.moduleId === activeModuleId
            return (
              <button
                key={module.moduleId}
                type="button"
                onClick={() => {
                  onModuleChange(module.moduleId)
                  onOpenChange(true)
                }}
                className={cn(
                  'flex flex-col items-center gap-1 py-3 text-xs',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
                aria-label={module.label}
              >
                <Icon className="size-5" />
                <span className="sr-only">{module.label}</span>
                <span aria-hidden="true">{module.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}

function MobileNavItem({
  item,
  isActive,
  onSelect,
}: {
  item: NavItemConfig
  isActive: boolean
  onSelect?: () => void
}) {
  const isExternal = item.path.startsWith('http')
  const Icon = item.icon

  return (
    <a
      href={item.path}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      onClick={onSelect}
      className={cn(
        'group flex h-8 items-center justify-between rounded-lg p-2 text-sm leading-none transition-[background-color,color,font-weight] duration-75',
        isActive
          ? 'bg-primary/10 font-medium text-primary hover:bg-primary/15 active:bg-primary/20'
          : 'text-foreground hover:bg-accent active:bg-accent/80',
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <Icon
          className={cn('size-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}
        />
        <span className="truncate">{item.label}</span>
      </span>
      {isExternal && (
        <ExternalLink className="size-3.5 text-muted-foreground transition-transform duration-75 group-hover:translate-x-px group-hover:-translate-y-px" />
      )}
    </a>
  )
}

export const iframeHeight = '800px'

export const description = 'Two-tier sidebar with organization switcher and notifications.'

export function ApplicationShell12() {
  const [isMobilePanelOpen, setIsMobilePanelOpen] = React.useState(false)
  const [activeModuleId, setActiveModuleId] = React.useState('home')

  const activeModule = React.useMemo(
    () => data.modules.find((m) => m.id === activeModuleId) ?? data.modules[0],
    [activeModuleId],
  )

  return (
    <SidebarProvider>
      <div
        className="flex h-screen flex-col overflow-hidden bg-slate-200"
        style={
          {
            '--shell-panel': 'color-mix(in oklch, var(--background) 94%, var(--foreground))',
            '--shell-chrome': 'color-mix(in oklch, var(--background) 88%, var(--foreground))',
          } as React.CSSProperties
        }
      >
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 md:hidden">
          <a href="#" className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-primary">
              <img
                src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg"
                alt="Shadcnblocks"
                className="size-6 text-primary-foreground invert dark:invert-0"
              />
            </div>
          </a>
          <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
          <div className="shrink-0">
            <OrganizationSwitcher />
          </div>
          <div className="ml-auto">
            <UserMenu />
          </div>
        </header>

        <div className="flex min-h-0 flex-1 md:grid md:grid-cols-[min-content_minmax(0,1fr)]">
          <DubSidebar
            railIcons={data.railIcons}
            activeModule={activeModule}
            activeModuleId={activeModuleId}
            utilities={data.utilities}
            onModuleChange={setActiveModuleId}
          />

          <ContentArea activeModule={activeModule} />
        </div>

        <MobileNavigation
          open={isMobilePanelOpen}
          onOpenChange={setIsMobilePanelOpen}
          railIcons={data.railIcons}
          activeModule={activeModule}
          activeModuleId={activeModuleId}
          utilities={data.utilities}
          onModuleChange={setActiveModuleId}
        />
      </div>
    </SidebarProvider>
  )
}
