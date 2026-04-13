'use client'

import { useState } from 'react'
import { TopBar } from '@/components/shared/TopBar'
import { EmailsList } from './EmailsList'
import { EmailDetailSheet } from './EmailDetailSheet'
import type { EmailLog } from '@/payload-types'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface Props {
  emails: EmailLog[]
}

export function EmailsListClient({ emails }: Props) {
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null)
  const [filter, setFilter] = useState<'all' | 'inbound' | 'outbound'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEmails = emails.filter((email) => {
    // Direction filter
    if (filter !== 'all' && email.direction !== filter) return false

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSubject = email.subject?.toLowerCase().includes(query)
      const matchesFrom = email.fromEmail?.toLowerCase().includes(query)
      const matchesTo = email.toEmail?.toLowerCase().includes(query)
      return matchesSubject || matchesFrom || matchesTo
    }

    return true
  })

  const inboundCount = emails.filter((e) => e.direction === 'inbound').length
  const outboundCount = emails.filter((e) => e.direction === 'outbound').length

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <TopBar title="Email History" description="Track and explore sent and received emails" />
      <div className="flex-1 overflow-auto">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <Tabs
              value={filter}
              onValueChange={(v: string) => setFilter(v as 'all' | 'inbound' | 'outbound')}
            >
              <TabsList>
                <TabsTrigger value="all">All ({emails.length})</TabsTrigger>
                <TabsTrigger value="outbound">Sent ({outboundCount})</TabsTrigger>
                <TabsTrigger value="inbound">Received ({inboundCount})</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <EmailsList emails={filteredEmails} onSelectEmail={setSelectedEmail} />
        </div>
      </div>

      <EmailDetailSheet
        email={selectedEmail}
        open={!!selectedEmail}
        onOpenChange={(open: boolean) => !open && setSelectedEmail(null)}
      />
    </div>
  )
}
