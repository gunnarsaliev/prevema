'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { eventSchema, type EventFormValues } from '@/lib/schemas/event'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type OrgOption = { id: number; name: string }

type Props =
  | { mode: 'create'; organizations: OrgOption[] }
  | { mode: 'edit'; eventId: string; defaultValues: EventFormValues }

export function EventForm(props: Props) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const organizations = props.mode === 'create' ? props.organizations : []

  const defaultValues: Partial<EventFormValues> =
    props.mode === 'edit'
      ? props.defaultValues
      : {
          // Auto-select the only org; if multiple, the user will pick via the selector below
          organization: organizations.length === 1 ? organizations[0].id : undefined,
          status: 'planning',
          eventType: 'online',
        }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues,
    mode: 'onBlur', // validate on blur, not only on submit
  })

  // useWatch isolates re-renders to only this subscription —
  // the rest of the form does not re-render when eventType changes
  const eventType = useWatch({ control, name: 'eventType' })

  const onSubmit = async (values: EventFormValues) => {
    setServerError(null)
    try {
      const url = props.mode === 'edit' ? `/api/events/${props.eventId}` : '/api/events'
      const method = props.mode === 'edit' ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        // Payload REST shape: { errors: [{ message }] }
        // Custom route shape: { error: string }
        const message =
          data?.errors?.[0]?.message ?? data?.error ?? `Request failed (${res.status})`
        throw new Error(message)
      }

      router.push('/dash/events')
      router.refresh()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Unexpected error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      {serverError && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {serverError}
        </p>
      )}

      {/* Organization selector — only shown when the user belongs to 2+ organizations */}
      {props.mode === 'create' && organizations.length >= 2 && (
        <div className="space-y-1">
          <Label htmlFor="organization">Organization *</Label>
          <Controller
            name="organization"
            control={control}
            rules={{ required: 'Please select an organization' }}
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ''}
                onValueChange={(v) => field.onChange(Number(v))}
              >
                <SelectTrigger id="organization" ref={field.ref}>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={String(org.id)}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.organization && (
            <p className="text-xs text-destructive">{errors.organization.message}</p>
          )}
        </div>
      )}

      {/* Basic info */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Basic info
        </h2>

        <div className="space-y-1">
          <Label htmlFor="name">Event name *</Label>
          <Input id="name" {...register('name')} placeholder="My Event" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Controller is the correct RHF pattern for non-native inputs like Radix Select */}
          <div className="space-y-1">
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status" ref={field.ref}>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="eventType">Event type</Label>
            <Controller
              name="eventType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="eventType" ref={field.ref}>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.eventType && (
              <p className="text-xs text-destructive">{errors.eventType.message}</p>
            )}
          </div>
        </div>

        {/* Only re-renders this section when eventType changes, not the whole form */}
        {eventType === 'physical' && (
          <div className="space-y-1">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} placeholder="123 Main St, City" />
            {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="theme">Theme / tagline</Label>
          <Input id="theme" {...register('theme')} placeholder="Inspiring the future of tech" />
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Dates
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="startDate">Start date *</Label>
            <Input id="startDate" type="datetime-local" {...register('startDate')} />
            {errors.startDate && (
              <p className="text-xs text-destructive">{errors.startDate.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="endDate">End date</Label>
            <Input id="endDate" type="datetime-local" {...register('endDate')} />
            {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="timezone">Timezone</Label>
          <Input id="timezone" {...register('timezone')} placeholder="Europe/Berlin" />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Description
        </h2>

        <div className="space-y-1">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Brief overview of the event…"
            rows={3}
          />
        </div>
      </div>

      {/* Context */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Context
        </h2>

        <div className="space-y-1">
          <Label htmlFor="why">Why</Label>
          <Textarea
            id="why"
            {...register('why')}
            placeholder="Why this event is happening…"
            rows={2}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="what">What</Label>
          <Textarea
            id="what"
            {...register('what')}
            placeholder="What the event is about…"
            rows={2}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="where">Where (context)</Label>
          <Input id="where" {...register('where')} placeholder="Venue name, city, or platform…" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="who">Who</Label>
          <Textarea
            id="who"
            {...register('who')}
            placeholder="Who should attend…"
            rows={2}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {props.mode === 'edit' ? 'Save changes' : 'Create event'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dash/events')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
