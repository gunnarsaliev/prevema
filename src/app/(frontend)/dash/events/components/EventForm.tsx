'use client'

import { useRouter } from 'next/navigation'
import { useState, useActionState, startTransition } from 'react'
import { Loader2 } from 'lucide-react'

import { type EventFormValues } from '@/lib/schemas/event'
import { createEvent, updateEvent } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
} from '@/components/ui/file-upload'

type OrgOption = { id: number; name: string }

type Props =
  | { mode: 'create'; organizations: OrgOption[] }
  | { mode: 'edit'; eventId: string; defaultValues: EventFormValues; existingImageUrl?: string | null }

export function EventForm(props: Props) {
  const router = useRouter()
  const [eventType, setEventType] = useState<string>(
    props.mode === 'edit' ? props.defaultValues.eventType : 'online',
  )
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [keepExistingImage, setKeepExistingImage] = useState(true)

  const organizations = props.mode === 'create' ? props.organizations : []
  const existingImageUrl = props.mode === 'edit' ? props.existingImageUrl : null

  const defaultValues: Partial<EventFormValues> =
    props.mode === 'edit'
      ? props.defaultValues
      : {
          // Auto-select the only org; if multiple, the user will pick via the selector below
          organization: organizations.length === 1 ? organizations[0].id : undefined,
          name: '',
          eventType: 'online',
          startDate: '',
        }

  // Use Next.js useActionState for optimal server action handling
  const action = props.mode === 'edit' ? updateEvent.bind(null, props.eventId) : createEvent
  const [state, formAction, isPending] = useActionState(action, undefined)

  // Handle form submission with file upload
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    // Add image file if selected
    if (imageFiles.length > 0) {
      formData.set('image', imageFiles[0])
    }

    // Call the server action inside a transition
    startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Display server-side error message */}
      {state?.message && !state.success && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {state.message}
        </p>
      )}

      {/* Organization selector — only shown when the user belongs to 2+ organizations */}
      {props.mode === 'create' && organizations.length >= 2 && (
        <FieldSet>
          <FieldLegend>Organization</FieldLegend>
          <FieldGroup>
            <Field data-invalid={!!state?.errors?.organization}>
              <FieldLabel htmlFor="organization">Organization *</FieldLabel>
              <select
                id="organization"
                name="organization"
                defaultValue={defaultValues.organization}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                aria-invalid={!!state?.errors?.organization}
              >
                <option value="">Select organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              {state?.errors?.organization && (
                <p className="text-sm text-destructive mt-1">{state.errors.organization[0]}</p>
              )}
            </Field>
          </FieldGroup>
        </FieldSet>
      )}

      {/* Hidden organization field for single-org users */}
      {props.mode === 'create' && organizations.length === 1 && (
        <input type="hidden" name="organization" value={organizations[0].id} />
      )}

      {/* Basic info */}
      <FieldSet>
        <FieldGroup>
          <Field>
            {/* Show existing image in edit mode */}
            {existingImageUrl && keepExistingImage && imageFiles.length === 0 && (
              <div className="mb-4">
                <div className="relative flex items-center gap-2.5 rounded-md border p-3 bg-background">
                  <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-accent/50">
                    <img src={existingImageUrl} alt="Current event image" className="size-full object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium text-sm">Current event image</span>
                    <span className="truncate text-muted-foreground text-xs">
                      Upload a new image to replace
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setKeepExistingImage(false)}
                    className="ml-auto hover:text-destructive transition-colors"
                    aria-label="Remove current image"
                  >
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
                  </button>
                </div>
              </div>
            )}

            <FileUpload
              value={imageFiles}
              onValueChange={(files) => {
                setImageFiles(files)
                if (files.length > 0) {
                  setKeepExistingImage(false)
                }
              }}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              maxFiles={1}
              maxSize={5 * 1024 * 1024}
            >
              <FileUploadDropzone className="bg-background">
                <div className="flex flex-col items-center justify-center gap-2 py-8">
                  <div className="rounded-full bg-muted p-3">
                    <svg
                      className="h-6 w-6 text-muted-foreground"
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
                    <p className="text-sm font-medium">Drop your image here or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, JPEG or WEBP (max 5MB)
                    </p>
                  </div>
                </div>
              </FileUploadDropzone>
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
            </FileUpload>
          </Field>

          <Field data-invalid={!!state?.errors?.name}>
            <FieldLabel htmlFor="name">Event name *</FieldLabel>
            <Input
              id="name"
              name="name"
              defaultValue={defaultValues.name}
              required
              className="bg-background"
              placeholder="My Event"
              aria-invalid={!!state?.errors?.name}
            />
            {state?.errors?.name && (
              <p className="text-sm text-destructive mt-1">{state.errors.name[0]}</p>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!state?.errors?.startDate}>
              <FieldLabel htmlFor="startDate">Start date *</FieldLabel>
              <Input
                id="startDate"
                name="startDate"
                type="datetime-local"
                defaultValue={defaultValues.startDate}
                required
                className="bg-background"
                aria-invalid={!!state?.errors?.startDate}
              />
              {state?.errors?.startDate && (
                <p className="text-sm text-destructive mt-1">{state.errors.startDate[0]}</p>
              )}
            </Field>

            <Field data-invalid={!!state?.errors?.endDate}>
              <FieldLabel htmlFor="endDate">End date</FieldLabel>
              <Input
                id="endDate"
                name="endDate"
                type="datetime-local"
                defaultValue={defaultValues.endDate ?? ''}
                className="bg-background"
                aria-invalid={!!state?.errors?.endDate}
              />
              {state?.errors?.endDate && (
                <p className="text-sm text-destructive mt-1">{state.errors.endDate[0]}</p>
              )}
            </Field>
          </div>

          <Field data-invalid={!!state?.errors?.eventType}>
            <FieldLabel htmlFor="eventType">Event type</FieldLabel>
            <select
              id="eventType"
              name="eventType"
              defaultValue={defaultValues.eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-invalid={!!state?.errors?.eventType}
            >
              <option value="online">Online</option>
              <option value="physical">Physical</option>
            </select>
            {state?.errors?.eventType && (
              <p className="text-sm text-destructive mt-1">{state.errors.eventType[0]}</p>
            )}
          </Field>

          {eventType === 'physical' && (
            <Field data-invalid={!!state?.errors?.address}>
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <Input
                id="address"
                name="address"
                defaultValue={defaultValues.address ?? ''}
                className="bg-background"
                placeholder="123 Main St, City"
                aria-invalid={!!state?.errors?.address}
              />
              {state?.errors?.address && (
                <p className="text-sm text-destructive mt-1">{state.errors.address[0]}</p>
              )}
            </Field>
          )}

          <Field data-invalid={!!state?.errors?.theme}>
            <FieldLabel htmlFor="theme">Theme / tagline</FieldLabel>
            <Input
              id="theme"
              name="theme"
              defaultValue={defaultValues.theme ?? ''}
              className="bg-background"
              placeholder="Inspiring the future of tech"
              aria-invalid={!!state?.errors?.theme}
            />
            {state?.errors?.theme && (
              <p className="text-sm text-destructive mt-1">{state.errors.theme[0]}</p>
            )}
          </Field>
        </FieldGroup>
      </FieldSet>

      {/* Description */}
      <FieldSet>
        <FieldLegend>Description</FieldLegend>
        <FieldGroup>
          <Field data-invalid={!!state?.errors?.description}>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              name="description"
              defaultValue={defaultValues.description ?? ''}
              className="bg-background"
              placeholder="Brief overview of the event…"
              rows={3}
              aria-invalid={!!state?.errors?.description}
            />
            {state?.errors?.description && (
              <p className="text-sm text-destructive mt-1">{state.errors.description[0]}</p>
            )}
          </Field>
        </FieldGroup>
      </FieldSet>

      {/* Context */}
      <FieldSet>
        <FieldLegend>Context</FieldLegend>
        <FieldGroup>
          <Field data-invalid={!!state?.errors?.why}>
            <FieldLabel htmlFor="why">Why</FieldLabel>
            <Textarea
              id="why"
              name="why"
              defaultValue={defaultValues.why ?? ''}
              className="bg-background"
              placeholder="Why this event is happening…"
              rows={2}
              aria-invalid={!!state?.errors?.why}
            />
            {state?.errors?.why && (
              <p className="text-sm text-destructive mt-1">{state.errors.why[0]}</p>
            )}
          </Field>

          <Field data-invalid={!!state?.errors?.what}>
            <FieldLabel htmlFor="what">What</FieldLabel>
            <Textarea
              id="what"
              name="what"
              defaultValue={defaultValues.what ?? ''}
              className="bg-background"
              placeholder="What the event is about…"
              rows={2}
              aria-invalid={!!state?.errors?.what}
            />
            {state?.errors?.what && (
              <p className="text-sm text-destructive mt-1">{state.errors.what[0]}</p>
            )}
          </Field>

          <Field data-invalid={!!state?.errors?.where}>
            <FieldLabel htmlFor="where">Where (context)</FieldLabel>
            <Input
              id="where"
              name="where"
              defaultValue={defaultValues.where ?? ''}
              className="bg-background"
              placeholder="Venue name, city, or platform…"
              aria-invalid={!!state?.errors?.where}
            />
            {state?.errors?.where && (
              <p className="text-sm text-destructive mt-1">{state.errors.where[0]}</p>
            )}
          </Field>

          <Field data-invalid={!!state?.errors?.who}>
            <FieldLabel htmlFor="who">Who</FieldLabel>
            <Textarea
              id="who"
              name="who"
              defaultValue={defaultValues.who ?? ''}
              className="bg-background"
              placeholder="Who should attend…"
              rows={2}
              aria-invalid={!!state?.errors?.who}
            />
            {state?.errors?.who && (
              <p className="text-sm text-destructive mt-1">{state.errors.who[0]}</p>
            )}
          </Field>
        </FieldGroup>
      </FieldSet>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {props.mode === 'edit' ? 'Save changes' : 'Create event'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dash/events')}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
