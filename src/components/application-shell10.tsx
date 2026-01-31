'use client'

import {
  Archive,
  ArrowLeft,
  Bug,
  ChevronDown,
  Clock,
  CommandIcon,
  File,
  Inbox,
  Lightbulb,
  MailOpen,
  MessageSquare,
  MoreHorizontal,
  PanelRight,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  User as UserIcon,
  UserCheck,
  Users,
} from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

import { LogoImage } from '@/components/shadcnblocks/logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar'
import { Textarea } from '@/components/ui/textarea'
import { AppSidebar } from './layout/app-sidebar'
import { TicketListPanel } from './layout/guest-list'
import { TicketCommandPalette } from './layout/ticket-command-palette'
import { MessageBubble } from './layout/message-bubble'
import { ReplyComposer } from './layout/reply-composer'
import { InboxAgentPanel } from './layout/inbox-agent-panel'
import {
  navItems,
  buckets,
  staffUsers,
  mockCustomers,
  mockTickets,
  previousConversations,
  type NavItemId,
  type BucketId,
  type TicketStatus,
  type User,
  type Customer,
  type Message,
  type Ticket,
  type PreviousConversation,
} from './layout/data'

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

function getStatusColor(status: TicketStatus) {
  switch (status) {
    case 'active':
      return 'bg-emerald-500'
    case 'pending':
      return 'bg-amber-500'
    case 'closed':
      return 'bg-muted-foreground'
    default:
      return 'bg-muted-foreground'
  }
}

