'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2,
  ExternalLink,
  Mail,
  User,
  Building2,
  FileText,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import { EmailHistorySection } from '@/components/EmailHistorySection'
import type { Participant } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { getRelationName } from '@/lib/entity-actions'

const STATUS_LABEL: Record<string, string> = {
  'not-approved': 'Not Approved',
  approved: 'Approved',
  'need-info': 'Need Info',
  cancelled: 'Cancelled',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'not-approved': 'secondary',
  approved: 'default',
  'need-info': 'outline',
  cancelled: 'destructive',
}

interface Props {
  participantId: number | null
  open: boolean
  onClose: () => void
  onDelete?: (id: number, name: string) => void
}

export function ParticipantQuickView({ participantId, open, onClose, onDelete }: Props) {
  const router = useRouter()
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (participantId && open) {
      fetchParticipant(participantId)
    }
  }, [participantId, open])

  const fetchParticipant = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/participants/${id}?depth=1`)
      if (!response.ok) {
        throw new Error('Failed to fetch participant')
      }
      const data = await response.json()
      setParticipant(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (media: unknown): string | null => {
    if (!media) return null
    if (typeof media === 'object' && media !== null && 'url' in media) {
      return (media as { url: string }).url
    }
    return null
  }

  const profileImageUrl = participant ? getImageUrl(participant.imageUrl) : null
  const companyLogoUrl = participant ? getImageUrl(participant.companyLogoUrl) : null

  const handleEdit = () => {
    if (participant) {
      router.push(`/dash/participants/${participant.id}/edit`)
    }
  }

  const handleDelete = () => {
    if (participant && onDelete) {
      onDelete(participant.id, participant.name)
      onClose()
    }
  }

  return (
    <Drawer open={open} onOpenChange={onClose} direction="right">
      <DrawerContent className="w-[600px] max-w-full flex flex-col h-screen">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle>Participant Details</DrawerTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            </div>
          )}

          {participant && !loading && (
            <div className="p-6 space-y-6">
              {/* Profile Header with Image */}
              <div className="flex items-start gap-4">
                {profileImageUrl ? (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 bg-background flex-shrink-0">
                    <img
                      src={profileImageUrl}
                      alt={participant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative w-20 h-20 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold">{participant.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    <a href={`mailto:${participant.email}`} className="hover:underline">
                      {participant.email}
                    </a>
                  </p>
                </div>
              </div>

              {/* Basic Information */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Basic Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Event</dt>
                    <dd className="mt-1 text-sm">{getRelationName(participant.event)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Role</dt>
                    <dd className="mt-1 text-sm">{getRelationName(participant.participantRole)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Status</dt>
                    <dd className="mt-1">
                      <Badge variant={STATUS_VARIANT[participant.status ?? 'not-approved']}>
                        {STATUS_LABEL[participant.status ?? 'not-approved']}
                      </Badge>
                    </dd>
                  </div>
                  {participant.country && (
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">Country</dt>
                      <dd className="mt-1 text-sm">{participant.country}</dd>
                    </div>
                  )}
                  {participant.phoneNumber && (
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">Phone</dt>
                      <dd className="mt-1 text-sm">{participant.phoneNumber}</dd>
                    </div>
                  )}
                </div>
              </div>

              {/* Biography */}
              {participant.biography && (
                <div className="border-t pt-6">
                  <dt className="text-xs font-medium text-muted-foreground mb-2">Biography</dt>
                  <dd className="text-sm whitespace-pre-wrap">{participant.biography}</dd>
                </div>
              )}

              {/* Company Information */}
              {(participant.companyName ||
                participant.companyPosition ||
                participant.companyWebsite) && (
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Company Information</h3>
                  </div>
                  <div className="space-y-3">
                    {companyLogoUrl && (
                      <div className="w-16 h-16 rounded border bg-background p-2">
                        <img
                          src={companyLogoUrl}
                          alt="Company logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    {participant.companyName && (
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">Company</dt>
                        <dd className="mt-1 text-sm">{participant.companyName}</dd>
                      </div>
                    )}
                    {participant.companyPosition && (
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">Position</dt>
                        <dd className="mt-1 text-sm">{participant.companyPosition}</dd>
                      </div>
                    )}
                    {participant.companyWebsite && (
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">Website</dt>
                        <dd className="mt-1 text-sm">
                          <a
                            href={participant.companyWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            {participant.companyWebsite}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </dd>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Presentation Details */}
              {(participant.presentationTopic ||
                participant.presentationSummary ||
                participant.technicalRequirements) && (
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Presentation Details</h3>
                  </div>
                  <div className="space-y-3">
                    {participant.presentationTopic && (
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">Topic</dt>
                        <dd className="mt-1 text-sm">{participant.presentationTopic}</dd>
                      </div>
                    )}
                    {participant.presentationSummary && (
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">Summary</dt>
                        <dd className="mt-1 text-sm whitespace-pre-wrap">
                          {participant.presentationSummary}
                        </dd>
                      </div>
                    )}
                    {participant.technicalRequirements && (
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">
                          Technical Requirements
                        </dt>
                        <dd className="mt-1 text-sm whitespace-pre-wrap">
                          {participant.technicalRequirements}
                        </dd>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {participant.socialLinks && participant.socialLinks.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold mb-3">Social Links</h3>
                  <div className="flex flex-wrap gap-2">
                    {participant.socialLinks.map((link: any, index: number) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-sm"
                      >
                        {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Email History */}
              <EmailHistorySection recipientEmail={participant.email} className="border-t pt-6" />
            </div>
          )}
        </div>

        {/* Actions Footer */}
        {participant && !loading && (
          <div className="border-t p-4 flex gap-3">
            <Button onClick={handleEdit} className="flex-1">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            {onDelete && (
              <Button onClick={handleDelete} variant="destructive" className="flex-1">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}
