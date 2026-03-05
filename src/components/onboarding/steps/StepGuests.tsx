'use client'

import { useState } from 'react'
import { Users, X, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  createParticipantTypeAction,
  createPartnerTypeAction,
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
  onGuestsConfigured?: (participantTypeIds: number[], partnerTypeIds: number[]) => void
  onNext?: () => void
}

const participantFieldOptions = [
  { label: 'Profile Photo', value: 'imageUrl' },
  { label: 'Biography', value: 'biography' },
  { label: 'Company Name', value: 'companyName' },
  { label: 'Company Position', value: 'companyPosition' },
]

const partnerFieldOptions = [
  { label: 'Company Logo', value: 'companyLogo' },
  { label: 'Company Description', value: 'companyDescription' },
  { label: 'Company Website URL', value: 'companyWebsiteUrl' },
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
  const [participantTypes, setParticipantTypes] = useState<GuestType[]>([])
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

  // Add participant type
  const handleAddParticipantType = async () => {
    if (!participantName.trim()) {
      setParticipantError('Please enter a name')
      return
    }

    setParticipantLoading(true)
    setParticipantError('')

    try {
      const formData = new FormData()
      formData.append('name', participantName)
      participantFields.forEach((field) => formData.append('requiredFields', field))

      const result = await createParticipantTypeAction(organizationId, eventId, formData)

      if (result.success && result.data) {
        setParticipantTypes([...participantTypes, result.data])
        setParticipantName('')
        onValidationChange(stepIndex, true)
      } else {
        setParticipantError(result.message || 'Failed to create participant type')
      }
    } catch (error) {
      setParticipantError('An error occurred. Please try again.')
    } finally {
      setParticipantLoading(false)
    }
  }

  // Add partner type
  const handleAddPartnerType = async () => {
    if (!partnerName.trim()) {
      setPartnerError('Please enter a name')
      return
    }

    setPartnerLoading(true)
    setPartnerError('')

    try {
      const formData = new FormData()
      formData.append('name', partnerName)
      partnerFields.forEach((field) => formData.append('requiredFields', field))

      const result = await createPartnerTypeAction(organizationId, eventId, formData)

      if (result.success && result.data) {
        setPartnerTypes([...partnerTypes, result.data])
        setPartnerName('')
        onValidationChange(stepIndex, true)
      } else {
        setPartnerError(result.message || 'Failed to create partner type')
      }
    } catch (error) {
      setPartnerError('An error occurred. Please try again.')
    } finally {
      setPartnerLoading(false)
    }
  }

  // Remove participant type (optimistic UI update)
  const removeParticipantType = (id: number) => {
    setParticipantTypes(participantTypes.filter((type) => type.id !== id))
  }

  // Remove partner type (optimistic UI update)
  const removePartnerType = (id: number) => {
    setPartnerTypes(partnerTypes.filter((type) => type.id !== id))
  }

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex flex-col items-center gap-3 mb-6">
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

        {/* Participant Types */}
        <div className="space-y-4 shadow-lg bg-green-200 rounded-md p-4">
          <h3 className="font-semibold text-foreground">Participant Types</h3>
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
              <Label className="text-sm">Required fields</Label>
              <div className="space-y-2">
                {participantFieldOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`participant-${option.value}`}
                      checked={participantFields.includes(option.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setParticipantFields([...participantFields, option.value])
                        } else {
                          setParticipantFields(participantFields.filter((f) => f !== option.value))
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
            </div>

            {participantError && <p className="text-xs text-destructive">{participantError}</p>}

            <Button
              type="button"
              onClick={handleAddParticipantType}
              size="sm"
              className="w-full"
              disabled={participantLoading || !participantName.trim()}
            >
              {participantLoading ? 'Adding...' : '+ Add Participant Type'}
            </Button>
          </div>

          {/* List of created participant types */}
          {participantTypes.length > 0 && (
            <div className="space-y-2 mt-4">
              <Label className="text-sm">Created types</Label>
              {participantTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center justify-between p-2 rounded-md bg-muted"
                >
                  <span className="text-sm font-medium">{type.name}</span>
                  <div className="flex items-center gap-2">
                    {type.publicFormLink && (
                      <a
                        href={type.publicFormLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        title="View public form"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => removeParticipantType(type.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Partner Types */}
        <div className="space-y-4 shadow-lg bg-green-50 rounded-md p-4">
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
              <Label className="text-sm">Required fields</Label>
              <div className="space-y-2">
                {partnerFieldOptions.map((option) => (
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

          {/* List of created partner types */}
          {partnerTypes.length > 0 && (
            <div className="space-y-2 mt-4">
              <Label className="text-sm">Created types</Label>
              {partnerTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center justify-between p-2 rounded-md bg-muted"
                >
                  <span className="text-sm font-medium">{type.name}</span>
                  <div className="flex items-center gap-2">
                    {type.publicFormLink && (
                      <a
                        href={type.publicFormLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
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
            </div>
          )}
        </div>
      </div>

      {/* Skip button */}
      <div className="flex justify-center mt-6">
        <Button type="button" variant="outline" onClick={onNext} className="min-w-[200px]">
          {participantTypes.length > 0 || partnerTypes.length > 0 ? 'Continue' : 'Skip this step'}
        </Button>
      </div>
    </div>
  )
}
