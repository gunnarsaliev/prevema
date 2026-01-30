'use client'

import React, { useState } from 'react'
import { useSelection } from '@payloadcms/ui'
import { Button } from '@payloadcms/ui'
import { BulkEmailModal } from '@/components/BulkEmailModal'

/**
 * Bulk Email Action Component for Partners
 * Displays a button in the Partners list view to send emails to selected partners
 */
export const BulkEmailAction: React.FC = () => {
  const { selected, count } = useSelection()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [partnerIds, setPartnerIds] = useState<string[]>([])
  const [teamId, setTeamId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleBulkEmail = async () => {
    setLoading(true)

    try {
      // Get selected partner IDs from the Map
      let ids: string[] = []

      if (selected) {
        if (selected instanceof Map) {
          ids = Array.from(selected.keys()).map(String)
        } else if (typeof selected === 'object') {
          ids = Object.keys(selected).filter(key => selected[key])
        }
      }

      if (ids.length === 0) {
        alert('No partners selected')
        setLoading(false)
        return
      }

      // Fetch the first partner to get team ID
      const response = await fetch(`/api/partners/${ids[0]}`)
      const partner = await response.json()

      const partnerTeamId = typeof partner.team === 'object'
        ? partner.team.id
        : partner.team

      setPartnerIds(ids)
      setTeamId(String(partnerTeamId))
      setIsModalOpen(true)
    } catch (error) {
      console.error('Failed to prepare bulk email:', error)
      alert('Failed to prepare bulk email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setPartnerIds([])
    setTeamId('')
  }

  // Only show button if items are selected
  if (!count || count === 0) {
    return null
  }

  return (
    <>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--theme-elevation-150)' }}>
        <Button
          onClick={handleBulkEmail}
          buttonStyle="primary"
          size="small"
          disabled={loading}
        >
          {loading ? 'Loading...' : `Send Email to ${count} Selected Partner${count > 1 ? 's' : ''}`}
        </Button>
      </div>

      {isModalOpen && teamId && partnerIds.length > 0 && (
        <BulkEmailModal
          participantIds={partnerIds}
          teamId={teamId}
          onClose={handleCloseModal}
          entityType="partner"
        />
      )}
    </>
  )
}