export function ApplicationShell10() {
  const [activeNavItem, setActiveNavItem] = React.useState<NavItemId>('inbox')
  const [activeBucket, setActiveBucket] = React.useState<BucketId | null>(null)
  const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(
    mockTickets[0]?.id ?? null,
  )
  const [tickets, setTickets] = React.useState<Ticket[]>(mockTickets)
  const [isAgentPanelOpen, setIsAgentPanelOpen] = React.useState(true)
  const [isCommandOpen, setIsCommandOpen] = React.useState(false)
  const [isMobileTicketListOpen, setIsMobileTicketListOpen] = React.useState(false)
  const [isMobileConversationOpen, setIsMobileConversationOpen] = React.useState(false)
  const [isMobileAgentOpen, setIsMobileAgentOpen] = React.useState(false)

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) ?? null

  // Keyboard shortcut for command palette
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsCommandOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicketId(ticketId)
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, read: true } : t)))
    if (window.innerWidth < 768) {
      setIsMobileConversationOpen(true)
    }
  }

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar
        activeNavItem={activeNavItem}
        activeBucket={activeBucket}
        onNavItemChange={setActiveNavItem}
        onBucketChange={setActiveBucket}
        onSearchClick={() => setIsCommandOpen(true)}
        className="hidden md:flex"
      />

      <div className="flex h-full flex-col overflow-hidden pb-16 md:hidden">
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <LogoImage
              src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/block-1.svg"
              alt="Shadcnblocks"
              className="h-8 w-8 rounded-sm bg-muted p-1"
            />
            <span className="font-semibold">
              Your {navItems.find((item) => item.id === activeNavItem)?.label ?? 'Inbox'}
            </span>
          </div>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          {tickets.map((ticket) => {
            const isSelected = selectedTicketId === ticket.id
            return (
              <button
                type="button"
                key={ticket.id}
                onClick={() => handleTicketSelect(ticket.id)}
                className={cn(
                  'w-full border-b p-4 text-left text-sm leading-tight last:border-b-0 hover:bg-muted/50',
                  !ticket.read && 'bg-muted/30',
                  isSelected && 'bg-muted',
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('truncate text-sm', !ticket.read && 'font-semibold')}>
                      {ticket.subject}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {ticket.timestamp}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {ticket.preview}
                  </p>
                  {ticket.respondingUser && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Avatar className="size-4">
                        <AvatarImage
                          src={ticket.respondingUser.avatar}
                          alt={ticket.respondingUser.name}
                        />
                        <AvatarFallback className="text-[8px]">
                          {getInitials(ticket.respondingUser.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{ticket.respondingUser.name.split(' ')[0]} is responding...</span>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </ScrollArea>
      </div>

      <SidebarInset className="hidden min-h-0 overflow-hidden md:flex">
        <div className="flex h-full w-full">
          <TicketListPanel
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            onTicketSelect={handleTicketSelect}
            activeNavItem={activeNavItem}
          />

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            {selectedTicket ? (
              <>
                <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="size-5" />
                    <span className="font-medium">Re: {selectedTicket.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <span
                            className={cn(
                              'size-2 rounded-full',
                              getStatusColor(selectedTicket.status),
                            )}
                          />
                          <span className="capitalize">{selectedTicket.status}</span>
                          <ChevronDown className="size-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Active</DropdownMenuItem>
                        <DropdownMenuItem>Pending</DropdownMenuItem>
                        <DropdownMenuItem>Closed</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => setIsAgentPanelOpen(!isAgentPanelOpen)}
                    >
                      <PanelRight className={cn('size-4', isAgentPanelOpen && 'text-primary')} />
                    </Button>
                  </div>
                </header>

                <ScrollArea className="min-h-0 flex-1">
                  <div className="px-6 py-6 lg:px-10">
                    <div className="mx-auto max-w-3xl space-y-8">
                      {selectedTicket.messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                    </div>
                  </div>
                </ScrollArea>

                <ReplyComposer
                  recipientEmail={selectedTicket.customer.email}
                  respondingUser={selectedTicket.respondingUser}
                />
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="mx-auto size-12 opacity-50" />
                  <p className="mt-2 text-sm">Select a ticket to view</p>
                </div>
              </div>
            )}
          </div>

          {isAgentPanelOpen && selectedTicket && (
            <InboxAgentPanel
              ticket={selectedTicket}
              previousConversations={previousConversations}
            />
          )}
        </div>
      </SidebarInset>

      <TicketCommandPalette
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
        tickets={tickets}
        onTicketSelect={handleTicketSelect}
        onNavItemSelect={(navItemId) => {
          setActiveNavItem(navItemId)
          setActiveBucket(null)
        }}
      />

      <Drawer open={isMobileTicketListOpen} onOpenChange={setIsMobileTicketListOpen} dismissible>
        <DrawerContent className="h-[85vh] md:hidden">
          <DrawerHeader>
            <DrawerTitle>Tickets</DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="min-h-0 flex-1 px-4">
            {tickets.map((ticket) => (
              <button
                type="button"
                key={ticket.id}
                onClick={() => {
                  handleTicketSelect(ticket.id)
                  setIsMobileTicketListOpen(false)
                }}
                className={cn(
                  'w-full border-b p-4 text-left text-sm',
                  !ticket.read && 'bg-muted/30',
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('truncate', !ticket.read && 'font-semibold')}>
                      {ticket.subject}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {ticket.timestamp}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {ticket.preview}
                  </p>
                </div>
              </button>
            ))}
          </ScrollArea>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={isMobileConversationOpen}
        onOpenChange={setIsMobileConversationOpen}
        dismissible
      >
        <DrawerContent className="h-[90vh] overflow-hidden md:hidden">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Conversation</DrawerTitle>
          </DrawerHeader>
          {selectedTicket && (
            <div className="flex h-full min-h-0 flex-col overflow-hidden">
              <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
                <span className="line-clamp-1 font-medium">{selectedTicket.subject}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={() => setIsMobileAgentOpen(true)}
                >
                  <Sparkles className="size-4" />
                </Button>
              </div>
              <ScrollArea className="min-h-0 flex-1">
                <div className="space-y-6 p-4">
                  {selectedTicket.messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </div>
              </ScrollArea>
              <div className="shrink-0">
                <ReplyComposer
                  recipientEmail={selectedTicket.customer.email}
                  respondingUser={selectedTicket.respondingUser}
                />
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      <Drawer open={isMobileAgentOpen} onOpenChange={setIsMobileAgentOpen} dismissible>
        <DrawerContent className="h-[85vh] md:hidden">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Sparkles className="size-4" />
              Inbox Agent
            </DrawerTitle>
          </DrawerHeader>
          {selectedTicket && (
            <ScrollArea className="min-h-0 flex-1 px-4 pb-6">
              <div className="space-y-6">
                <section className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage
                        src={selectedTicket.customer.avatar}
                        alt={selectedTicket.customer.name}
                      />
                      <AvatarFallback>{getInitials(selectedTicket.customer.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{selectedTicket.customer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedTicket.customer.role}, {selectedTicket.customer.company}
                      </div>
                      {selectedTicket.customer.isHighValue && (
                        <Badge
                          variant="outline"
                          className="mt-1.5 border-amber-500 bg-amber-50 text-amber-700"
                        >
                          High value
                        </Badge>
                      )}
                    </div>
                  </div>
                </section>

                <section className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                  <p>Customer seems calm, but has potential to become frustrated.</p>
                </section>

                <section className="space-y-3">
                  <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                    <p>Hi Sarah, just following up...</p>
                  </div>
                  <Button variant="outline" className="w-full gap-2">
                    <Clock className="size-4" />
                    Schedule follow up
                  </Button>
                </section>
              </div>
            </ScrollArea>
          )}
        </DrawerContent>
      </Drawer>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {[
            {
              id: 'inbox',
              label: 'Inbox',
              icon: Inbox,
              onClick: () => {
                setActiveNavItem('inbox')
                setIsMobileTicketListOpen(true)
              },
            },
            {
              id: 'unassigned',
              label: 'Unassigned',
              icon: MailOpen,
              onClick: () => {
                setActiveNavItem('unassigned')
                setIsMobileTicketListOpen(true)
              },
            },
            {
              id: 'assigned',
              label: 'Assigned',
              icon: UserCheck,
              onClick: () => {
                setActiveNavItem('assigned')
                setIsMobileTicketListOpen(true)
              },
            },
            {
              id: 'search',
              label: 'Search',
              icon: Search,
              onClick: () => setIsCommandOpen(true),
            },
            {
              id: 'more',
              label: 'More',
              icon: MoreHorizontal,
              onClick: () => {},
            },
          ].map((item) => {
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
    </SidebarProvider>
  )
}
