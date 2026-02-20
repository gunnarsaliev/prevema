'use client'

import { useState, useTransition } from 'react'
import { Mail } from 'lucide-react'
import { updateOrganization } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { InviteUser2 } from '@/components/invite-user2'

interface OrganizationFormProps {
  defaultValues: {
    orgName?: string
    orgSlug?: string
    orgSenderName?: string
    orgFromEmail?: string
    orgReplyToEmail?: string
    orgResendApiKey?: string
  }
}

export function OrganizationForm({ defaultValues }: OrganizationFormProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    <form onSubmit={handleSubmit}>
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
