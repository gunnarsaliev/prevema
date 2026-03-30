'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ExternalLink, Mail, Building2, FileText, Handshake, Pencil, Trash2, X } from 'lucide-react'
import type { Partner } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { getRelationName } from '@/lib/entity-actions'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  default: 'secondary',
  contacted: 'default',
  confirmed: 'default',
  declined: 'destructive',
}

interface Props {
  partnerId: number | null
  open: boolean
  onClose: () => void
  onDelete?: (id: number, companyName: string) => void
}

export function PartnerQuickView({ partnerId, open, onClose, onDelete }: Props) {
  const router = useRouter()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (partnerId && open) {
      fetchPartner(partnerId)
    }
  }, [partnerId, open])

  const fetchPartner = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/partners/${id}?depth=1`)
      if (!response.ok) {
        throw new Error('Failed to fetch partner')
      }
      const data = await response.json()
      setPartner(data)
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

  const companyLogoUrl = partner ? getImageUrl(partner.companyLogo) || partner.companyLogoUrl : null
  const companyBannerUrl = partner ? getImageUrl(partner.companyBanner) : null

  const handleEdit = () => {
    if (partner) {
      router.push(`/dash/partners/${partner.id}/edit`)
    }
  }

  const handleDelete = () => {
    if (partner && onDelete) {
      onDelete(partner.id, partner.companyName)
      onClose()
    }
  }

  return (
    <Drawer open={open} onOpenChange={onClose} direction="right">
      <DrawerContent className="w-[600px] max-w-full flex flex-col h-screen">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle>Partner Details</DrawerTitle>
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

          {partner && !loading && (
            <div className="p-6 space-y-6">
              {/* Company Header with Logo/Banner */}
              {companyBannerUrl && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={companyBannerUrl}
                    alt="Company banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-start gap-4">
                {companyLogoUrl && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border bg-background flex-shrink-0">
                    <img
                      src={companyLogoUrl}
                      alt="Company logo"
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold">{partner.companyName}</h2>
                  {partner.fieldOfExpertise && (
                    <p className="text-sm text-muted-foreground mt-1">{partner.fieldOfExpertise}</p>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Basic Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Event</dt>
                    <dd className="mt-1 text-sm">{getRelationName(partner.event)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Partner Type</dt>
                    <dd className="mt-1 text-sm">{getRelationName(partner.partnerType)}</dd>
                  </div>
                  {partner.tier && (
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">Tier</dt>
                      <dd className="mt-1 text-sm">{getRelationName(partner.tier)}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Status</dt>
                    <dd className="mt-1">
                      <Badge variant={STATUS_VARIANT[partner.status ?? 'default']}>
                        {partner.status ?? 'default'}
                      </Badge>
                    </dd>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Contact Information</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Contact Person</dt>
                    <dd className="mt-1 text-sm">{partner.contactPerson}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Contact Email</dt>
                    <dd className="mt-1 text-sm">
                      <a href={`mailto:${partner.contactEmail}`} className="text-primary hover:underline">
                        {partner.contactEmail}
                      </a>
                    </dd>
                  </div>
                  {partner.email && (
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">Company Email</dt>
                      <dd className="mt-1 text-sm">
                        <a href={`mailto:${partner.email}`} className="text-primary hover:underline">
                          {partner.email}
                        </a>
                      </dd>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Details */}
              {(partner.companyWebsiteUrl || partner.companyDescription) && (
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Company Details</h3>
                  </div>
                  <div className="space-y-3">
                    {partner.companyWebsiteUrl && (
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">Website</dt>
                        <dd className="mt-1 text-sm">
                          <a
                            href={partner.companyWebsiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            {partner.companyWebsiteUrl}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </dd>
                      </div>
                    )}
                    {partner.companyDescription && (
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">Description</dt>
                        <dd className="mt-1 text-sm whitespace-pre-wrap">{partner.companyDescription}</dd>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Partnership Details */}
              {(partner.sponsorshipLevel || partner.additionalNotes) && (
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Handshake className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Partnership Details</h3>
                  </div>
                  <div className="space-y-3">
                    {partner.sponsorshipLevel && (
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">Sponsorship Level</dt>
                        <dd className="mt-1 text-sm">{partner.sponsorshipLevel}</dd>
                      </div>
                    )}
                    {partner.additionalNotes && (
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">Additional Notes</dt>
                        <dd className="mt-1 text-sm whitespace-pre-wrap">{partner.additionalNotes}</dd>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {partner.socialLinks && partner.socialLinks.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold mb-3">Social Links</h3>
                  <div className="flex flex-wrap gap-2">
                    {partner.socialLinks.map((link: any, index: number) => (
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
            </div>
          )}
        </div>

        {/* Actions Footer */}
        {partner && !loading && (
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
