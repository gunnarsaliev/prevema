'use client'

import { useState, useTransition } from 'react'
import {
  Building2,
  Camera,
  ChevronRight,
  Globe,
  Link2,
  Mail,
  MapPin,
  Monitor,
  Moon,
  Phone,
  Settings,
  Sun,
  User,
  X,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { updateOrganization, updateUserProfile } from '@/app/(frontend)/dash/settings/actions'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { InviteUser2 } from '@/components/invite-user2'

interface ProfileData {
  name: string
  username: string
  email: string
  avatar?: string
  bio?: string
  phone?: string
  location?: string
  website?: string
  twitter?: string
  linkedin?: string
  github?: string
  timezone?: string
  language?: string
  orgName?: string
  orgSlug?: string
  orgSenderName?: string
  orgFromEmail?: string
  orgReplyToEmail?: string
  orgResendApiKey?: string
}

interface SettingsProfile4Props {
  defaultValues?: Partial<ProfileData>
  className?: string
}

const sections = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'contact', label: 'Contact', icon: Mail },
  { id: 'social', label: 'Social Links', icon: Link2 },
  { id: 'preferences', label: 'Preferences', icon: Settings },
  { id: 'organization', label: 'Organization', icon: Building2 },
]

const SettingsProfile4 = ({
  defaultValues = {
    name: 'Alex Morgan',
    username: 'alexmorgan',
    email: 'alex.morgan@email.com',
    avatar: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar8.jpg',
    bio: 'Product designer with 8+ years of experience crafting intuitive digital experiences. Passionate about accessibility and design systems.',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'https://alexmorgan.design',
    twitter: 'alexmorgan',
    linkedin: 'alexmorgan',
    github: 'alexmorgan',
    timezone: 'America/Los_Angeles',
    language: 'en',
  },
  className,
}: SettingsProfile4Props) => {
  const [activeSection, setActiveSection] = useState('personal')
  const [avatarFiles, setAvatarFiles] = useState<File[]>([])
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { theme, setTheme } = useTheme()

  const initials = defaultValues.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const avatarPreview =
    avatarFiles.length > 0 ? URL.createObjectURL(avatarFiles[0]) : defaultValues.avatar

  const handlePersonalInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)

    const formData = new FormData(e.currentTarget)

    // Add avatar file if one was selected
    if (avatarFiles.length > 0) {
      formData.set('avatar', avatarFiles[0])
    }

    startTransition(async () => {
      const result = await updateUserProfile(formData)

      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        // Optionally reload to show updated data
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    })
  }

  const handleOrganizationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await updateOrganization(formData)

      if (result.success) {
        setMessage({ type: 'success', text: result.message })
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    })
  }

  return (
    <section className={cn('py-16', className)}>
      <div className="container">
        {/* Header */}
        {/* <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Settings</span>
            <ChevronRight className="size-4" />
            <span className="text-foreground">Edit Profile</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold">Edit Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div> */}

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Navigation */}
          <aside className="lg:w-56 lg:shrink-0">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                      activeSection === section.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon className="size-4" />
                    {section.label}
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="min-w-0 flex-1">
            <div className="rounded-xl border bg-card shadow-sm">
              {/* Personal Info Section */}
              {activeSection === 'personal' && (
                <form onSubmit={handlePersonalInfoSubmit}>
                  <div className="p-6">
                    <h2 className="text-lg font-semibold">Personal Information</h2>
                    <p className="text-sm text-muted-foreground">
                      Update your photo and personal details
                    </p>

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
                        <Avatar className="size-24 shrink-0">
                          <AvatarImage
                            src={avatarPreview}
                            alt={defaultValues.name}
                            className="object-cover"
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
                              <p className="text-xs text-muted-foreground">
                                PNG, JPG or GIF (max. 2MB)
                              </p>
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

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full name</Label>
                        <Input id="name" name="name" defaultValue={defaultValues.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <div className="flex">
                          <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                            @
                          </span>
                          <Input
                            id="username"
                            name="username"
                            className="rounded-l-none"
                            defaultValue={defaultValues.username}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        defaultValue={defaultValues.bio}
                        placeholder="Write a few sentences about yourself"
                      />
                      <p className="text-xs text-muted-foreground">
                        Brief description for your profile
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
              )}

              {/* Contact Section */}
              {activeSection === 'contact' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold">Contact Information</h2>
                  <p className="text-sm text-muted-foreground">How can people reach you?</p>

                  <div className="mt-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          className="pl-10"
                          defaultValue={defaultValues.email}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          className="pl-10"
                          defaultValue={defaultValues.phone}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="location"
                          className="pl-10"
                          defaultValue={defaultValues.location}
                          placeholder="City, Country"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="website"
                          type="url"
                          className="pl-10"
                          defaultValue={defaultValues.website}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Links Section */}
              {activeSection === 'social' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold">Social Links</h2>
                  <p className="text-sm text-muted-foreground">
                    Connect your social media accounts
                  </p>

                  <div className="mt-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter / X</Label>
                      <div className="flex">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                          x.com/
                        </span>
                        <Input
                          id="twitter"
                          className="rounded-l-none"
                          defaultValue={defaultValues.twitter}
                          placeholder="username"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <div className="flex">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                          linkedin.com/in/
                        </span>
                        <Input
                          id="linkedin"
                          className="rounded-l-none"
                          defaultValue={defaultValues.linkedin}
                          placeholder="username"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="github">GitHub</Label>
                      <div className="flex">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                          github.com/
                        </span>
                        <Input
                          id="github"
                          className="rounded-l-none"
                          defaultValue={defaultValues.github}
                          placeholder="username"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Section */}
              {activeSection === 'preferences' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold">Preferences</h2>
                  <p className="text-sm text-muted-foreground">Customize your experience</p>

                  <div className="mt-6 space-y-6">
                    {/* Theme switcher */}
                    <div className="space-y-2">
                      <Label>Appearance</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {(
                          [
                            { value: 'light', label: 'Light', Icon: Sun },
                            { value: 'dark', label: 'Dark', Icon: Moon },
                            { value: 'system', label: 'System', Icon: Monitor },
                          ] as const
                        ).map(({ value, label, Icon }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setTheme(value)}
                            className={cn(
                              'flex flex-col items-center gap-2 rounded-lg border px-4 py-3 text-sm transition-colors',
                              theme === value
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border text-muted-foreground hover:border-primary/50 hover:bg-muted',
                            )}
                          >
                            <Icon className="size-5" />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select defaultValue={defaultValues.language}>
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                          <SelectItem value="ja">日本語</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue={defaultValues.timezone}>
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                          <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Organization Section */}
              {activeSection === 'organization' && (
                <form onSubmit={handleOrganizationSubmit}>
                  <div className="p-6">
                    <h2 className="text-lg font-semibold">Organization</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your organization details and email settings
                    </p>

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
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="orgName">Organization name</Label>
                          <Input
                            id="orgName"
                            name="orgName"
                            defaultValue={defaultValues.orgName}
                            placeholder="Acme Inc."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="orgSlug">Slug</Label>
                          <Input
                            id="orgSlug"
                            defaultValue={defaultValues.orgSlug}
                            disabled
                            className="bg-muted text-muted-foreground"
                          />
                          <p className="text-xs text-muted-foreground">Auto-generated, cannot be changed</p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-sm font-medium">Email configuration</h3>
                        <p className="text-sm text-muted-foreground">
                          Used as the sender identity for outgoing emails
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="orgSenderName">Sender name</Label>
                        <Input
                          id="orgSenderName"
                          name="orgSenderName"
                          defaultValue={defaultValues.orgSenderName}
                          placeholder="Acme Events"
                        />
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="orgFromEmail">From email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="orgFromEmail"
                              name="orgFromEmail"
                              type="email"
                              className="pl-10"
                              defaultValue={defaultValues.orgFromEmail}
                              placeholder="noreply@acme.com"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="orgReplyToEmail">Reply-to email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="orgReplyToEmail"
                              name="orgReplyToEmail"
                              type="email"
                              className="pl-10"
                              defaultValue={defaultValues.orgReplyToEmail}
                              placeholder="hello@acme.com"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="orgResendApiKey">Resend API key</Label>
                        <Input
                          id="orgResendApiKey"
                          name="orgResendApiKey"
                          type="password"
                          defaultValue={defaultValues.orgResendApiKey}
                          placeholder="re_..."
                        />
                        <p className="text-xs text-muted-foreground">
                          Your secret API key from Resend for sending emails
                        </p>
                      </div>

                      <Separator />

                      <InviteUser2 heading="Invite Users" className="py-0 [&>.container]:px-0" />
                    </div>
                  </div>

                  {/* Footer with actions - Only show for organization section */}
                  <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
                    <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? 'Saving...' : 'Save changes'}
                    </Button>
                  </div>
                </form>
              )}

              {/* Footer with actions - Only show for sections without their own form */}
              {activeSection !== 'organization' && activeSection !== 'personal' && (
                <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save changes</Button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </section>
  )
}

export { SettingsProfile4 }
