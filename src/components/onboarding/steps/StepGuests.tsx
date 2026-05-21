'use client'

import { useEffect, useState } from 'react'
import { Users, X, ExternalLink, ChevronDown, Copy, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  createParticipantRoleAction,
  createPartnerTypeAction,
  getParticipantRolesAction,
  getPartnerTypesAction,
  deleteParticipantRoleAction,
  deletePartnerTypeAction,
} from '@/app/(frontend)/onboarding/actions'
import { ONBOARDING_KEYS, useSessionState } from '../useOnboardingPersistence'

interface GuestType {
  id: number
  name: string
  publicFormLink: string
}

interface StepGuestsProps {
  stepIndex: number
  onValidationChange: (stepIndex: number, isValid: boolean) => void
  organizationId: number
  eventId: number
  onGuestsConfigured?: (participantRoleIds: number[], partnerTypeIds: number[]) => void
  onNext?: () => void
}

// Basic participant fields (shown by default)
const participantBasicFields = [
  { label: 'Profile Photo', value: 'imageUrl' },
  { label: 'Biography', value: 'biography' },
  { label: 'Company Name', value: 'companyName' },
  { label: 'Company Position', value: 'companyPosition' },
]

const participantAdvancedFields = [
  { label: 'Country', value: 'country' },
  { label: 'Phone Number', value: 'phoneNumber' },
  { label: 'Company Logo', value: 'companyLogoUrl' },
  { label: 'Company Website', value: 'companyWebsite' },
  { label: 'Social Links', value: 'socialLinks' },
  { label: 'Presentation Topic', value: 'presentationTopic' },
  { label: 'Presentation Summary', value: 'presentationSummary' },
  { label: 'Technical Requirements', value: 'technicalRequirements' },
]

const partnerBasicFields = [
  { label: 'Company Logo', value: 'companyLogo' },
  { label: 'Company Description', value: 'companyDescription' },
  { label: 'Company Website URL', value: 'companyWebsiteUrl' },
]

const partnerAdvancedFields = [
  { label: 'Company Logo URL', value: 'companyLogoUrl' },
  { label: 'Company Banner', value: 'companyBanner' },
  { label: 'Field of Expertise', value: 'fieldOfExpertise' },
  { label: 'Email', value: 'email' },
  { label: 'Social Links', value: 'socialLinks' },
  { label: 'Sponsorship Level', value: 'sponsorshipLevel' },
  { label: 'Additional Notes', value: 'additionalNotes' },
]

interface GuestTypeRowProps {
  type: GuestType
  pendingDeletion: boolean
  onRemove: (id: number) => void
}

