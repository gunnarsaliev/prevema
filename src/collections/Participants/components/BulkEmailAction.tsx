'use client'

import React, { useState, useEffect } from 'react'
import { useSelection, useAuth, useConfig } from '@payloadcms/ui'
import { Button } from '@payloadcms/ui'
import { BulkEmailModal } from '@/components/BulkEmailModal'

/**
 * Bulk Email Action Component
 * Displays a button in the Participants list view to send emails to selected participants
 */
export const BulkEmailAction: React.FC = () => {
  const { selected, selectAll, getQueryParams, count } = useSelection()
  const { user } = useAuth()
  const config = useConfig()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [participantIds, setParticipantIds] = useState<string[]>([])
  const [organizationId, setOrganizationId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleBulkEmail = async () => {
    setLoading(true)

    try {
      // Debug: Log the selection state
      console.log('🔍 DEBUG - useSelection state:')
      console.log('  selected:', selected)
      console.log('  selectAll:', selectAll)
      console.log('  count:', count)
      console.log('  type of selected:', typeof selected)

      // Get selected participant IDs
      // The selected object might be a Map or have different structure
      let ids: string[] = []

      if (selected) {
        if (typeof selected === 'object') {
          // Try different ways to extract IDs
          if (Array.isArray(selected)) {
            ids = selected.map(String)
            console.log('  ✅ selected is an array:', ids)
          } else if (selected instanceof Map) {
            ids = Array.from(selected.keys()).map(String)
            console.log('  ✅ selected is a Map:', ids)
          } else {
            // Assume it's a plain object like { "1": true, "2": true }
            ids = Object.keys(selected).filter((key) => selected[key])
            console.log('  ✅ selected is an object, filtered keys:', ids)
          }
        }
      }

      console.log('  📋 Final IDs:', ids)

      if (ids.length === 0) {
        alert('No participants selected. Please check console for debug info.')
        setLoading(false)
        return
      }

      // Fetch the first participant to get tenant ID
      console.log('📡 Fetching participant:', ids[0])
      const response = await fetch(`/api/participants/${ids[0]}?depth=1`)
      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        throw new Error(`Failed to fetch participant: ${response.status} ${response.statusText}`)
      }

      const participant = await response.json()
      console.log('👤 Participant data:', participant)

      const participantOrganizationId =
        typeof participant.organization === 'object'
          ? participant.organization.id
          : participant.organization

      console.log('🏢 Organization ID:', participantOrganizationId)
      console.log('📧 Setting state - IDs:', ids, 'Organization:', participantOrganizationId)

      setParticipantIds(ids)
      setOrganizationId(String(participantOrganizationId))
      setIsModalOpen(true)

      console.log('✅ Modal should be opening now')
    } catch (error) {
      console.error('❌ Failed to prepare bulk email:', error)
      alert(
        `Failed to prepare bulk email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    } finally {
      setLoading(false)
      console.log('🔄 Loading complete')
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setParticipantIds([])
    setOrganizationId('')
  }

  // Only show button if items are selected
  if (!count || count === 0) {
    return null
  }

  console.log(
    '🎨 Render - isModalOpen:',
    isModalOpen,
    'organizationId:',
    organizationId,
    'participantIds:',
    participantIds,
  )

  return (
    <>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--theme-elevation-150)' }}>
        <Button onClick={handleBulkEmail} buttonStyle="primary" size="small" disabled={loading}>
          {loading
            ? 'Loading...'
            : `Send Email to ${count} Selected Participant${count > 1 ? 's' : ''}`}
        </Button>
      </div>

      {isModalOpen && organizationId && participantIds.length > 0 ? (
        <>
          {console.log('🎨 Rendering BulkEmailModal with:', { participantIds, organizationId })}
          <BulkEmailModal
            participantIds={participantIds}
            organizationId={organizationId}
            onClose={handleCloseModal}
          />
        </>
      ) : (
        console.log('❌ Modal NOT rendering. Conditions:', {
          isModalOpen,
          organizationId,
          participantIdsLength: participantIds.length,
        })
      )}
    </>
  )
}
