'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { ImageUploadPreview } from '@/components/forms/ImageUploadPreview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'
import React, { useCallback, useMemo, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'

type SocialLink = {
  platform: string
  url: string
}

type FormData = {
  name: string
  email: string
  imageUrl?: FileList
  biography?: string
  country?: string
  phoneNumber?: string
  companyLogoUrl?: FileList
  companyName?: string
  companyPosition?: string
  companyWebsite?: string
  socialLinks?: SocialLink[]
  presentationTopic?: string
  presentationSummary?: string
  technicalRequirements?: string
}

type EventOption = { id: string; name: string }

type Props = {
  participantTypeId: string
  requiredFields: string[]
  optionalFields: string[]
  eventId: string | null
  events?: EventOption[] | null
}

export const PublicParticipantForm: React.FC<Props> = ({
  participantTypeId,
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
        let imageUrlId: string | undefined
        let companyLogoUrlId: string | undefined
        let currentProgress = 10

        // Handle profile photo upload
        if (data.imageUrl && data.imageUrl.length > 0) {
          setUploadProgress(currentProgress)
          imageUrlId = await uploadImage(data.imageUrl[0], `Profile photo for ${data.name}`)
          currentProgress += 25
          setUploadProgress(currentProgress)
        }

        // Handle company logo upload
        if (data.companyLogoUrl && data.companyLogoUrl.length > 0) {
          setUploadProgress(currentProgress)
          companyLogoUrlId = await uploadImage(
            data.companyLogoUrl[0],
            `Company logo for ${data.companyName || data.name}`,
          )
          currentProgress += 25
          setUploadProgress(currentProgress)
        }

        setUploadProgress(70)

        // Filter out empty social links
        const filteredSocialLinks = data.socialLinks?.filter((link) => link.url.trim() !== '') || []

        // Submit participant data
        const participantData = {
          name: data.name,
          email: data.email,
          event: parseInt(selectedEventId),
          participantType: parseInt(participantTypeId),
          status: 'not-approved',
          ...(imageUrlId && { imageUrl: imageUrlId }),
          ...(visibleFields.includes('biography') && { biography: data.biography }),
          ...(visibleFields.includes('country') && { country: data.country }),
          ...(visibleFields.includes('phoneNumber') && { phoneNumber: data.phoneNumber }),
          ...(companyLogoUrlId && { companyLogoUrl: companyLogoUrlId }),
          ...(visibleFields.includes('companyName') && { companyName: data.companyName }),
          ...(visibleFields.includes('companyPosition') && {
            companyPosition: data.companyPosition,
          }),
          ...(visibleFields.includes('companyWebsite') && { companyWebsite: data.companyWebsite }),
          ...(visibleFields.includes('socialLinks') &&
            filteredSocialLinks.length > 0 && { socialLinks: filteredSocialLinks }),
          ...(visibleFields.includes('presentationTopic') && {
            presentationTopic: data.presentationTopic,
          }),
          ...(visibleFields.includes('presentationSummary') && {
            presentationSummary: data.presentationSummary,
          }),
          ...(visibleFields.includes('technicalRequirements') && {
            technicalRequirements: data.technicalRequirements,
          }),
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/participants`, {
          body: JSON.stringify(participantData),
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

          let errorMessage = 'Failed to submit registration'

          if (errorData.errors && Array.isArray(errorData.errors)) {
            const emailError = errorData.errors.find(
              (err) => err.field === 'email' || err.message?.toLowerCase().includes('email'),
            )
            if (emailError) {
              errorMessage = 'This email is already registered for this event'
            } else {
              errorMessage = errorData.errors
                .map((err) => err.message || 'Unknown error')
                .join(', ')
            }
          } else if (errorData.message) {
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
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    [participantTypeId, requiredFields, optionalFields, selectedEventId, visibleFields],
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
          Registration Submitted Successfully!
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          Thank you for your registration. We've received your submission and our team will review
          it shortly. We'll contact you at the email address you provided.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
            <strong>What's next?</strong> You'll receive a confirmation email once your registration
            has been approved.
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

      {/* Basic Info */}
      <FormItem>
        <Label htmlFor="name" className="mb-2">
          Full Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          {...register('name', { required: 'Full name is required' })}
          type="text"
          placeholder="Enter your full name"
        />
        {errors.name && <FormError message={errors.name.message} />}
      </FormItem>

      <FormItem>
        <Label htmlFor="email" className="mb-2">
          Email Address <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          type="email"
          placeholder="your.email@example.com"
        />
        {errors.email && <FormError message={errors.email.message} />}
      </FormItem>

      {/* Profile Photo */}
      {visibleFields.includes('imageUrl') && (
        <FormItem>
          <ImageUploadPreview
            id="imageUrl"
            label="Profile Photo"
            required={requiredFields.includes('imageUrl')}
            register={register}
            errors={errors.imageUrl}
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            maxSizeMB={5}
          />
        </FormItem>
      )}

      {/* Biography */}
      {visibleFields.includes('biography') && (
        <FormItem>
          <Label htmlFor="biography" className="mb-2">
            Biography{' '}
            {requiredFields.includes('biography') && <span className="text-red-500">*</span>}
          </Label>
          <Textarea
            id="biography"
            {...register(
              'biography',
              requiredFields.includes('biography') ? { required: 'Biography is required' } : {},
            )}
            placeholder="Tell us about yourself..."
            rows={5}
          />
          {errors.biography && <FormError message={errors.biography.message} />}
        </FormItem>
      )}

      {/* Country */}
      {visibleFields.includes('country') && (
        <FormItem>
          <Label htmlFor="country" className="mb-2">
            Country {requiredFields.includes('country') && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="country"
            {...register(
              'country',
              requiredFields.includes('country') ? { required: 'Country is required' } : {},
            )}
            type="text"
            placeholder="Enter your country"
          />
          {errors.country && <FormError message={errors.country.message} />}
        </FormItem>
      )}

      {/* Phone Number */}
      {visibleFields.includes('phoneNumber') && (
        <FormItem>
          <Label htmlFor="phoneNumber" className="mb-2">
            Phone Number{' '}
            {requiredFields.includes('phoneNumber') && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="phoneNumber"
            {...register(
              'phoneNumber',
              requiredFields.includes('phoneNumber')
                ? { required: 'Phone number is required' }
                : {},
            )}
            type="tel"
            placeholder="+1 (555) 123-4567"
          />
          {errors.phoneNumber && <FormError message={errors.phoneNumber.message} />}
        </FormItem>
      )}

      {/* Company Logo */}
      {visibleFields.includes('companyLogoUrl') && (
        <FormItem>
          <ImageUploadPreview
            id="companyLogoUrl"
            label="Company Logo"
            required={requiredFields.includes('companyLogoUrl')}
            register={register}
            errors={errors.companyLogoUrl}
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            maxSizeMB={5}
          />
        </FormItem>
      )}

      {/* Company Name */}
      {visibleFields.includes('companyName') && (
        <FormItem>
          <Label htmlFor="companyName" className="mb-2">
            Company Name{' '}
            {requiredFields.includes('companyName') && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="companyName"
            {...register(
              'companyName',
              requiredFields.includes('companyName')
                ? { required: 'Company name is required' }
                : {},
            )}
            type="text"
            placeholder="Enter your company name"
          />
          {errors.companyName && <FormError message={errors.companyName.message} />}
        </FormItem>
      )}

      {/* Company Position */}
      {visibleFields.includes('companyPosition') && (
        <FormItem>
          <Label htmlFor="companyPosition" className="mb-2">
            Company Position{' '}
            {requiredFields.includes('companyPosition') && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="companyPosition"
            {...register(
              'companyPosition',
              requiredFields.includes('companyPosition')
                ? { required: 'Company position is required' }
                : {},
            )}
            type="text"
            placeholder="e.g., CEO, CTO, Marketing Director"
          />
          {errors.companyPosition && <FormError message={errors.companyPosition.message} />}
        </FormItem>
      )}

      {/* Company Website */}
      {visibleFields.includes('companyWebsite') && (
        <FormItem>
          <Label htmlFor="companyWebsite" className="mb-2">
            Company Website{' '}
            {requiredFields.includes('companyWebsite') && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="companyWebsite"
            {...register(
              'companyWebsite',
              requiredFields.includes('companyWebsite')
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
          {errors.companyWebsite && <FormError message={errors.companyWebsite.message} />}
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
                  <option value="twitter">Twitter/X</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
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

      {/* Presentation Topic */}
      {visibleFields.includes('presentationTopic') && (
        <FormItem>
          <Label htmlFor="presentationTopic" className="mb-2">
            Presentation Topic{' '}
            {requiredFields.includes('presentationTopic') && (
              <span className="text-red-500">*</span>
            )}
          </Label>
          <Input
            id="presentationTopic"
            {...register(
              'presentationTopic',
              requiredFields.includes('presentationTopic')
                ? { required: 'Presentation topic is required' }
                : {},
            )}
            type="text"
            placeholder="Enter your presentation or lecture topic"
          />
          {errors.presentationTopic && <FormError message={errors.presentationTopic.message} />}
        </FormItem>
      )}

      {/* Presentation Summary */}
      {visibleFields.includes('presentationSummary') && (
        <FormItem>
          <Label htmlFor="presentationSummary" className="mb-2">
            Presentation Summary{' '}
            {requiredFields.includes('presentationSummary') && (
              <span className="text-red-500">*</span>
            )}
          </Label>
          <Textarea
            id="presentationSummary"
            {...register(
              'presentationSummary',
              requiredFields.includes('presentationSummary')
                ? {
                    required: 'Presentation summary is required',
                  }
                : {},
            )}
            placeholder="Provide a brief summary of your presentation..."
            rows={4}
          />
          {errors.presentationSummary && <FormError message={errors.presentationSummary.message} />}
        </FormItem>
      )}

      {/* Technical Requirements */}
      {visibleFields.includes('technicalRequirements') && (
        <FormItem>
          <Label htmlFor="technicalRequirements" className="mb-2">
            Technical Requirements{' '}
            {requiredFields.includes('technicalRequirements') && (
              <span className="text-red-500">*</span>
            )}
          </Label>
          <Textarea
            id="technicalRequirements"
            {...register(
              'technicalRequirements',
              requiredFields.includes('technicalRequirements')
                ? {
                    required: 'Technical requirements are required',
                  }
                : {},
            )}
            placeholder="List any technical equipment or setup you need..."
            rows={4}
          />
          {errors.technicalRequirements && (
            <FormError message={errors.technicalRequirements.message} />
          )}
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
                    ? 'Uploading images...'
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
              Submit Registration
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
        By submitting this form, you agree to be contacted by the event organizers.
      </p>
    </form>
  )
}
