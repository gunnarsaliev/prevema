'use client'

import { useState } from 'react'
import { DesktopLayout } from '@/components/desktop-layout'
import { mockTickets, type NavItemId } from '@/components/layout/data'

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(mockTickets[0]?.id || null)
  const [isAgentPanelOpen, setIsAgentPanelOpen] = useState(false)
  const [activeNavItem] = useState<NavItemId>('inbox')

  const selectedTicket = mockTickets.find(ticket => ticket.id === selectedTicketId) || null

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicketId(ticketId)
  }

  const handleAgentPanelToggle = () => {
    setIsAgentPanelOpen(!isAgentPanelOpen)
  }

  return (
    <DesktopLayout
      tickets={mockTickets}
      selectedTicket={selectedTicket}
      selectedTicketId={selectedTicketId}
      activeNavItem={activeNavItem}
      isAgentPanelOpen={isAgentPanelOpen}
      onTicketSelect={handleTicketSelect}
      onAgentPanelToggle={handleAgentPanelToggle}
    />
  )
}
