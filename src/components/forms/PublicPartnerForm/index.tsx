'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { ImageUploadPreview } from '@/components/forms/ImageUploadPreview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import React, { useCallback, useMemo, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'

type SocialLink = {
  platform: string
  url: string
}

type FormData = {
  companyName: string
  contactPerson: string
  contactEmail: string
  email?: string
  fieldOfExpertise?: string
  companyWebsiteUrl?: string
  companyLogo?: FileList
  companyLogoUrl?: string
  companyBanner?: FileList
  companyDescription?: string
  socialLinks?: SocialLink[]
  sponsorshipLevel?: string
  additionalNotes?: string
}

type EventOption = { id: string; name: string }

type Props = {
  partnerTypeId: string
  requiredFields: string[]
  optionalFields: string[]
  eventId: string | null
  events?: EventOption[] | null
}

export const PublicPartnerForm: React.FC<Props> = ({
  partnerTypeId,
  requiredFields = [],
  optionalFields = [],
  eventId,
  events,
}) => {
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<null | string>(null)
  const [success, setSuccess] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string>(eventId ?? '')

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<FormData>({
    defaultValues: {
      socialLinks: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'socialLinks',
  })

  const visibleFields = useMemo(
    () => Array.from(new Set([...(requiredFields || []), ...(optionalFields || [])])),
    [optionalFields, requiredFields],
  )

  const uploadImage = async (file: File, altText: string): Promise<string> => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error('Image file size must be less than 5MB')
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Image must be a valid file (JPEG, PNG, WebP, or SVG)')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('alt', altText)

    const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/media`, {
      method: 'POST',
      body: formData,
    })

    if (!uploadResponse.ok) {
      const uploadError = (await uploadResponse.json()) as { message?: string }
      throw new Error(uploadError.message || 'Failed to upload image. Please try again.')
    }

    const uploadResult = (await uploadResponse.json()) as { doc: { id: string } }
    return uploadResult.doc.id
  }

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!selectedEventId) {
        setError('Please select an event before submitting.')
        return
      }
      setLoading(true)
      setError(null)

      try {
        let companyLogoId: string | undefined
        let companyBannerId: string | undefined
        let currentProgress = 10

        // Handle company logo upload
        if (data.companyLogo && data.companyLogo.length > 0) {
          setUploadProgress(currentProgress)
          companyLogoId = await uploadImage(
            data.companyLogo[0],
            `Company logo for ${data.companyName}`,
          )
          currentProgress += 25
          setUploadProgress(currentProgress)
        }

        // Handle company banner upload
        if (data.companyBanner && data.companyBanner.length > 0) {
          setUploadProgress(currentProgress)
          companyBannerId = await uploadImage(
            data.companyBanner[0],
            `Company banner for ${data.companyName}`,
          )
          currentProgress += 25
          setUploadProgress(currentProgress)
        }

        setUploadProgress(70)

        // Filter out empty social links
        const filteredSocialLinks = data.socialLinks?.filter((link) => link.url.trim() !== '') || []

        // Submit partner data
        const partnerData = {
          companyName: data.companyName,
          contactPerson: data.contactPerson,
          contactEmail: data.contactEmail,
          event: parseInt(selectedEventId),
          partnerType: parseInt(partnerTypeId),
          status: 'default',
          ...(visibleFields.includes('email') && data.email && { email: data.email }),
          ...(visibleFields.includes('fieldOfExpertise') && {
            fieldOfExpertise: data.fieldOfExpertise,
          }),
          ...(visibleFields.includes('companyWebsiteUrl') && {
            companyWebsiteUrl: data.companyWebsiteUrl,
          }),
          ...(companyLogoId && { companyLogo: companyLogoId }),
          ...(visibleFields.includes('companyLogoUrl') && { companyLogoUrl: data.companyLogoUrl }),
          ...(companyBannerId && { companyBanner: companyBannerId }),
          ...(visibleFields.includes('companyDescription') && {
            companyDescription: data.companyDescription,
          }),
          ...(visibleFields.includes('socialLinks') &&
            filteredSocialLinks.length > 0 && { socialLinks: filteredSocialLinks }),
          ...(visibleFields.includes('sponsorshipLevel') && {
            sponsorshipLevel: data.sponsorshipLevel,
          }),
          ...(visibleFields.includes('additionalNotes') && {
            additionalNotes: data.additionalNotes,
          }),
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/partners`, {
          body: JSON.stringify(partnerData),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        })

        if (!response.ok) {
          const errorData = (await response.json()) as {
            errors?: Array<{ field?: string; message?: string }>
            message?: string
          }

          // Parse error messages for better user experience
          let errorMessage = 'Failed to submit registration'

          if (errorData.errors && Array.isArray(errorData.errors)) {
            // Handle validation errors array
            const emailError = errorData.errors.find(
              (err) => err.field === 'contactEmail' || err.message?.toLowerCase().includes('email'),
            )
            if (emailError) {
              errorMessage = 'This email is already registered for this event'
            } else {
              errorMessage = errorData.errors
                .map((err) => err.message || 'Unknown error')
                .join(', ')
            }
          } else if (errorData.message) {
            // Handle direct message errors (like UNIQUE constraint)
            if (
              errorData.message.toLowerCase().includes('unique') &&
              errorData.message.toLowerCase().includes('email')
            ) {
              errorMessage = 'This email is already registered for this event'
            } else {
              errorMessage = errorData.message
            }
          }

          throw new Error(errorMessage)
        }

        setUploadProgress(100)
        setSuccess(true)
        setLoading(false)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'There was an error submitting your registration.',
        )
        setLoading(false)
        setUploadProgress(0)
        // Scroll to error message
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    [partnerTypeId, requiredFields, optionalFields, selectedEventId, visibleFields],
  )

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
          <svg
            className="w-12 h-12 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          Partnership Registration Submitted Successfully!
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          Thank you for your interest in partnering with us. We've received your submission and our
          team will review it shortly. We'll contact you at the email address you provided.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
            <strong>What's next?</strong> You'll receive a confirmation email once your partnership
            has been reviewed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* Event selector — shown when no event is pre-linked */}
      {!eventId && events && events.length > 0 && (
        <FormItem>
          <Label htmlFor="event-select" className="mb-2">
            Event <span className="text-red-500">*</span>
          </Label>
          <select
            id="event-select"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            required
          >
            <option value="">Select an event…</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </FormItem>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        </div>
      )}

      <FormItem>
        <Label htmlFor="companyName" className="mb-2">
          Company Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="companyName"
          {...register('companyName', { required: 'Company name is required' })}
          type="text"
          placeholder="Enter your company name"
        />
        {errors.companyName && <FormError message={errors.companyName.message} />}
      </FormItem>

      <FormItem>
        <Label htmlFor="contactPerson" className="mb-2">
          Contact Person <span className="text-red-500">*</span>
        </Label>
        <Input
          id="contactPerson"
          {...register('contactPerson', { required: 'Contact person is required' })}
          type="text"
          placeholder="Enter contact person name"
        />
        {errors.contactPerson && <FormError message={errors.contactPerson.message} />}
      </FormItem>

      <FormItem>
        <Label htmlFor="contactEmail" className="mb-2">
          Contact Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="contactEmail"
          {...register('contactEmail', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          type="email"
          placeholder="contact@company.com"
        />
        {errors.contactEmail && <FormError message={errors.contactEmail.message} />}
      </FormItem>

      {/* Company Email */}
      {visibleFields.includes('email') && (
        <FormItem>
          <Label htmlFor="email" className="mb-2">
            Company Email{' '}
            {requiredFields.includes('email') && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="email"
            {...register(
              'email',
              requiredFields.includes('email')
                ? {
                    required: 'Company email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  }
                : {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  },
            )}
            type="email"
            placeholder="info@company.com"
          />
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>
      )}

      {/* Field of Expertise */}
      {visibleFields.includes('fieldOfExpertise') && (
        <FormItem>
          <Label htmlFor="fieldOfExpertise" className="mb-2">
            Field of Expertise{' '}
            {requiredFields.includes('fieldOfExpertise') && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="fieldOfExpertise"
            {...register(
              'fieldOfExpertise',
              requiredFields.includes('fieldOfExpertise')
                ? { required: 'Field of expertise is required' }
                : {},
            )}
            type="text"
            placeholder="e.g., Technology, Healthcare, Finance"
          />
          {errors.fieldOfExpertise && <FormError message={errors.fieldOfExpertise.message} />}
        </FormItem>
      )}

      {/* Company Website URL */}
      {visibleFields.includes('companyWebsiteUrl') && (
        <FormItem>
          <Label htmlFor="companyWebsiteUrl" className="mb-2">
            Company Website{' '}
            {requiredFields.includes('companyWebsiteUrl') && (
              <span className="text-red-500">*</span>
            )}
          </Label>
          <Input
            id="companyWebsiteUrl"
            {...register(
              'companyWebsiteUrl',
              requiredFields.includes('companyWebsiteUrl')
                ? {
                    required: 'Company website is required',
                    pattern: {
                      value: /^https?:\/\/.+/i,
                      message: 'Please enter a valid URL (including http:// or https://)',
                    },
                  }
                : {
                    pattern: {
                      value: /^https?:\/\/.+/i,
                      message: 'Please enter a valid URL (including http:// or https://)',
                    },
                  },
            )}
            type="url"
            placeholder="https://www.company.com"
          />
          {errors.companyWebsiteUrl && <FormError message={errors.companyWebsiteUrl.message} />}
        </FormItem>
      )}

      {visibleFields.includes('companyLogo') && (
        <FormItem>
          <ImageUploadPreview
            id="companyLogo"
            label="Company Logo"
            required={requiredFields.includes('companyLogo')}
            register={register}
            errors={errors.companyLogo}
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            maxSizeMB={5}
          />
        </FormItem>
      )}

      {/* Company Logo URL */}
      {visibleFields.includes('companyLogoUrl') && (
        <FormItem>
          <Label htmlFor="companyLogoUrl" className="mb-2">
            Company Logo URL{' '}
            {requiredFields.includes('companyLogoUrl') && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="companyLogoUrl"
            {...register(
              'companyLogoUrl',
              requiredFields.includes('companyLogoUrl')
                ? {
                    required: 'Company logo URL is required',
                    pattern: {
                      value: /^https?:\/\/.+/i,
                      message: 'Please enter a valid URL (including http:// or https://)',
                    },
                  }
                : {
                    pattern: {
                      value: /^https?:\/\/.+/i,
                      message: 'Please enter a valid URL (including http:// or https://)',
                    },
                  },
            )}
            type="url"
            placeholder="https://example.com/logo.png"
          />
          {errors.companyLogoUrl && <FormError message={errors.companyLogoUrl.message} />}
        </FormItem>
      )}

      {/* Company Banner */}
      {visibleFields.includes('companyBanner') && (
        <FormItem>
          <ImageUploadPreview
            id="companyBanner"
            label="Company Banner"
            required={requiredFields.includes('companyBanner')}
            register={register}
            errors={errors.companyBanner}
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            maxSizeMB={5}
          />
        </FormItem>
      )}

      {/* Company Description */}
      {visibleFields.includes('companyDescription') && (
        <FormItem>
          <Label htmlFor="companyDescription" className="mb-2">
            Company Description{' '}
            {requiredFields.includes('companyDescription') && (
              <span className="text-red-500">*</span>
            )}
          </Label>
          <Textarea
            id="companyDescription"
            {...register(
              'companyDescription',
              requiredFields.includes('companyDescription')
                ? {
                    required: 'Company description is required',
                  }
                : {},
            )}
            placeholder="Tell us about your company and what you do..."
            rows={5}
          />
          {errors.companyDescription && <FormError message={errors.companyDescription.message} />}
        </FormItem>
      )}

      {/* Social Links */}
      {visibleFields.includes('socialLinks') && (
        <div className="space-y-3">
          <Label>
            Social Links{' '}
            {requiredFields.includes('socialLinks') && <span className="text-red-500">*</span>}
          </Label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-3">
              <div className="w-1/3">
                <select
                  {...register(`socialLinks.${index}.platform` as const)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex-1">
                <Input
                  {...register(
                    `socialLinks.${index}.url` as const,
                    requiredFields.includes('socialLinks') ? { required: 'URL is required' } : {},
                  )}
                  type="url"
                  placeholder="https://..."
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => remove(index)}
                className="px-3"
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ platform: 'linkedin', url: '' })}
            className="w-full"
          >
            Add Social Link
          </Button>
        </div>
      )}

      {visibleFields.includes('sponsorshipLevel') && (
        <FormItem>
          <Label htmlFor="sponsorshipLevel" className="mb-2">
            Desired Sponsorship Level{' '}
            {requiredFields.includes('sponsorshipLevel') && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="sponsorshipLevel"
            {...register(
              'sponsorshipLevel',
              requiredFields.includes('sponsorshipLevel')
                ? { required: 'Sponsorship level is required' }
                : {},
            )}
            type="text"
            placeholder="e.g., Gold, Silver, Bronze"
          />
          {errors.sponsorshipLevel && <FormError message={errors.sponsorshipLevel.message} />}
        </FormItem>
      )}

      {visibleFields.includes('additionalNotes') && (
        <FormItem>
          <Label htmlFor="additionalNotes" className="mb-2">
            Additional Notes{' '}
            {requiredFields.includes('additionalNotes') && <span className="text-red-500">*</span>}
          </Label>
          <Textarea
            id="additionalNotes"
            {...register(
              'additionalNotes',
              requiredFields.includes('additionalNotes')
                ? {
                    required: 'Additional notes are required',
                  }
                : {},
            )}
            placeholder="Tell us about your company and partnership interests..."
            rows={4}
          />
          {errors.additionalNotes && <FormError message={errors.additionalNotes.message} />}
        </FormItem>
      )}

      <div className="pt-6 space-y-3">
        {loading && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                {uploadProgress < 40
                  ? 'Preparing upload...'
                  : uploadProgress < 70
                    ? 'Uploading logo...'
                    : 'Processing registration...'}
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <Button
          disabled={loading}
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Submit Partnership Registration
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                ></path>
              </svg>
            </span>
          )}
        </Button>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 text-center pt-4">
        By submitting this form, you agree to be contacted by the event organizers regarding
        partnership opportunities.
      </p>
    </form>
  )
}
