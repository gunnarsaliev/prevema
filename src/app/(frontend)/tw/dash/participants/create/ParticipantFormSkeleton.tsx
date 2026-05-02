import { Skeleton } from '@/components/ui/skeleton'
import { Divider } from '@/components/catalyst/divider'
import { Heading, Subheading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'
import { Button } from '@/components/catalyst/button'

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm/6 font-medium text-zinc-950 dark:text-white">{children}</span>
}

export function ParticipantFormSkeleton({ mode = 'create' }: { mode?: 'create' | 'edit' }) {
  return (
    <div className="mx-auto max-w-4xl">
      <Heading>{mode === 'edit' ? 'Edit Participant' : 'New Participant'}</Heading>
      <Divider className="my-10 mt-6" />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Profile Photo</Subheading>
          <Text>Upload a headshot or profile photo. JPG, PNG or WebP · Max 5 MB.</Text>
        </div>
        <div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Identity</Subheading>
          <Text>Basic details about the participant.</Text>
        </div>
        <div className="space-y-6">
          {['Name *', 'Email *', 'Role *', 'Status'].map((label) => (
            <div key={label} className="space-y-1.5">
              <FieldLabel>{label}</FieldLabel>
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Profile</Subheading>
          <Text>Personal and contact details.</Text>
        </div>
        <div className="space-y-6">
          {['Country', 'Phone number'].map((label) => (
            <div key={label} className="space-y-1.5">
              <FieldLabel>{label}</FieldLabel>
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
          <div className="space-y-1.5">
            <FieldLabel>Biography</FieldLabel>
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Company</Subheading>
          <Text>Professional affiliation.</Text>
        </div>
        <div className="space-y-6">
          {['Company name', 'Position / title', 'Company website'].map((label) => (
            <div key={label} className="space-y-1.5">
              <FieldLabel>{label}</FieldLabel>
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </section>

      <Divider className="my-10" soft />

      <div className="flex justify-end gap-4">
        <Button type="button" plain disabled>Cancel</Button>
        <Button type="button" disabled>{mode === 'edit' ? 'Save changes' : 'Create participant'}</Button>
      </div>
    </div>
  )
}
