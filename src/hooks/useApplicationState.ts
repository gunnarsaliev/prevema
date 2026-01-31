import * as React from 'react'
import { mockTickets, type NavItemId, type BucketId } from '@/components/layout/data'

export function useApplicationState() {
  const [activeNavItem, setActiveNavItem] = React.useState<NavItemId>('dashboard')
  const [activeBucket, setActiveBucket] = React.useState<BucketId | null>(null)
  const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(
    mockTickets[0]?.id ?? null,
  )
  const [tickets, setTickets] = React.useState(mockTickets)
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

  return {
    // State
    activeNavItem,
    activeBucket,
    selectedTicketId,
    tickets,
    isAgentPanelOpen,
    isCommandOpen,
    isMobileTicketListOpen,
    isMobileConversationOpen,
    isMobileAgentOpen,
    selectedTicket,

    // Setters
    setActiveNavItem,
    setActiveBucket,
    setSelectedTicketId,
    setTickets,
    setIsAgentPanelOpen,
    setIsCommandOpen,
    setIsMobileTicketListOpen,
    setIsMobileConversationOpen,
    setIsMobileAgentOpen,

    // Actions
    handleTicketSelect,
  }
}
