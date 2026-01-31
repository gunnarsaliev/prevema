'use client'

import { useState } from 'react'
import { DesktopLayout } from '@/components/desktop-layout'
import { MobileDashLayout } from '@/components/mobile-dash-layout'
import { mockTickets, type NavItemId } from '@/components/layout/data'

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    mockTickets[0]?.id || null,
  )
  const [isAgentPanelOpen, setIsAgentPanelOpen] = useState(false)
  const [activeNavItem] = useState<NavItemId>('messages')

  const selectedTicket = mockTickets.find((ticket) => ticket.id === selectedTicketId) || null

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicketId(ticketId)
  }

  const handleAgentPanelToggle = () => {
    setIsAgentPanelOpen(!isAgentPanelOpen)
  }

  return (
    <>
      {/* Desktop Layout - only shown on desktop */}
      <div className="hidden md:flex h-full">
        <DesktopLayout
          tickets={mockTickets}
          selectedTicket={selectedTicket}
          selectedTicketId={selectedTicketId}
          activeNavItem={activeNavItem}
          isAgentPanelOpen={isAgentPanelOpen}
          onTicketSelect={handleTicketSelect}
          onAgentPanelToggle={handleAgentPanelToggle}
        />
      </div>

      {/* Mobile Layout - only shown on mobile */}
      <div className="md:hidden">
        <MobileDashLayout showTicketList={false}>{children}</MobileDashLayout>
      </div>
    </>
  )
}