const GuestTypeRow = ({ type, pendingDeletion, onRemove }: GuestTypeRowProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!type.publicFormLink) return
    try {
      const absolute = type.publicFormLink.startsWith('http')
        ? type.publicFormLink
        : typeof window !== 'undefined'
          ? `${window.location.origin}${type.publicFormLink}`
          : type.publicFormLink
      await navigator.clipboard.writeText(absolute)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  if (pendingDeletion) {
    return (
      <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-background">
        <Skeleton className="h-4 w-40" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-md" />
          <Skeleton className="h-6 w-6 rounded-md" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors">
      <span className="text-sm font-medium truncate flex-1">{type.name}</span>
      <div className="flex items-center gap-1.5 ml-2 shrink-0">
        {type.publicFormLink && (
          <a
            href={type.publicFormLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 border border-primary/30 rounded-full px-2 py-0.5 hover:bg-primary/5 transition-colors"
            title="Open registration form"
          >
            <ExternalLink className="h-3 w-3" />
            Form
          </a>
        )}
        {type.publicFormLink && (
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Copy link"
            title={copied ? 'Copied!' : 'Copy link'}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(type.id)}
          className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label="Remove"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export const StepGuests = ({
  stepIndex,
  onValidationChange,
  organizationId,
  eventId,
  onGuestsConfigured,
  onNext,
}: StepGuestsProps) => {
  // Persisted input state
  const [participantName, setParticipantName] = useSessionState(
    ONBOARDING_KEYS.guests.participantName,
    '',
  )
  const [participantFields, setParticipantFields] = useSessionState<string[]>(
    ONBOARDING_KEYS.guests.participantFields,
    ['imageUrl', 'biography', 'companyName'],
  )
  const [partnerName, setPartnerName] = useSessionState(ONBOARDING_KEYS.guests.partnerName, '')
  const [partnerFields, setPartnerFields] = useSessionState<string[]>(
    ONBOARDING_KEYS.guests.partnerFields,
    ['companyLogo', 'companyDescription'],
  )

  // Server-side data + busy flags
  const [participantRoles, setParticipantRoles] = useState<GuestType[]>([])
  const [partnerTypes, setPartnerTypes] = useState<GuestType[]>([])
  const [participantBusy, setParticipantBusy] = useState(false)
  const [partnerBusy, setPartnerBusy] = useState(false)
  const [pendingDeleteParticipant, setPendingDeleteParticipant] = useState<number | null>(null)
  const [pendingDeletePartner, setPendingDeletePartner] = useState<number | null>(null)

  const [participantError, setParticipantError] = useState('')
  const [partnerError, setPartnerError] = useState('')
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const [participantAdvancedOpen, setParticipantAdvancedOpen] = useState(false)
  const [partnerAdvancedOpen, setPartnerAdvancedOpen] = useState(false)

  // Fetch existing types on mount
  useEffect(() => {
    let cancelled = false
    const fetchTypes = async () => {
      setIsInitialLoading(true)
      const [participantResult, partnerResult] = await Promise.all([
        getParticipantRolesAction(organizationId, eventId),
        getPartnerTypesAction(organizationId, eventId),
      ])
      if (cancelled) return

      if (participantResult.success && participantResult.data) {
        setParticipantRoles(participantResult.data)
      }
      if (partnerResult.success && partnerResult.data) {
        setPartnerTypes(partnerResult.data)
      }
      setIsInitialLoading(false)
    }

    fetchTypes()
    return () => {
      cancelled = true
    }
  }, [organizationId, eventId])

  // Notify parent of changes
  useEffect(() => {
    onGuestsConfigured?.(
      participantRoles.map((r) => r.id),
      partnerTypes.map((p) => p.id),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participantRoles, partnerTypes])

  const handleAddParticipantRole = async () => {
    if (!participantName.trim()) {
      setParticipantError('Please enter a name')
      return
    }

    setParticipantBusy(true)
    setParticipantError('')

    const formData = new FormData()
    formData.append('name', participantName)
    participantFields.forEach((field) => formData.append('requiredFields', field))

    const result = await createParticipantRoleAction(organizationId, formData)

    if (result.success && result.data) {
      setParticipantRoles((prev) => [...prev, result.data as GuestType])
      setParticipantName('')
      onValidationChange(stepIndex, true)
    } else {
      setParticipantError(result.message || 'Failed to create participant role')
    }

    setParticipantBusy(false)
  }

  const handleAddPartnerType = async () => {
    if (!partnerName.trim()) {
      setPartnerError('Please enter a name')
      return
    }

    setPartnerBusy(true)
    setPartnerError('')

    const formData = new FormData()
    formData.append('name', partnerName)
    partnerFields.forEach((field) => formData.append('requiredFields', field))

    const result = await createPartnerTypeAction(organizationId, formData)

    if (result.success && result.data) {
      setPartnerTypes((prev) => [...prev, result.data as GuestType])
      setPartnerName('')
      onValidationChange(stepIndex, true)
    } else {
      setPartnerError(result.message || 'Failed to create partner type')
    }

    setPartnerBusy(false)
  }

  const removeParticipantRole = async (id: number) => {
    setPendingDeleteParticipant(id)
    const result = await deleteParticipantRoleAction(organizationId, id)
    if (result.success) {
      setParticipantRoles((prev) => prev.filter((type) => type.id !== id))
    } else {
      console.error('Failed to delete participant role:', result.message)
    }
    setPendingDeleteParticipant(null)
  }

  const removePartnerType = async (id: number) => {
    setPendingDeletePartner(id)
    const result = await deletePartnerTypeAction(organizationId, id)
    if (result.success) {
      setPartnerTypes((prev) => prev.filter((type) => type.id !== id))
    } else {
      console.error('Failed to delete partner type:', result.message)
    }
    setPendingDeletePartner(null)
  }

  const hasItems = participantRoles.length > 0 || partnerTypes.length > 0
  const isAnythingBusy =
    isInitialLoading ||
    participantBusy ||
    partnerBusy ||
    pendingDeleteParticipant !== null ||
    pendingDeletePartner !== null

  return (
    <div className="space-y-6 mb-6 w-full max-w-lg mx-auto">
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-4">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Set up guest types for your event
        </p>
        <p className="text-xs text-muted-foreground text-center max-w-md">
          Add participant roles and partner types to get shareable registration links you can send
          to your audience.
        </p>
      </div>

      {/* Forms to add new types */}
      <div className="space-y-4">
        {/* Participant Roles */}
        <div className="space-y-4 shadow-sm border border-border bg-card rounded-xl p-5">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-1.5">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Participant Roles</h3>
              <p className="text-xs text-muted-foreground">
                Speakers, attendees, presenters, etc.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="participantName" className="text-sm">
                Type name
              </Label>
              <Input
                id="participantName"
                type="text"
                placeholder="e.g., Speaker, Attendee"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="bg-background"
                disabled={participantBusy}
              />
            </div>

            <div className="space-y-2">
              <Collapsible open={participantAdvancedOpen} onOpenChange={setParticipantAdvancedOpen}>
                <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${participantAdvancedOpen ? 'rotate-180' : ''}`}
                  />
                  Advanced options
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <Label className="text-sm mb-2 block">Customize form fields</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[...participantBasicFields, ...participantAdvancedFields].map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`participant-${option.value}`}
                          checked={participantFields.includes(option.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setParticipantFields([...participantFields, option.value])
                            } else {
                              setParticipantFields(
                                participantFields.filter((f) => f !== option.value),
                              )
                            }
                          }}
                          className="bg-background"
                        />
                        <label
                          htmlFor={`participant-${option.value}`}
                          className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {participantError && <p className="text-xs text-destructive">{participantError}</p>}

            <Button
              type="button"
              onClick={handleAddParticipantRole}
              size="sm"
              className="w-full"
              disabled={participantBusy || !participantName.trim()}
            >
              {participantBusy ? 'Adding...' : '+ Add Participant Role'}
            </Button>
          </div>
        </div>

        {/* Partner Types */}
        <div className="space-y-4 shadow-sm border border-border bg-card rounded-xl p-5">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-1.5">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Partner Types</h3>
              <p className="text-xs text-muted-foreground">
                Sponsors, exhibitors, vendors, etc.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="partnerName" className="text-sm">
                Type name
              </Label>
              <Input
                id="partnerName"
                type="text"
                placeholder="e.g., Sponsor, Exhibitor"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                className="bg-background"
                disabled={partnerBusy}
              />
            </div>

            <div className="space-y-2">
              <Collapsible open={partnerAdvancedOpen} onOpenChange={setPartnerAdvancedOpen}>
                <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${partnerAdvancedOpen ? 'rotate-180' : ''}`}
                  />
                  Advanced options
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <Label className="text-sm mb-2 block">Customize form fields</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[...partnerBasicFields, ...partnerAdvancedFields].map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`partner-${option.value}`}
                          checked={partnerFields.includes(option.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setPartnerFields([...partnerFields, option.value])
                            } else {
                              setPartnerFields(partnerFields.filter((f) => f !== option.value))
                            }
                          }}
                          className="bg-background"
                        />
                        <label
                          htmlFor={`partner-${option.value}`}
                          className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {partnerError && <p className="text-xs text-destructive">{partnerError}</p>}

            <Button
              type="button"
              onClick={handleAddPartnerType}
              size="sm"
              className="w-full"
              disabled={partnerBusy || !partnerName.trim()}
            >
              {partnerBusy ? 'Adding...' : '+ Add Partner Type'}
            </Button>
          </div>
        </div>
      </div>

      {/* Created Types */}
      {isInitialLoading ? (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        </div>
      ) : hasItems || participantBusy || partnerBusy ? (
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Created types
          </p>

          {(participantRoles.length > 0 || participantBusy) && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3 w-3" />
                Participant Roles
              </p>
              {participantRoles.map((type) => (
                <GuestTypeRow
                  key={type.id}
                  type={type}
                  pendingDeletion={pendingDeleteParticipant === type.id}
                  onRemove={removeParticipantRole}
                />
              ))}
              {participantBusy && (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-background">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-6 w-14 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded-md" />
                    <Skeleton className="h-6 w-6 rounded-md" />
                  </div>
                </div>
              )}
            </div>
          )}

          {(partnerTypes.length > 0 || partnerBusy) && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3 w-3" />
                Partner Types
              </p>
              {partnerTypes.map((type) => (
                <GuestTypeRow
                  key={type.id}
                  type={type}
                  pendingDeletion={pendingDeletePartner === type.id}
                  onRemove={removePartnerType}
                />
              ))}
              {partnerBusy && (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-background">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-6 w-14 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded-md" />
                    <Skeleton className="h-6 w-6 rounded-md" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* Continue / Skip as a link */}
      <div className="flex flex-col items-center gap-3 pt-2">
        {hasItems && (
          <Button
            type="button"
            onClick={onNext}
            className="min-w-[200px]"
            disabled={isAnythingBusy}
          >
            Continue
          </Button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={isAnythingBusy}
          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 disabled:opacity-50"
        >
          {hasItems ? 'Skip and continue later' : 'Skip this step'}
        </button>
      </div>
    </div>
  )
}
