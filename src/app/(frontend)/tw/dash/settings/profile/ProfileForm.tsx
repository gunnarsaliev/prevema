'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition, useState, useRef } from 'react'
import { Button } from '@/components/catalyst/button'
import { Divider } from '@/components/catalyst/divider'
import { Field, ErrorMessage, Label } from '@/components/catalyst/fieldset'
import { Heading, Subheading } from '@/components/catalyst/heading'
import { Input } from '@/components/catalyst/input'
import { Text } from '@/components/catalyst/text'
import { Avatar } from '@/components/catalyst/avatar'
import { profileSchema, type ProfileFormValues } from '@/lib/schemas/profile'
import { updateProfile, uploadProfileImage } from './actions'

interface ProfileFormProps {
  defaultValues: {
    name: string
    email: string
    avatarUrl?: string | null
  }
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isUploading, startUpload] = useTransition()
  const [serverMessage, setServerMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [avatarMessage, setAvatarMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null | undefined>(
    defaultValues.avatarUrl,
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initials = defaultValues.name
    ? defaultValues.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : undefined

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarMessage(null)
    setAvatarPreview(URL.createObjectURL(file))
    const formData = new FormData()
    formData.set('avatar', file)
    startUpload(async () => {
      const result = await uploadProfileImage(formData)
      setAvatarMessage({ type: result.success ? 'success' : 'error', text: result.message })
      if (!result.success) {
        setAvatarPreview(defaultValues.avatarUrl)
      }
    })
    e.target.value = ''
  }

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: defaultValues.name,
      newEmail: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = (data: ProfileFormValues) => {
    setServerMessage(null)
    startTransition(async () => {
      const result = await updateProfile(data)
      if (result.success) {
        setServerMessage({ type: 'success', text: result.message })
        reset({
          name: data.name,
          newEmail: '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      } else if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          setError(field as keyof ProfileFormValues, {
            type: 'server',
            message: messages?.[0],
          })
        })
      } else {
        setServerMessage({ type: 'error', text: result.message ?? 'Something went wrong' })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl">
      <Heading>Profile</Heading>
      <Divider className="my-10 mt-6" />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Profile Photo</Subheading>
          <Text>Upload a photo to personalise your account. JPG, PNG or WebP · Max 2 MB.</Text>
        </div>
        <div>
          <div className="flex items-center gap-6">
            <Avatar
              src={avatarPreview ?? undefined}
              initials={!avatarPreview ? initials : undefined}
              alt="Profile photo"
              className="size-16 bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
            />
            <div className="space-y-2">
              <Button
                type="button"
                outline
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading…' : 'Change photo'}
              </Button>
              <Text>JPG, PNG or WebP · Max 2 MB</Text>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
          {avatarMessage && (
            <p
              className={`mt-3 text-sm ${
                avatarMessage.type === 'success'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {avatarMessage.text}
            </p>
          )}
        </div>
      </section>

      <Divider className="my-10" soft />

      {serverMessage && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            serverMessage.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
          }`}
        >
          {serverMessage.text}
        </div>
      )}

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Full Name</Subheading>
          <Text>This will be displayed on your public profile.</Text>
        </div>
        <div>
          <Field>
            <Input
              aria-label="Full Name"
              {...register('name')}
              data-invalid={errors.name ? true : undefined}
            />
            {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
          </Field>
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Email Address</Subheading>
          <Text>Enter a new email to change your current one.</Text>
        </div>
        <div className="space-y-4">
          <Field>
            <Label>Current email</Label>
            <Input
              type="email"
              aria-label="Current email"
              defaultValue={defaultValues.email}
              disabled
            />
          </Field>
          <Field>
            <Label>New email (optional)</Label>
            <Input
              type="email"
              aria-label="New email"
              placeholder="Enter new email address"
              {...register('newEmail')}
              data-invalid={errors.newEmail ? true : undefined}
            />
            {errors.newEmail && <ErrorMessage>{errors.newEmail.message}</ErrorMessage>}
          </Field>
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Change Password</Subheading>
          <Text>Leave blank to keep your current password. Minimum 8 characters.</Text>
        </div>
        <div className="space-y-4">
          <Field>
            <Label>Current password</Label>
            <Input
              type="password"
              aria-label="Current password"
              placeholder="Required to change email or password"
              {...register('currentPassword')}
              data-invalid={errors.currentPassword ? true : undefined}
            />
            {errors.currentPassword && (
              <ErrorMessage>{errors.currentPassword.message}</ErrorMessage>
            )}
          </Field>
          <Field>
            <Label>New password (optional)</Label>
            <Input
              type="password"
              aria-label="New password"
              placeholder="Enter new password"
              {...register('newPassword')}
              data-invalid={errors.newPassword ? true : undefined}
            />
            {errors.newPassword && <ErrorMessage>{errors.newPassword.message}</ErrorMessage>}
          </Field>
          <Field>
            <Label>Confirm new password</Label>
            <Input
              type="password"
              aria-label="Confirm new password"
              placeholder="Confirm new password"
              {...register('confirmPassword')}
              data-invalid={errors.confirmPassword ? true : undefined}
            />
            {errors.confirmPassword && (
              <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>
            )}
          </Field>
        </div>
      </section>

      <Divider className="my-10" soft />

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          plain
          onClick={() =>
            reset({
              name: defaultValues.name,
              newEmail: '',
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            })
          }
        >
          Reset
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
