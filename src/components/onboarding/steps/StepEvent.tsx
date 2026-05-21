'use client'

import { useEffect, useState } from 'react'
import { Calendar, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  createEventAction,
  updateEventAction,
  getOnboardingEventAction,
} from '@/app/(frontend)/onboarding/actions'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
} from '@/components/ui/file-upload'
import { ONBOARDING_KEYS, useSessionState } from '../useOnboardingPersistence'

interface StepEventProps {
  stepIndex: number
  onValidationChange: (stepIndex: number, isValid: boolean) => void
  organizationId: number
  eventId?: number
  onEventCreated?: (eventId: number, eventName: string) => void
  onNext?: () => void
}

// Helper: convert ISO date to value expected by <input type="datetime-local"> (YYYY-MM-DDTHH:mm)
function toLocalDateTimeValue(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    const pad = (n: number) => `${n}`.padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return ''
  }
}

export const StepEvent = ({
  stepIndex,
  onValidationChange,
  organizationId,
  eventId,
  onEventCreated,
  onNext,
}: StepEventProps) => {
  // Persisted fields
  const [eventName, setEventName] = useSessionState(ONBOARDING_KEYS.event.name, '')
  const [startDate, setStartDate] = useSessionState(ONBOARDING_KEYS.event.startDate, '')
  const [endDate, setEndDate] = useSessionState(ONBOARDING_KEYS.event.endDate, '')
  const [eventType, setEventType] = useSessionState(ONBOARDING_KEYS.event.eventType, 'online')
  const [address, setAddress] = useSessionState(ONBOARDING_KEYS.event.address, '')
  const [theme, setTheme] = useSessionState(ONBOARDING_KEYS.event.theme, '')
  const [why, setWhy] = useSessionState(ONBOARDING_KEYS.event.why, '')
  const [what, setWhat] = useSessionState(ONBOARDING_KEYS.event.what, '')
  const [who, setWho] = useSessionState(ONBOARDING_KEYS.event.who, '')
  const [description, setDescription] = useSessionState(ONBOARDING_KEYS.event.description, '')
  const [where, setWhere] = useSessionState(ONBOARDING_KEYS.event.where, '')

  // Non-persisted state (File objects aren't serializable)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [showOptional, setShowOptional] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [state, setState] = useState<any>(undefined)
  const [isPrefilling, setIsPrefilling] = useState(false)
  const [prefilled, setPrefilled] = useState(false)

  // If we already created an event, fetch it and prefill the form (only if user hasn't entered data yet)
  useEffect(() => {
    if (!eventId || prefilled) return
    let cancelled = false
    setIsPrefilling(true)
    ;(async () => {
      const res = await getOnboardingEventAction(eventId)
      if (cancelled) return
      if (res.success && res.data) {
        const d = res.data
        // Only overwrite empty session values; preserve any user edits
        setEventName((prev) => (prev && prev.trim().length > 0 ? prev : d.name || ''))
        setStartDate((prev) => (prev ? prev : toLocalDateTimeValue(d.startDate)))
        setEndDate((prev) => (prev ? prev : toLocalDateTimeValue(d.endDate)))
        setEventType((prev) => (prev && prev.length > 0 ? prev : d.eventType || 'online'))
        setAddress((prev) => (prev ? prev : d.address || ''))
        setTheme((prev) => (prev ? prev : d.theme || ''))
        setWhy((prev) => (prev ? prev : d.why || ''))
        setWhat((prev) => (prev ? prev : d.what || ''))
        setWho((prev) => (prev ? prev : d.who || ''))
        setDescription((prev) => (prev ? prev : d.description || ''))
        setWhere((prev) => (prev ? prev : d.where || ''))
      }
      setIsPrefilling(false)
      setPrefilled(true)
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  // Keep validity flag in sync with required fields
  useEffect(() => {
    const isValid = eventName.trim().length >= 3 && startDate.trim().length > 0
    onValidationChange(stepIndex, isValid)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName, startDate])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    if (imageFiles.length > 0) {
      formData.set('image', imageFiles[0])
    }

    setIsPending(true)

    try {
      const result = eventId
        ? await updateEventAction(eventId, organizationId, state, formData)
        : await createEventAction(organizationId, state, formData)
      console.log('[StepEvent] Save result:', result)

      setState(result)

      if (result.success && result.data) {
        if (onEventCreated) {
          onEventCreated(result.data.id, result.data.name)
        }
        setTimeout(() => {
          onNext?.()
        }, 800)
      } else {
        console.error('[StepEvent] Operation failed:', result.message)
      }
    } catch (error) {
      console.error('[StepEvent] Error submitting form:', error)
      setState({
        success: false,
        message: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setIsPending(false)
    }
  }

  if (isPrefilling) {
    return (
      <div className="flex min-h-[40.5dvh] w-full flex-col items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-sm">Loading event…</p>
        </div>
      </div>
    )
  }

  const submitLabel = eventId
    ? isPending
      ? 'Updating…'
      : 'Update Event'
    : isPending
      ? 'Creating…'
      : 'Create Event'

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
        {/* Success message */}
        {state?.success && (
          <div className="rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 p-3">
            <p className="text-sm text-green-800 dark:text-green-200">
              Event &quot;{state.data?.name}&quot; saved successfully!
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
                {eventId ? "Update your event's details" : "Now let's create your first event"}
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
                {imageFiles.length === 0 && (
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
                )}
                {imageFiles.length > 0 && (
                  <FileUploadList>
                    {imageFiles.map((file, index) => (
                      <FileUploadItem key={index} value={file} className="bg-background">
                        <FileUploadItemPreview />
                        <FileUploadItemMetadata />
                        <FileUploadItemDelete className="ml-auto">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
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
                )}
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
                placeholder="Tech Conference"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
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

            {/* Start Date & End Date side-by-side */}
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
                  onChange={(e) => setStartDate(e.target.value)}
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
                <Label htmlFor="endDate" className="text-foreground">
                  End date
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-background"
                  disabled={isPending}
                  aria-invalid={!!state?.errors?.endDate}
                />
                {state?.errors?.endDate && (
                  <p className="text-sm text-destructive">{state.errors.endDate[0]}</p>
                )}
              </div>
            </div>

            {/* Event Type */}
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
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
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
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                className="bg-background"
                rows={2}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                The purpose and motivation behind your event
              </p>
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
                value={what}
                onChange={(e) => setWhat(e.target.value)}
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
                value={who}
                onChange={(e) => setWho(e.target.value)}
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-background"
                    rows={2}
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
                    value={where}
                    onChange={(e) => setWhere(e.target.value)}
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
              {submitLabel}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => onNext?.()}
              disabled={isPending}
            >
              Skip this step
            </Button>
          </>
        )}
      </form>
    </div>
  )
}
