'use client'

import { useState, useEffect } from 'react'
import { Users, X, ExternalLink, ChevronDown } from 'lucide-react'
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

// Advanced participant fields (in collapsible)
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

// Basic partner fields (shown by default)
const partnerBasicFields = [
  { label: 'Company Logo', value: 'companyLogo' },
  { label: 'Company Description', value: 'companyDescription' },
  { label: 'Company Website URL', value: 'companyWebsiteUrl' },
]

// Advanced partner fields (in collapsible)
const partnerAdvancedFields = [
  { label: 'Company Logo URL', value: 'companyLogoUrl' },
  { label: 'Company Banner', value: 'companyBanner' },
  { label: 'Field of Expertise', value: 'fieldOfExpertise' },
  { label: 'Email', value: 'email' },
  { label: 'Social Links', value: 'socialLinks' },
  { label: 'Sponsorship Level', value: 'sponsorshipLevel' },
  { label: 'Additional Notes', value: 'additionalNotes' },
]

export const StepGuests = ({
  stepIndex,
  onValidationChange,
  organizationId,
  eventId,
  onGuestsConfigured,
  onNext,
}: StepGuestsProps) => {
  // Participant state
  const [participantName, setParticipantName] = useState('')
  const [participantFields, setParticipantFields] = useState<string[]>([
    'imageUrl',
    'biography',
    'companyName',
  ])
  const [participantRoles, setParticipantRoles] = useState<GuestType[]>([])
  const [participantLoading, setParticipantLoading] = useState(false)

  // Partner state
  const [partnerName, setPartnerName] = useState('')
  const [partnerFields, setPartnerFields] = useState<string[]>([
    'companyLogo',
    'companyDescription',
  ])
  const [partnerTypes, setPartnerTypes] = useState<GuestType[]>([])
  const [partnerLoading, setPartnerLoading] = useState(false)

  // Error states
  const [participantError, setParticipantError] = useState('')
  const [partnerError, setPartnerError] = useState('')
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Collapsible states for advanced options
  const [participantAdvancedOpen, setParticipantAdvancedOpen] = useState(false)
  const [partnerAdvancedOpen, setPartnerAdvancedOpen] = useState(false)

  // Fetch existing types on mount
  useEffect(() => {
    const fetchTypes = async () => {
      setIsInitialLoading(true)
      const [participantResult, partnerResult] = await Promise.all([
        getParticipantRolesAction(organizationId, eventId),
        getPartnerTypesAction(organizationId, eventId),
      ])

      if (participantResult.success && participantResult.data) {
        setParticipantRoles(participantResult.data)
      }

      if (partnerResult.success && partnerResult.data) {
        setPartnerTypes(partnerResult.data)
      }

      setIsInitialLoading(false)
    }

    fetchTypes()
  }, [organizationId, eventId])

  // Add participant role
  const handleAddParticipantRole = async () => {
    if (!participantName.trim()) {
      setParticipantError('Please enter a name')
      return
    }

    setParticipantLoading(true)
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

    setParticipantLoading(false)
  }

  // Add partner type
  const handleAddPartnerType = async () => {
    if (!partnerName.trim()) {
      setPartnerError('Please enter a name')
      return
    }

    setPartnerLoading(true)
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

    setPartnerLoading(false)
  }

  // Remove participant role
  const removeParticipantRole = async (id: number) => {
    // Capture the item before deletion for potential revert
    const itemToDelete = participantRoles.find((type) => type.id === id)

    // Optimistically remove from UI
    setParticipantRoles((prev) => prev.filter((type) => type.id !== id))

    // Delete from database in the background
    const result = await deleteParticipantRoleAction(organizationId, id)

    if (!result.success) {
      // If deletion fails, revert by re-adding the item
      console.error('Failed to delete participant role:', result.message)
      if (itemToDelete) {
        setParticipantRoles((prev) => [...prev, itemToDelete])
      }
    }
  }

  // Remove partner type
  const removePartnerType = async (id: number) => {
    // Capture the item before deletion for potential revert
    const itemToDelete = partnerTypes.find((type) => type.id === id)

    // Optimistically remove from UI
    setPartnerTypes((prev) => prev.filter((type) => type.id !== id))

    // Delete from database in the background
    const result = await deletePartnerTypeAction(organizationId, id)

    if (!result.success) {
      // If deletion fails, revert by re-adding the item
      console.error('Failed to delete partner type:', result.message)
      if (itemToDelete) {
        setPartnerTypes((prev) => [...prev, itemToDelete])
      }
    }
  }

  return (
    <div className="space-y-6 mb-6">
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-4">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Set up guest types for your event
        </p>
        <p className="text-xs text-muted-foreground text-center max-w-md">
          You can skip this step and add guest types later, or add them now to get shareable
          registration links
        </p>
      </div>

      {/* Forms to add new types */}
      <div className="space-y-4">
        {/* Participant Roles */}
        <div className="space-y-4 shadow-lg bg-white dark:bg-gray-950 rounded-md p-4">
          <h3 className="font-semibold text-foreground">Participant Roles</h3>
          <p className="text-xs text-muted-foreground">Speakers, attendees, presenters, etc.</p>

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
                disabled={participantLoading}
              />
            </div>

            <div className="space-y-2">
              {/* Advanced options collapsible */}
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
                    {/* Basic fields */}
                    {participantBasicFields.map((option) => (
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

                    {/* Advanced fields */}
                    {participantAdvancedFields.map((option) => (
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
              disabled={participantLoading || !participantName.trim()}
            >
              {participantLoading ? 'Adding...' : '+ Add Participant Role'}
            </Button>
          </div>
        </div>

        {/* Partner Types */}
        <div className="space-y-4 shadow-lg bg-white dark:bg-gray-950 rounded-md p-4">
          <h3 className="font-semibold text-foreground">Partner Types</h3>
          <p className="text-xs text-muted-foreground">Sponsors, exhibitors, vendors, etc.</p>

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
                disabled={partnerLoading}
              />
            </div>

            <div className="space-y-2">
              {/* Advanced options collapsible */}
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
                    {/* Basic fields */}
                    {partnerBasicFields.map((option) => (
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

                    {/* Advanced fields */}
                    {partnerAdvancedFields.map((option) => (
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
              disabled={partnerLoading || !partnerName.trim()}
            >
              {partnerLoading ? 'Adding...' : '+ Add Partner Type'}
            </Button>
          </div>
        </div>
      </div>

      {/* Created Types */}
      {(isInitialLoading ||
        participantRoles.length > 0 ||
        partnerTypes.length > 0 ||
        participantLoading ||
        partnerLoading) && (
        <div className="shadow-lg p-4">
          {/* Participant roles list */}
          {(participantRoles.length > 0 || participantLoading) && (
            <div className="space-y-2 mb-4">
              <Label className="text-xs text-muted-foreground">Participants</Label>
              {participantRoles.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/50 dark:bg-muted/20"
                >
                  <span className="text-sm font-medium truncate flex-1">{type.name}</span>
                  <div className="flex items-center gap-1">
                    {type.publicFormLink && (
                      <a
                        href={type.publicFormLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                        title="View public form"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => removeParticipantRole(type.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {participantLoading && (
                <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 dark:bg-muted/20">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-4" />
                </div>
              )}
            </div>
          )}

          {/* Partner types list */}
          {(partnerTypes.length > 0 || partnerLoading) && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Partners</Label>
              {partnerTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/50 dark:bg-muted/20"
                >
                  <span className="text-sm font-medium truncate flex-1">{type.name}</span>
                  <div className="flex items-center gap-1">
                    {type.publicFormLink && (
                      <a
                        href={type.publicFormLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                        title="View public form"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => removePartnerType(type.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {partnerLoading && (
                <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 dark:bg-muted/20">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-4" />
                </div>
              )}
            </div>
          )}

          {/* Initial loading state */}
          {isInitialLoading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 mb-2" />
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 dark:bg-muted/20">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 dark:bg-muted/20">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-4" />
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isInitialLoading &&
            participantRoles.length === 0 &&
            partnerTypes.length === 0 &&
            !participantLoading &&
            !partnerLoading && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No types created yet. Add participant or partner types to see them here.
              </p>
            )}
        </div>
      )}

      {/* Skip/Continue button - always visible */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={onNext}
          className="min-w-[200px]"
          disabled={isInitialLoading}
        >
          {participantRoles.length > 0 || partnerTypes.length > 0 ? 'Continue' : 'Skip this step'}
        </Button>
      </div>
    </div>
  )
}
