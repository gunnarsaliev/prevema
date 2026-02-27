'use client'

import { useState, useTransition, useEffect } from 'react'
import { Camera, X, Lock, Mail, Loader2 } from 'lucide-react'
import { updateUserProfile } from '../actions'
import { useAuth } from '@/providers/Auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from '@/components/ui/file-upload'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface PersonalInfoFormProps {
  defaultValues: {
    name?: string
    email: string
    avatar?: string
  }
}

export function PersonalInfoForm({ defaultValues }: PersonalInfoFormProps) {
  const [avatarFiles, setAvatarFiles] = useState<File[]>([])
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isAvatarLoading, setIsAvatarLoading] = useState(false)
  const { refreshUser } = useAuth()

  const initials = defaultValues.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const avatarPreview =
    avatarFiles.length > 0 ? URL.createObjectURL(avatarFiles[0]) : defaultValues.avatar

  // Set loading state when avatar files change
  useEffect(() => {
    if (avatarFiles.length > 0) {
      setIsAvatarLoading(true)
    }
  }, [avatarFiles])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)

    const formData = new FormData(e.currentTarget)

    // Client-side validation
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const newEmail = formData.get('newEmail') as string
    const currentPassword = formData.get('currentPassword') as string

    // Check if trying to change email or password without current password
    if ((newEmail || newPassword) && !currentPassword) {
      setMessage({
        type: 'error',
        text: 'Current password is required to change email or password',
      })
      return
    }

    // Validate password match
    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    // Validate password length
    if (newPassword && newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long' })
      return
    }

    // Add avatar file if one was selected
    if (avatarFiles.length > 0) {
      formData.set('avatar', avatarFiles[0])
    }

    startTransition(async () => {
      const result = await updateUserProfile(formData)

      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        // Refresh user data in Auth context to update avatar immediately
        await refreshUser()
        // Reload to show updated data and clear password fields
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6">
        <h2 className="text-lg font-semibold">Personal Information</h2>
        <p className="text-sm text-muted-foreground">Update your photo and personal details</p>

        {message && (
          <div
            className={cn(
              'mt-4 rounded-lg border p-3 text-sm',
              message.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
                : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
            )}
          >
            {message.text}
          </div>
        )}

        <div className="mt-6 space-y-6">
          {/* Avatar */}
          <FileUpload
            value={avatarFiles}
            onValueChange={setAvatarFiles}
            accept="image/*"
            maxFiles={1}
            maxSize={2 * 1024 * 1024}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <Avatar className="relative size-24 shrink-0">
                {isAvatarLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-muted/80 backdrop-blur-sm">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  </div>
                )}
                <AvatarImage
                  src={avatarPreview}
                  alt={defaultValues.name}
                  className="object-cover"
                  onLoad={() => setIsAvatarLoading(false)}
                  onError={() => setIsAvatarLoading(false)}
                />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <FileUploadDropzone className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/50">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <Camera className="size-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      <FileUploadTrigger asChild>
                        <Button variant="link" className="h-auto p-0">
                          Click to upload
                        </Button>
                      </FileUploadTrigger>{' '}
                      or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG or GIF (max. 2MB)</p>
                  </div>
                </FileUploadDropzone>
                {avatarFiles.length > 0 && (
                  <FileUploadList>
                    {avatarFiles.map((file, index) => (
                      <FileUploadItem
                        key={index}
                        value={file}
                        className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3"
                      >
                        <FileUploadItemPreview className="size-10 shrink-0 rounded-md" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <FileUploadItemDelete asChild>
                          <Button variant="ghost" size="icon" className="size-8 shrink-0">
                            <X className="size-4" />
                          </Button>
                        </FileUploadItemDelete>
                      </FileUploadItem>
                    ))}
                  </FileUploadList>
                )}
              </div>
            </div>
          </FileUpload>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" defaultValue={defaultValues.name} />
          </div>

          <Separator />

          {/* Email Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Email Address</h3>
              <p className="text-xs text-muted-foreground">Update your email address</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentEmail">Current Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="currentEmail"
                  type="email"
                  className="pl-10 bg-muted"
                  value={defaultValues.email}
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email (optional)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="newEmail"
                  name="newEmail"
                  type="email"
                  className="pl-10"
                  placeholder="Enter new email address"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Leave blank to keep current email
              </p>
            </div>
          </div>

          <Separator />

          {/* Password Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Change Password</h3>
              <p className="text-xs text-muted-foreground">Update your password</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  className="pl-10"
                  placeholder="Enter current password"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Required to change email or password
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password (optional)</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    className="pl-10"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    className="pl-10"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave blank to keep current password. Minimum 8 characters.
            </p>
          </div>
        </div>
      </div>

      {/* Footer with actions */}
      <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
        <Button type="button" variant="outline" onClick={() => window.location.reload()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
