'use client'

import { useRouter } from 'next/navigation'
import { useState, useActionState, startTransition } from 'react'
import { Loader2, Plus, User, Image, Building2, FileText } from 'lucide-react'

import { type ParticipantFormValues } from '@/lib/schemas/participant'
import { createParticipant, updateParticipant } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
} from '@/components/ui/file-upload'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ParticipantRoleForm } from '../../participant-roles/components/ParticipantRoleForm'

type EventOption = { id: number; name: string }
type ParticipantRoleOption = { id: number; name: string }
type OrgOption = { id: number; name: string }

type SharedOptions = {
  events: EventOption[]
  participantRoles: ParticipantRoleOption[]
  organizations: OrgOption[]
  defaultEventId?: number
}

type Props =
  | ({ mode: 'create' } & SharedOptions)
  | ({
      mode: 'edit'
      participantId: string
      defaultValues: ParticipantFormValues
      existingProfileImageUrl?: string | null
      existingCompanyLogoUrl?: string | null
    } & SharedOptions)

export function ParticipantForm(props: Props) {
  const router = useRouter()
  const [localRoles, setLocalRoles] = useState<ParticipantRoleOption[]>(props.participantRoles)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<number | undefined>(
    props.mode === 'edit' ? props.defaultValues.event : props.defaultEventId,
  )
  const [profileImageFiles, setProfileImageFiles] = useState<File[]>([])
  const [companyLogoFiles, setCompanyLogoFiles] = useState<File[]>([])
  const [keepExistingProfileImage, setKeepExistingProfileImage] = useState(true)
  const [keepExistingCompanyLogo, setKeepExistingCompanyLogo] = useState(true)

  const existingProfileImageUrl = props.mode === 'edit' ? props.existingProfileImageUrl : null
  const existingCompanyLogoUrl = props.mode === 'edit' ? props.existingCompanyLogoUrl : null

  const defaultValues: Partial<ParticipantFormValues> =
    props.mode === 'edit'
      ? props.defaultValues
      : {
          name: '',
          email: '',
          status: 'not-approved',
          ...(props.defaultEventId
            ? { event: props.defaultEventId }
            : props.events.length === 1
              ? { event: props.events[0].id }
              : {}),
          ...(props.participantRoles.length === 1
            ? { participantRole: props.participantRoles[0].id }
            : {}),
        }

  // Use Next.js useActionState for optimal server action handling
  const action =
    props.mode === 'edit' ? updateParticipant.bind(null, props.participantId) : createParticipant
  const [state, formAction, isPending] = useActionState(action, undefined)

  // Handle form submission with file uploads
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    // Add profile image file if selected
    if (profileImageFiles.length > 0) {
      formData.set('profileImage', profileImageFiles[0])
    }

    // Add company logo file if selected
    if (companyLogoFiles.length > 0) {
      formData.set('companyLogo', companyLogoFiles[0])
    }

    // Call the server action inside a transition
    startTransition(() => {
      formAction(formData)
    })
  }

  const handleRoleCreated = async () => {
    try {
      const res = await fetch('/api/participant-roles?limit=100&sort=name&depth=0')
      if (res.ok) {
        const data = await res.json()
        const updated = (data.docs ?? []).map((r: { id: number; name: string }) => ({
          id: r.id,
          name: r.name,
        }))
        setLocalRoles(updated)
      }
    } catch {
      // silently ignore — the new role was still created
    }
    setDrawerOpen(false)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Display server-side error message */}
        {state?.message && !state.success && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
            {state.message}
          </p>
        )}

        {/* Basic Information & Contact */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Basic Information & Contact</CardTitle>
            </div>
            <CardDescription>
              Essential details and contact information for the participant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="space-y-4">
              <Field data-invalid={!!state?.errors?.name}>
                <FieldLabel htmlFor="name">Name *</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  defaultValue={defaultValues.name}
                  required
                  className="bg-background"
                  placeholder="Jane Smith"
                  aria-invalid={!!state?.errors?.name}
                />
                {state?.errors?.name && (
                  <p className="text-sm text-destructive mt-1">{state.errors.name[0]}</p>
                )}
              </Field>

              <Field data-invalid={!!state?.errors?.email}>
                <FieldLabel htmlFor="email">Email *</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={defaultValues.email}
                  required
                  className="bg-background"
                  placeholder="jane@example.com"
                  aria-invalid={!!state?.errors?.email}
                />
                {state?.errors?.email && (
                  <p className="text-sm text-destructive mt-1">{state.errors.email[0]}</p>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field data-invalid={!!state?.errors?.event}>
                  <FieldLabel htmlFor="event">Event *</FieldLabel>
                  {props.events.length === 1 && defaultValues.event && (
                    <input type="hidden" name="event" value={defaultValues.event} />
                  )}
                  <select
                    id="event"
                    name={props.events.length === 1 ? undefined : 'event'}
                    defaultValue={defaultValues.event}
                    required
                    disabled={props.events.length === 1}
                    onChange={(e) => setSelectedEvent(Number(e.target.value))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-invalid={!!state?.errors?.event}
                  >
                    {!defaultValues.event && <option value="">Select event</option>}
                    {props.events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                  {state?.errors?.event && (
                    <p className="text-sm text-destructive mt-1">{state.errors.event[0]}</p>
                  )}
                </Field>

                <Field data-invalid={!!state?.errors?.participantRole}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="participantRole">Participant role *</FieldLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto py-0 px-1 text-xs text-muted-foreground hover:text-foreground -mt-0.5"
                      onClick={() => setDrawerOpen(true)}
                    >
                      <Plus className="h-3 w-3 mr-0.5" />
                      New role
                    </Button>
                  </div>
                  {localRoles.length === 1 && defaultValues.participantRole && (
                    <input
                      type="hidden"
                      name="participantRole"
                      value={defaultValues.participantRole}
                    />
                  )}
                  <select
                    id="participantRole"
                    name={localRoles.length === 1 ? undefined : 'participantRole'}
                    defaultValue={defaultValues.participantRole}
                    required
                    disabled={localRoles.length === 1}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-invalid={!!state?.errors?.participantRole}
                  >
                    {!defaultValues.participantRole && <option value="">Select role</option>}
                    {localRoles.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.name}
                      </option>
                    ))}
                  </select>
                  {state?.errors?.participantRole && (
                    <p className="text-sm text-destructive mt-1">
                      {state.errors.participantRole[0]}
                    </p>
                  )}
                </Field>
              </div>

              <Field data-invalid={!!state?.errors?.status}>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <select
                  id="status"
                  name="status"
                  defaultValue={defaultValues.status}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-invalid={!!state?.errors?.status}
                >
                  <option value="not-approved">Not Approved</option>
                  <option value="approved">Approved</option>
                  <option value="need-info">Need More Information</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {state?.errors?.status && (
                  <p className="text-sm text-destructive mt-1">{state.errors.status[0]}</p>
                )}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* More Details */}
        <Accordion type="multiple" defaultValue={[]} className="space-y-4">
          <AccordionItem value="more-details" className="border rounded-lg px-6 bg-card">
            <AccordionTrigger>
              <div className="flex flex-col items-start gap-1 text-left">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">More Details</span>
                </div>
                <span className="text-xs text-muted-foreground font-normal">
                  Profile, company information, and presentation details
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <FieldGroup className="space-y-6">
                {/* Profile & Images Section */}
                <div className="flex items-center gap-2 mb-4">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Profile & Images</h3>
                </div>
                <Field>
                  <FieldLabel>Profile image</FieldLabel>
                  {/* Show existing image in edit mode */}
                  {existingProfileImageUrl &&
                    keepExistingProfileImage &&
                    profileImageFiles.length === 0 && (
                      <div className="mb-4">
                        <div className="relative flex items-center gap-2.5 rounded-md border p-3 bg-background">
                          <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-accent/50">
                            <img
                              src={existingProfileImageUrl}
                              alt="Current profile image"
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate font-medium text-sm">
                              Current profile image
                            </span>
                            <span className="truncate text-muted-foreground text-xs">
                              Upload a new image to replace
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setKeepExistingProfileImage(false)}
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
                    value={profileImageFiles}
                    onValueChange={(files) => {
                      setProfileImageFiles(files)
                      if (files.length > 0) {
                        setKeepExistingProfileImage(false)
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
                          <p className="text-sm font-medium">
                            Drop your profile image here or click to browse
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG, JPEG or WEBP (max 5MB)
                          </p>
                        </div>
                      </div>
                    </FileUploadDropzone>
                    <FileUploadList>
                      {profileImageFiles.map((file, index) => (
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

                <Field data-invalid={!!state?.errors?.biography}>
                  <FieldLabel htmlFor="biography">Biography</FieldLabel>
                  <Textarea
                    id="biography"
                    name="biography"
                    defaultValue={defaultValues.biography ?? ''}
                    className="bg-background"
                    placeholder="Brief biography or introduction…"
                    rows={3}
                    aria-invalid={!!state?.errors?.biography}
                  />
                  {state?.errors?.biography && (
                    <p className="text-sm text-destructive mt-1">{state.errors.biography[0]}</p>
                  )}
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field data-invalid={!!state?.errors?.country}>
                    <FieldLabel htmlFor="country">Country</FieldLabel>
                    <Input
                      id="country"
                      name="country"
                      defaultValue={defaultValues.country ?? ''}
                      className="bg-background"
                      placeholder="United States"
                      aria-invalid={!!state?.errors?.country}
                    />
                    {state?.errors?.country && (
                      <p className="text-sm text-destructive mt-1">{state.errors.country[0]}</p>
                    )}
                  </Field>

                  <Field data-invalid={!!state?.errors?.phoneNumber}>
                    <FieldLabel htmlFor="phoneNumber">Phone number</FieldLabel>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      defaultValue={defaultValues.phoneNumber ?? ''}
                      className="bg-background"
                      placeholder="+1 555 000 0000"
                      aria-invalid={!!state?.errors?.phoneNumber}
                    />
                    {state?.errors?.phoneNumber && (
                      <p className="text-sm text-destructive mt-1">{state.errors.phoneNumber[0]}</p>
                    )}
                  </Field>
                </div>

                <Field>
                  <FieldLabel>Company logo</FieldLabel>
                  {/* Show existing logo in edit mode */}
                  {existingCompanyLogoUrl &&
                    keepExistingCompanyLogo &&
                    companyLogoFiles.length === 0 && (
                      <div className="mb-4">
                        <div className="relative flex items-center gap-2.5 rounded-md border p-3 bg-background">
                          <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-accent/50">
                            <img
                              src={existingCompanyLogoUrl}
                              alt="Current company logo"
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate font-medium text-sm">
                              Current company logo
                            </span>
                            <span className="truncate text-muted-foreground text-xs">
                              Upload a new logo to replace
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setKeepExistingCompanyLogo(false)}
                            className="ml-auto hover:text-destructive transition-colors"
                            aria-label="Remove current logo"
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
                    value={companyLogoFiles}
                    onValueChange={(files) => {
                      setCompanyLogoFiles(files)
                      if (files.length > 0) {
                        setKeepExistingCompanyLogo(false)
                      }
                    }}
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
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
                          <p className="text-sm font-medium">
                            Drop your company logo here or click to browse
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG, JPEG, SVG or WEBP (max 5MB)
                          </p>
                        </div>
                      </div>
                    </FileUploadDropzone>
                    <FileUploadList>
                      {companyLogoFiles.map((file, index) => (
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

                <div className="grid grid-cols-2 gap-4">
                  <Field data-invalid={!!state?.errors?.companyName}>
                    <FieldLabel htmlFor="companyName">Company name</FieldLabel>
                    <Input
                      id="companyName"
                      name="companyName"
                      defaultValue={defaultValues.companyName ?? ''}
                      className="bg-background"
                      placeholder="Acme Inc."
                      aria-invalid={!!state?.errors?.companyName}
                    />
                    {state?.errors?.companyName && (
                      <p className="text-sm text-destructive mt-1">{state.errors.companyName[0]}</p>
                    )}
                  </Field>

                  <Field data-invalid={!!state?.errors?.companyPosition}>
                    <FieldLabel htmlFor="companyPosition">Job title</FieldLabel>
                    <Input
                      id="companyPosition"
                      name="companyPosition"
                      defaultValue={defaultValues.companyPosition ?? ''}
                      className="bg-background"
                      placeholder="Software Engineer"
                      aria-invalid={!!state?.errors?.companyPosition}
                    />
                    {state?.errors?.companyPosition && (
                      <p className="text-sm text-destructive mt-1">
                        {state.errors.companyPosition[0]}
                      </p>
                    )}
                  </Field>
                </div>

                <Field data-invalid={!!state?.errors?.companyWebsite}>
                  <FieldLabel htmlFor="companyWebsite">Company website</FieldLabel>
                  <Input
                    id="companyWebsite"
                    name="companyWebsite"
                    type="url"
                    defaultValue={defaultValues.companyWebsite ?? ''}
                    className="bg-background"
                    placeholder="https://acme.com"
                    aria-invalid={!!state?.errors?.companyWebsite}
                  />
                  {state?.errors?.companyWebsite && (
                    <p className="text-sm text-destructive mt-1">
                      {state.errors.companyWebsite[0]}
                    </p>
                  )}
                </Field>

                <div className="my-6 border-t"></div>

                {/* Presentation Details Section */}
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Presentation Details</h3>
                </div>

                <Field data-invalid={!!state?.errors?.internalNotes}>
                  <FieldLabel htmlFor="internalNotes">Internal notes</FieldLabel>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Not visible to the participant.
                  </p>
                  <Textarea
                    id="internalNotes"
                    name="internalNotes"
                    defaultValue={defaultValues.internalNotes ?? ''}
                    className="bg-background"
                    placeholder="Internal notes for your team…"
                    rows={2}
                    aria-invalid={!!state?.errors?.internalNotes}
                  />
                  {state?.errors?.internalNotes && (
                    <p className="text-sm text-destructive mt-1">{state.errors.internalNotes[0]}</p>
                  )}
                </Field>

                <Field data-invalid={!!state?.errors?.presentationTopic}>
                  <FieldLabel htmlFor="presentationTopic">Presentation topic</FieldLabel>
                  <Input
                    id="presentationTopic"
                    name="presentationTopic"
                    defaultValue={defaultValues.presentationTopic ?? ''}
                    className="bg-background"
                    placeholder="Topic title…"
                    aria-invalid={!!state?.errors?.presentationTopic}
                  />
                  {state?.errors?.presentationTopic && (
                    <p className="text-sm text-destructive mt-1">
                      {state.errors.presentationTopic[0]}
                    </p>
                  )}
                </Field>

                <Field data-invalid={!!state?.errors?.presentationSummary}>
                  <FieldLabel htmlFor="presentationSummary">Presentation summary</FieldLabel>
                  <Textarea
                    id="presentationSummary"
                    name="presentationSummary"
                    defaultValue={defaultValues.presentationSummary ?? ''}
                    className="bg-background"
                    placeholder="Brief summary of the presentation…"
                    rows={3}
                    aria-invalid={!!state?.errors?.presentationSummary}
                  />
                  {state?.errors?.presentationSummary && (
                    <p className="text-sm text-destructive mt-1">
                      {state.errors.presentationSummary[0]}
                    </p>
                  )}
                </Field>

                <Field data-invalid={!!state?.errors?.technicalRequirements}>
                  <FieldLabel htmlFor="technicalRequirements">Technical requirements</FieldLabel>
                  <Textarea
                    id="technicalRequirements"
                    name="technicalRequirements"
                    defaultValue={defaultValues.technicalRequirements ?? ''}
                    className="bg-background"
                    placeholder="Any technical requirements…"
                    rows={2}
                    aria-invalid={!!state?.errors?.technicalRequirements}
                  />
                  {state?.errors?.technicalRequirements && (
                    <p className="text-sm text-destructive mt-1">
                      {state.errors.technicalRequirements[0]}
                    </p>
                  )}
                </Field>
              </FieldGroup>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {props.mode === 'edit' ? 'Save changes' : 'Add participant'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dash/participants')}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
        <DrawerContent className="w-[500px] max-w-full flex flex-col">
          <DrawerHeader>
            <DrawerTitle>Create participant role</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-6 pb-6 flex-1">
            <ParticipantRoleForm
              mode="create"
              organizations={props.organizations}
              lockedValues={{ event: selectedEvent ?? undefined }}
              onSuccess={handleRoleCreated}
              onCancel={() => setDrawerOpen(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
