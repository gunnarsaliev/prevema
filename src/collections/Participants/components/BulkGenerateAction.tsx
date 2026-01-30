'use client'

import React, { useState } from 'react'
import { useSelection } from '@payloadcms/ui'
import { Button } from '@payloadcms/ui'
import { GenerationModal } from '@/components/GenerationModal'

/**
 * Bulk Generate Action Component
 * Displays a button in the Participants list view to generate images for selected participants
 */
export const BulkGenerateAction: React.FC = () => {
  const { selected, count } = useSelection()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [participantIds, setParticipantIds] = useState<string[]>([])

  const handleBulkGenerate = () => {
    // Get selected participant IDs
    let ids: string[] = []

    if (selected) {
      if (typeof selected === 'object') {
        // Handle different possible structures of selected
        if (Array.isArray(selected)) {
          ids = selected.map(String)
        } else if (selected instanceof Map) {
          ids = Array.from(selected.keys()).map(String)
        } else {
          // Assume it's a plain object like { "1": true, "2": true }
          ids = Object.keys(selected).filter((key) => selected[key])
        }
      }
    }

    // Validate at least one participant is selected
    if (ids.length === 0) {
      alert('No participants selected. Please select at least one participant.')
      return
    }

    setParticipantIds(ids)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setParticipantIds([])
  }

  // Only show button if items are selected
  if (!count || count === 0) {
    return null
  }

  return (
    <>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--theme-elevation-150)' }}>
        <Button onClick={handleBulkGenerate} buttonStyle="secondary" size="small">
          Generate Images for {count} Selected Participant{count > 1 ? 's' : ''}
        </Button>
      </div>

      {isModalOpen && participantIds.length > 0 && (
        <GenerationModal participantIds={participantIds} onClose={handleCloseModal} />
      )}
    </>
  )
}
