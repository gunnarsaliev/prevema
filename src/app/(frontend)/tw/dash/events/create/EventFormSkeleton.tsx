import { Skeleton } from '@/components/ui/skeleton'
import { Divider } from '@/components/catalyst/divider'
import { Heading, Subheading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'
import { Button } from '@/components/catalyst/button'

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm/6 font-medium text-zinc-950 dark:text-white">{children}</span>
  )
}

export function EventFormSkeleton({ mode = 'create' }: { mode?: 'create' | 'edit' }) {
  return (
    <div className="mx-auto max-w-4xl">
      <Heading>{mode === 'edit' ? 'Edit Event' : 'New Event'}</Heading>
      <Divider className="my-10 mt-6" />

      {/* Event Image */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Event Image</Subheading>
          <Text>Upload a cover image for your event. JPG, PNG or WebP · Max 5 MB.</Text>
        </div>
        <div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Event Details */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Event Details</Subheading>
          <Text>Core information about your event.</Text>
        </div>
        <div className="space-y-6">
          <div className="space-y-1.5">
            <FieldLabel>Event name *</FieldLabel>
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FieldLabel>Start date *</FieldLabel>
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>End date</FieldLabel>
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Status</FieldLabel>
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Event type</FieldLabel>
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Theme / tagline</FieldLabel>
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Description */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Description</Subheading>
          <Text>A brief overview of what the event is about.</Text>
        </div>
        <div>
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Context */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Context</Subheading>
          <Text>Help attendees understand the purpose and scope of your event.</Text>
        </div>
        <div className="space-y-6">
          <div className="space-y-1.5">
            <FieldLabel>Why</FieldLabel>
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>What</FieldLabel>
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Where (context)</FieldLabel>
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Who</FieldLabel>
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </section>

      <Divider className="my-10" soft />

      <div className="flex justify-end gap-4">
        <Button type="button" plain disabled>
          Cancel
        </Button>
        <Button type="button" disabled>
          {mode === 'edit' ? 'Save changes' : 'Create event'}
        </Button>
      </div>
    </div>
  )
}
