import { Skeleton } from '@/components/ui/skeleton'
import { Divider } from '@/components/catalyst/divider'
import { Heading, Subheading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'
import { Button } from '@/components/catalyst/button'

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm/6 font-medium text-zinc-950 dark:text-white">{children}</span>
}

export function PartnerFormSkeleton({ mode = 'create' }: { mode?: 'create' | 'edit' }) {
  return (
    <div className="mx-auto max-w-4xl">
      <Heading>{mode === 'edit' ? 'Edit Partner' : 'New Partner'}</Heading>
      <Divider className="my-10 mt-6" />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Company Logo</Subheading>
          <Text>Upload a logo image. JPG, PNG or WebP · Max 5 MB.</Text>
        </div>
        <div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Company Details</Subheading>
          <Text>Core information about the partner company.</Text>
        </div>
        <div className="space-y-6">
          {['Company name *', 'Partner type *', 'Tier', 'Status', 'Field of expertise', 'Website'].map((label) => (
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
          <Subheading>Contact</Subheading>
          <Text>Primary contact person for this partnership.</Text>
        </div>
        <div className="space-y-6">
          {['Contact person *', 'Contact email *', 'General company email'].map((label) => (
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
          <Subheading>About</Subheading>
          <Text>Additional details about the partnership.</Text>
        </div>
        <div className="space-y-6">
          <div className="space-y-1.5">
            <FieldLabel>Company description</FieldLabel>
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Sponsorship level</FieldLabel>
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Additional notes</FieldLabel>
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </section>

      <Divider className="my-10" soft />

      <div className="flex justify-end gap-4">
        <Button type="button" plain disabled>Cancel</Button>
        <Button type="button" disabled>{mode === 'edit' ? 'Save changes' : 'Create partner'}</Button>
      </div>
    </div>
  )
}
