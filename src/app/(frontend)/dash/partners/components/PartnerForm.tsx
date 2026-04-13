'use client'

import { useRouter } from 'next/navigation'
import { useState, useActionState, startTransition } from 'react'
import { Loader2, Plus, Building2, Image, FileText, Handshake } from 'lucide-react'

import { type PartnerFormValues } from '@/lib/schemas/partner'
import { createPartner, updatePartner } from '../actions'
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
import { PartnerTypeForm } from '../../partner-types/components/PartnerTypeForm'

type EventOption = { id: number; name: string }
type PartnerTypeOption = { id: number; name: string }
type TierOption = { id: number; name: string }
type OrgOption = { id: number; name: string }

type SharedOptions = {
  events: EventOption[]
  partnerTypes: PartnerTypeOption[]
  tiers: TierOption[]
  organizations: OrgOption[]
  defaultEventId?: number
}

type Props =
  | ({ mode: 'create' } & SharedOptions)
  | ({
      mode: 'edit'
      partnerId: string
      defaultValues: PartnerFormValues
      existingCompanyLogoUrl?: string | null
      existingCompanyBannerUrl?: string | null
    } & SharedOptions)

export function PartnerForm(props: Props) {
  const router = useRouter()
  const [localPartnerTypes, setLocalPartnerTypes] = useState<PartnerTypeOption[]>(
    props.partnerTypes,
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<number | undefined>(
    props.mode === 'edit' ? props.defaultValues.event : props.defaultEventId,
  )
  const [companyLogoFiles, setCompanyLogoFiles] = useState<File[]>([])
  const [companyBannerFiles, setCompanyBannerFiles] = useState<File[]>([])
  const [keepExistingCompanyLogo, setKeepExistingCompanyLogo] = useState(true)
  const [keepExistingCompanyBanner, setKeepExistingCompanyBanner] = useState(true)

  const existingCompanyLogoUrl = props.mode === 'edit' ? props.existingCompanyLogoUrl : null
  const existingCompanyBannerUrl = props.mode === 'edit' ? props.existingCompanyBannerUrl : null

  const defaultValues: Partial<PartnerFormValues> =
    props.mode === 'edit'
      ? props.defaultValues
      : {
          companyName: '',
          contactPerson: '',
          contactEmail: '',
          status: 'default',
          ...(props.defaultEventId
            ? { event: props.defaultEventId }
            : props.events.length === 1
              ? { event: props.events[0].id }
              : {}),
          ...(props.partnerTypes.length === 1 ? { partnerType: props.partnerTypes[0].id } : {}),
        }

  // Use Next.js useActionState for optimal server action handling
  const action = props.mode === 'edit' ? updatePartner.bind(null, props.partnerId) : createPartner
  const [state, formAction, isPending] = useActionState(action, undefined)

  // Handle form submission with file uploads
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    // Add company logo file if selected
    if (companyLogoFiles.length > 0) {
      formData.set('companyLogo', companyLogoFiles[0])
    }

    // Add company banner file if selected
    if (companyBannerFiles.length > 0) {
      formData.set('companyBanner', companyBannerFiles[0])
    }

    // Call the server action inside a transition
    startTransition(() => {
      formAction(formData)
    })
  }

  const handlePartnerTypeCreated = async () => {
    try {
      const res = await fetch('/api/partner-types?limit=100&sort=name&depth=0')
      if (res.ok) {
        const data = await res.json()
        const updated = (data.docs ?? []).map((t: { id: number; name: string }) => ({
          id: t.id,
          name: t.name,
        }))
        setLocalPartnerTypes(updated)
      }
    } catch {
      // silently ignore — the new type was still created
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
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Basic Information & Contact</CardTitle>
            </div>
            <CardDescription>
              Essential details and contact information for the partner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="space-y-4">
              <Field data-invalid={!!state?.errors?.companyName}>
                <FieldLabel htmlFor="companyName">Company name *</FieldLabel>
                <Input
                  id="companyName"
                  name="companyName"
                  defaultValue={defaultValues.companyName}
                  required
                  className="bg-background"
                  placeholder="Acme Inc."
                  aria-invalid={!!state?.errors?.companyName}
                />
                {state?.errors?.companyName && (
                  <p className="text-sm text-destructive mt-1">{state.errors.companyName[0]}</p>
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

                <Field data-invalid={!!state?.errors?.partnerType}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="partnerType">Partner type *</FieldLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto py-0 px-1 text-xs text-muted-foreground hover:text-foreground -mt-0.5"
                      onClick={() => setDrawerOpen(true)}
                    >
                      <Plus className="h-3 w-3 mr-0.5" />
                      New type
                    </Button>
                  </div>
                  {localPartnerTypes.length === 1 && defaultValues.partnerType && (
                    <input type="hidden" name="partnerType" value={defaultValues.partnerType} />
                  )}
                  <select
                    id="partnerType"
                    name={localPartnerTypes.length === 1 ? undefined : 'partnerType'}
                    defaultValue={defaultValues.partnerType}
                    required
                    disabled={localPartnerTypes.length === 1}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-invalid={!!state?.errors?.partnerType}
                  >
                    {!defaultValues.partnerType && <option value="">Select type</option>}
                    {localPartnerTypes.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.name}
                      </option>
                    ))}
                  </select>
                  {state?.errors?.partnerType && (
                    <p className="text-sm text-destructive mt-1">{state.errors.partnerType[0]}</p>
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
                  <option value="default">Default</option>
                  <option value="contacted">Contacted</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="declined">Declined</option>
                </select>
                {state?.errors?.status && (
                  <p className="text-sm text-destructive mt-1">{state.errors.status[0]}</p>
                )}
              </Field>

              <div className="my-6 border-t"></div>

              {/* Contact fields */}
              <Field data-invalid={!!state?.errors?.contactPerson}>
                <FieldLabel htmlFor="contactPerson">Contact person *</FieldLabel>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  defaultValue={defaultValues.contactPerson}
                  required
                  className="bg-background"
                  placeholder="Jane Smith"
                  aria-invalid={!!state?.errors?.contactPerson}
                />
                {state?.errors?.contactPerson && (
                  <p className="text-sm text-destructive mt-1">{state.errors.contactPerson[0]}</p>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field data-invalid={!!state?.errors?.contactEmail}>
                  <FieldLabel htmlFor="contactEmail">Contact email *</FieldLabel>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    defaultValue={defaultValues.contactEmail}
                    required
                    className="bg-background"
                    placeholder="jane@acme.com"
                    aria-invalid={!!state?.errors?.contactEmail}
                  />
                  {state?.errors?.contactEmail && (
                    <p className="text-sm text-destructive mt-1">{state.errors.contactEmail[0]}</p>
                  )}
                </Field>

                <Field data-invalid={!!state?.errors?.email}>
                  <FieldLabel htmlFor="email">Company email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={defaultValues.email ?? ''}
                    className="bg-background"
                    placeholder="info@acme.com"
                    aria-invalid={!!state?.errors?.email}
                  />
                  {state?.errors?.email && (
                    <p className="text-sm text-destructive mt-1">{state.errors.email[0]}</p>
                  )}
                </Field>
              </div>
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
                  Brand assets, company details, and partnership information
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <FieldGroup className="space-y-6">
                {/* Brand Assets Section */}
                <div className="flex items-center gap-2 mb-4">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Brand Assets</h3>
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

                <Field data-invalid={!!state?.errors?.companyLogoUrl}>
                  <FieldLabel htmlFor="companyLogoUrl">Logo URL (alternative)</FieldLabel>
                  <Input
                    id="companyLogoUrl"
                    name="companyLogoUrl"
                    defaultValue={defaultValues.companyLogoUrl ?? ''}
                    className="bg-background"
                    placeholder="https://acme.com/logo.png"
                    aria-invalid={!!state?.errors?.companyLogoUrl}
                  />
                  {state?.errors?.companyLogoUrl && (
                    <p className="text-sm text-destructive mt-1">
                      {state.errors.companyLogoUrl[0]}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Company banner</FieldLabel>
                  {/* Show existing banner in edit mode */}
                  {existingCompanyBannerUrl &&
                    keepExistingCompanyBanner &&
                    companyBannerFiles.length === 0 && (
                      <div className="mb-4">
                        <div className="relative flex items-center gap-2.5 rounded-md border p-3 bg-background">
                          <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-accent/50">
                            <img
                              src={existingCompanyBannerUrl}
                              alt="Current company banner"
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate font-medium text-sm">
                              Current company banner
                            </span>
                            <span className="truncate text-muted-foreground text-xs">
                              Upload a new banner to replace
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setKeepExistingCompanyBanner(false)}
                            className="ml-auto hover:text-destructive transition-colors"
                            aria-label="Remove current banner"
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
                    value={companyBannerFiles}
                    onValueChange={(files) => {
                      setCompanyBannerFiles(files)
                      if (files.length > 0) {
                        setKeepExistingCompanyBanner(false)
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
                            Drop your company banner here or click to browse
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG, JPEG or WEBP (max 5MB)
                          </p>
                        </div>
                      </div>
                    </FileUploadDropzone>
                    <FileUploadList>
                      {companyBannerFiles.map((file, index) => (
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

                <div className="my-6 border-t"></div>

                {/* Company Details Section */}
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Company Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field data-invalid={!!state?.errors?.fieldOfExpertise}>
                    <FieldLabel htmlFor="fieldOfExpertise">Field of expertise</FieldLabel>
                    <Input
                      id="fieldOfExpertise"
                      name="fieldOfExpertise"
                      defaultValue={defaultValues.fieldOfExpertise ?? ''}
                      className="bg-background"
                      placeholder="Software engineering"
                      aria-invalid={!!state?.errors?.fieldOfExpertise}
                    />
                    {state?.errors?.fieldOfExpertise && (
                      <p className="text-sm text-destructive mt-1">
                        {state.errors.fieldOfExpertise[0]}
                      </p>
                    )}
                  </Field>

                  <Field data-invalid={!!state?.errors?.companyWebsiteUrl}>
                    <FieldLabel htmlFor="companyWebsiteUrl">Website URL</FieldLabel>
                    <Input
                      id="companyWebsiteUrl"
                      name="companyWebsiteUrl"
                      type="url"
                      defaultValue={defaultValues.companyWebsiteUrl ?? ''}
                      className="bg-background"
                      placeholder="https://acme.com"
                      aria-invalid={!!state?.errors?.companyWebsiteUrl}
                    />
                    {state?.errors?.companyWebsiteUrl && (
                      <p className="text-sm text-destructive mt-1">
                        {state.errors.companyWebsiteUrl[0]}
                      </p>
                    )}
                  </Field>
                </div>

                <Field data-invalid={!!state?.errors?.companyDescription}>
                  <FieldLabel htmlFor="companyDescription">Company description</FieldLabel>
                  <Textarea
                    id="companyDescription"
                    name="companyDescription"
                    defaultValue={defaultValues.companyDescription ?? ''}
                    className="bg-background"
                    placeholder="Brief description of the company and its services…"
                    rows={3}
                    aria-invalid={!!state?.errors?.companyDescription}
                  />
                  {state?.errors?.companyDescription && (
                    <p className="text-sm text-destructive mt-1">
                      {state.errors.companyDescription[0]}
                    </p>
                  )}
                </Field>

                <div className="my-6 border-t"></div>

                {/* Partnership Details Section */}
                <div className="flex items-center gap-2 mb-4">
                  <Handshake className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Partnership Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field data-invalid={!!state?.errors?.tier}>
                    <FieldLabel htmlFor="tier">Tier</FieldLabel>
                    <select
                      id="tier"
                      name="tier"
                      defaultValue={defaultValues.tier ?? ''}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-invalid={!!state?.errors?.tier}
                    >
                      <option value="">Select tier</option>
                      {props.tiers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    {state?.errors?.tier && (
                      <p className="text-sm text-destructive mt-1">{state.errors.tier[0]}</p>
                    )}
                  </Field>

                  <Field data-invalid={!!state?.errors?.sponsorshipLevel}>
                    <FieldLabel htmlFor="sponsorshipLevel">Sponsorship level</FieldLabel>
                    <Input
                      id="sponsorshipLevel"
                      name="sponsorshipLevel"
                      defaultValue={defaultValues.sponsorshipLevel ?? ''}
                      className="bg-background"
                      placeholder="Gold"
                      aria-invalid={!!state?.errors?.sponsorshipLevel}
                    />
                    {state?.errors?.sponsorshipLevel && (
                      <p className="text-sm text-destructive mt-1">
                        {state.errors.sponsorshipLevel[0]}
                      </p>
                    )}
                  </Field>
                </div>

                <Field data-invalid={!!state?.errors?.additionalNotes}>
                  <FieldLabel htmlFor="additionalNotes">Additional notes</FieldLabel>
                  <Textarea
                    id="additionalNotes"
                    name="additionalNotes"
                    defaultValue={defaultValues.additionalNotes ?? ''}
                    className="bg-background"
                    placeholder="Any additional notes…"
                    rows={3}
                    aria-invalid={!!state?.errors?.additionalNotes}
                  />
                  {state?.errors?.additionalNotes && (
                    <p className="text-sm text-destructive mt-1">
                      {state.errors.additionalNotes[0]}
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
            {props.mode === 'edit' ? 'Save changes' : 'Add partner'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dash/partners')}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
        <DrawerContent className="w-[500px] max-w-full flex flex-col">
          <DrawerHeader>
            <DrawerTitle>Create partner type</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-6 pb-6 flex-1">
            <PartnerTypeForm
              mode="create"
              organizations={props.organizations}
              lockedValues={{ event: selectedEvent ?? undefined }}
              onSuccess={handlePartnerTypeCreated}
              onCancel={() => setDrawerOpen(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
