'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition, useState } from 'react'
import { EyeIcon, EyeSlashIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/16/solid'
import { Button } from '@/components/catalyst/button'
import { Divider } from '@/components/catalyst/divider'
import { Field, ErrorMessage, Label } from '@/components/catalyst/fieldset'
import { Heading, Subheading } from '@/components/catalyst/heading'
import { Input } from '@/components/catalyst/input'
import { Text } from '@/components/catalyst/text'
import { orgSettingsSchema, type OrgSettingsFormValues } from '@/lib/schemas/organization-settings'
import { updateOrgSettings } from './actions'

interface OrganizationFormProps {
  defaultValues: {
    name: string
    senderName?: string
    fromEmail?: string
    replyToEmail?: string
    resendApiKey?: string
  }
}

export function OrganizationForm({ defaultValues }: OrganizationFormProps) {
  const [isPending, startTransition] = useTransition()
  const [serverMessage, setServerMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState<'name' | 'senderName' | 'fromEmail' | 'replyToEmail' | null>(
    null,
  )

  const handleCopy = (
    field: 'name' | 'senderName' | 'fromEmail' | 'replyToEmail',
    value: string,
  ) => {
    if (!value) return
    navigator.clipboard.writeText(value)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors },
  } = useForm<OrgSettingsFormValues>({
    resolver: zodResolver(orgSettingsSchema),
    defaultValues: {
      name: defaultValues.name,
      senderName: defaultValues.senderName ?? '',
      fromEmail: defaultValues.fromEmail ?? '',
      replyToEmail: defaultValues.replyToEmail ?? '',
      resendApiKey: defaultValues.resendApiKey ?? '',
    },
  })

  const onSubmit = (data: OrgSettingsFormValues) => {
    setServerMessage(null)
    startTransition(async () => {
      const result = await updateOrgSettings(data)
      if (result.success) {
        setServerMessage({ type: 'success', text: result.message })
        reset(data)
      } else if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          setError(field as keyof OrgSettingsFormValues, {
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
      <Heading>Organization</Heading>
      <Divider className="my-10 mt-6" />

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
          <Subheading>Organization Name</Subheading>
          <Text>This will be displayed on your public profile.</Text>
        </div>
        <div className="space-y-4">
          <Field>
            <div className="relative">
              <Input
                aria-label="Organization Name"
                placeholder="Acme Inc."
                {...register('name')}
                data-invalid={errors.name ? true : undefined}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => handleCopy('name', watch('name') ?? '')}
                aria-label="Copy organization name"
                className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                {copied === 'name' ? (
                  <CheckIcon className="size-4 text-green-500" />
                ) : (
                  <DocumentDuplicateIcon className="size-4" />
                )}
              </button>
            </div>
            {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
          </Field>
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Email Configuration</Subheading>
          <Text>Used as the sender identity for outgoing emails from this organization.</Text>
        </div>
        <div className="space-y-4">
          <Field>
            <Label>Sender name</Label>
            <div className="relative">
              <Input
                aria-label="Sender name"
                placeholder="Acme Events"
                {...register('senderName')}
                data-invalid={errors.senderName ? true : undefined}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => handleCopy('senderName', watch('senderName') ?? '')}
                aria-label="Copy sender name"
                className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                {copied === 'senderName' ? (
                  <CheckIcon className="size-4 text-green-500" />
                ) : (
                  <DocumentDuplicateIcon className="size-4" />
                )}
              </button>
            </div>
            {errors.senderName && <ErrorMessage>{errors.senderName.message}</ErrorMessage>}
          </Field>
          <Field>
            <Label>From email</Label>
            <div className="relative">
              <Input
                type="email"
                aria-label="From email"
                placeholder="noreply@acme.com"
                {...register('fromEmail')}
                data-invalid={errors.fromEmail ? true : undefined}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => handleCopy('fromEmail', watch('fromEmail') ?? '')}
                aria-label="Copy from email"
                className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                {copied === 'fromEmail' ? (
                  <CheckIcon className="size-4 text-green-500" />
                ) : (
                  <DocumentDuplicateIcon className="size-4" />
                )}
              </button>
            </div>
            {errors.fromEmail && <ErrorMessage>{errors.fromEmail.message}</ErrorMessage>}
          </Field>
          <Field>
            <Label>Reply-to email</Label>
            <div className="relative">
              <Input
                type="email"
                aria-label="Reply-to email"
                placeholder="hello@acme.com"
                {...register('replyToEmail')}
                data-invalid={errors.replyToEmail ? true : undefined}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => handleCopy('replyToEmail', watch('replyToEmail') ?? '')}
                aria-label="Copy reply-to email"
                className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                {copied === 'replyToEmail' ? (
                  <CheckIcon className="size-4 text-green-500" />
                ) : (
                  <DocumentDuplicateIcon className="size-4" />
                )}
              </button>
            </div>
            {errors.replyToEmail && <ErrorMessage>{errors.replyToEmail.message}</ErrorMessage>}
          </Field>
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Resend API Key</Subheading>
          <Text>
            Your secret API key from Resend for sending emails. Leave blank to use the default.
          </Text>
        </div>
        <div>
          <Field>
            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                aria-label="Resend API key"
                placeholder="re_..."
                {...register('resendApiKey')}
                data-invalid={errors.resendApiKey ? true : undefined}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? 'Hide API key' : 'Show API key'}
                className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                {showKey ? <EyeSlashIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </button>
            </div>
            {errors.resendApiKey && <ErrorMessage>{errors.resendApiKey.message}</ErrorMessage>}
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
              senderName: defaultValues.senderName ?? '',
              fromEmail: defaultValues.fromEmail ?? '',
              replyToEmail: defaultValues.replyToEmail ?? '',
              resendApiKey: defaultValues.resendApiKey ?? '',
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
