'use client'

import { useState, useMemo, useCallback } from 'react'
import { EmailInboxSidebar } from './EmailInboxSidebar'
import { EmailDetailPanel } from './EmailDetailPanel'
import type { EmailLog } from '@/payload-types'

export type EmailTab = 'inbox' | 'sent'

interface Props {
  emails: EmailLog[]
}

export function EmailsListClient({ emails: initialEmails }: Props) {
  const [emails, setEmails] = useState(initialEmails)
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUnreadsOnly, setShowUnreadsOnly] = useState(false)
  const [activeTab, setActiveTab] = useState<EmailTab>('inbox')

  const filteredEmails = useMemo(() => {
    return emails.filter((email) => {
      // Tab filter - inbox shows inbound, sent shows outbound
      if (activeTab === 'inbox' && email.direction !== 'inbound') return false
      if (activeTab === 'sent' && email.direction !== 'outbound') return false

      // Unreads filter - use the read field (only for inbox)
      if (showUnreadsOnly && activeTab === 'inbox') {
        if ((email as any).read === true) return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSubject = email.subject?.toLowerCase().includes(query)
        const matchesFrom = email.fromEmail?.toLowerCase().includes(query)
        const matchesFromName = email.fromName?.toLowerCase().includes(query)
        const matchesTo = email.toEmail?.toLowerCase().includes(query)
        const matchesToName = email.toName?.toLowerCase().includes(query)
        return matchesSubject || matchesFrom || matchesFromName || matchesTo || matchesToName
      }

      return true
    })
  }, [emails, searchQuery, showUnreadsOnly, activeTab])

  // Count unread inbox emails
  const unreadInboxCount = useMemo(() => {
    return emails.filter((email) => email.direction === 'inbound' && !(email as any).read).length
  }, [emails])

  const markAsRead = useCallback(async (emailId: number) => {
    try {
      const response = await fetch(`/api/emails/${emailId}/read`, {
        method: 'PATCH',
      })

      if (response.ok) {
        // Update local state to mark email as read
        setEmails((prev) =>
          prev.map((email) =>
            email.id === emailId ? ({ ...email, read: true } as EmailLog) : email,
          ),
        )
      }
    } catch (error) {
      console.error('Failed to mark email as read:', error)
    }
  }, [])

  const handleEmailSelect = useCallback(
    (email: EmailLog) => {
      setSelectedEmail(email)

      // Mark as read if not already read
      if (!(email as any).read) {
        markAsRead(email.id)
      }
    },
    [markAsRead],
  )

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <EmailInboxSidebar
        emails={filteredEmails}
        selectedEmailId={selectedEmail ? String(selectedEmail.id) : null}
        onEmailSelect={handleEmailSelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showUnreadsOnly={showUnreadsOnly}
        onUnreadsToggle={setShowUnreadsOnly}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadInboxCount={unreadInboxCount}
      />
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <EmailDetailPanel email={selectedEmail} />
      </div>
    </div>
  )
}
