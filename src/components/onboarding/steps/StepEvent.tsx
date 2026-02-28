'use client'

import { useState, useActionState, startTransition, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createEventAction } from '@/app/(frontend)/onboarding/actions'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
} from '@/components/ui/file-upload'

interface StepEventProps {
  stepIndex: number
  onValidationChange: (stepIndex: number, isValid: boolean) => void
  organizationId: number
  onEventCreated?: (eventId: number, eventName: string) => void
  onNext?: () => void
}

export const StepEvent = ({
  stepIndex,
  onValidationChange,
  organizationId,
  onEventCreated,
  onNext,
}: StepEventProps) => {
  const [eventName, setEventName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [eventType, setEventType] = useState('online')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [showOptional, setShowOptional] = useState(false)

  const boundAction = createEventAction.bind(null, organizationId)
  const [state, formAction, isPending] = useActionState(boundAction, undefined)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    // Add image file if selected
    if (imageFiles.length > 0) {
      formData.set('image', imageFiles[0])
    }

    startTransition(() => {
      formAction(formData)
    })
  }

  // Update validation when required fields change
  const updateValidation = () => {
    const isValid = eventName.trim().length >= 3 && startDate.trim().length > 0
    onValidationChange(stepIndex, isValid)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventName(e.target.value)
    updateValidation()
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value)
    updateValidation()
  }

  // Handle successful event creation and auto-advance
  useEffect(() => {
    if (state?.success && state?.data && !isPending) {
      if (onEventCreated) {
        onEventCreated(state.data.id, state.data.name)
      }
      // Auto-advance to next step after a short delay
      const timer = setTimeout(() => {
        onNext?.()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [state?.success, state?.data, isPending, onEventCreated, onNext])

  return (
    <div className="flex min-h-[40.5dvh] w-full flex-col items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
        {/* Success message */}
        {state?.success && (
          <div className="rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 p-3">
            <p className="text-sm text-green-800 dark:text-green-200">
              Event "{state.data?.name}" created successfully!
            </p>
          </div>
        )}

        {/* Error message */}
        {state?.message && !state.success && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive">{state.message}</p>
          </div>
        )}

        {!state?.success && (
          <>
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Now let's create your first event
              </p>
            </div>

            {/* Event Image Upload */}
            <div className="space-y-2">
              <Label className="text-foreground">Event Image (optional)</Label>
              <FileUpload
                value={imageFiles}
                onValueChange={setImageFiles}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                maxFiles={1}
                maxSize={5 * 1024 * 1024}
              >
                <FileUploadDropzone className="bg-background">
                  <div className="flex flex-col items-center justify-center gap-2 py-6">
                    <div className="rounded-full bg-muted p-3">
                      <svg
                        className="h-5 w-5 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium">Drop image or click to browse</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG (max 5MB)</p>
                    </div>
                  </div>
                </FileUploadDropzone>
                <FileUploadList>
                  {imageFiles.map((file, index) => (
                    <FileUploadItem key={index} value={file} className="bg-background">
                      <FileUploadItemPreview />
                      <FileUploadItemMetadata />
                      <FileUploadItemDelete className="ml-auto">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </FileUploadItemDelete>
                    </FileUploadItem>
                  ))}
                </FileUploadList>
              </FileUpload>
            </div>

            {/* Event Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Event name *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Tech Conference 2024"
                value={eventName}
                onChange={handleNameChange}
                required
                minLength={3}
                className="bg-background"
                disabled={isPending}
                aria-invalid={!!state?.errors?.name}
              />
              {state?.errors?.name && (
                <p className="text-sm text-destructive">{state.errors.name[0]}</p>
              )}
            </div>

            {/* Start Date & Event Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-foreground">
                  Start date *
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={handleDateChange}
                  required
                  className="bg-background"
                  disabled={isPending}
                  aria-invalid={!!state?.errors?.startDate}
                />
                {state?.errors?.startDate && (
                  <p className="text-sm text-destructive">{state.errors.startDate[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventType" className="text-foreground">
                  Event type
                </Label>
                <select
                  id="eventType"
                  name="eventType"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isPending}
                >
                  <option value="online">Online</option>
                  <option value="physical">Physical</option>
                </select>
              </div>
            </div>

            {/* Address (conditional) */}
            {eventType === 'physical' && (
              <div className="space-y-2">
                <Label htmlFor="address" className="text-foreground">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="123 Main St, City"
                  className="bg-background"
                  disabled={isPending}
                />
              </div>
            )}

            {/* Theme */}
            <div className="space-y-2">
              <Label htmlFor="theme" className="text-foreground">
                Theme / tagline
              </Label>
              <Input
                id="theme"
                name="theme"
                type="text"
                placeholder="Inspiring the future of tech"
                className="bg-background"
                disabled={isPending}
              />
            </div>

            {/* Why */}
            <div className="space-y-2">
              <Label htmlFor="why" className="text-foreground">
                Why
              </Label>
              <Textarea
                id="why"
                name="why"
                placeholder="Why this event is happening..."
                className="bg-background"
                rows={2}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">The purpose and motivation behind your event</p>
            </div>

            {/* What */}
            <div className="space-y-2">
              <Label htmlFor="what" className="text-foreground">
                What
              </Label>
              <Textarea
                id="what"
                name="what"
                placeholder="What the event is about..."
                className="bg-background"
                rows={2}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">The main topics and activities</p>
            </div>

            {/* Who */}
            <div className="space-y-2">
              <Label htmlFor="who" className="text-foreground">
                Who
              </Label>
              <Textarea
                id="who"
                name="who"
                placeholder="Who should attend..."
                className="bg-background"
                rows={2}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">Your target audience</p>
            </div>

            {/* Optional fields toggle */}
            <div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowOptional(!showOptional)}
                className="text-xs"
              >
                {showOptional ? '− Hide' : '+ Show'} optional fields
              </Button>
            </div>

            {/* Optional fields */}
            {showOptional && (
              <div className="space-y-4 pt-2 border-t border-border">
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Brief overview of the event"
                    className="bg-background"
                    rows={2}
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-foreground">
                    End date
                  </Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    className="bg-background"
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="where" className="text-foreground">
                    Where (context)
                  </Label>
                  <Input
                    id="where"
                    name="where"
                    type="text"
                    placeholder="Venue name, city, or platform..."
                    className="bg-background"
                    disabled={isPending}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || eventName.trim().length < 3 || !startDate}
            >
              {isPending ? 'Creating...' : 'Create Event'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onNext}
              disabled={isPending}
            >
              Skip for now
            </Button>
          </>
        )}
      </form>
    </div>
  )
}
