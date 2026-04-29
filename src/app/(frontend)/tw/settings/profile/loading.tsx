import { Skeleton } from '@/components/ui/skeleton'
import { Divider } from '@/components/catalyst/divider'
import { Heading, Subheading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl">
      <Heading>Profile</Heading>
      <Divider className="my-10 mt-6" />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Profile Photo</Subheading>
          <Text>Upload a photo to personalise your account. JPG, PNG or WebP · Max 2 MB.</Text>
        </div>
        <div>
          <div className="flex items-center gap-6">
            <Skeleton className="size-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Text>JPG, PNG or WebP · Max 2 MB</Text>
            </div>
          </div>
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Full Name</Subheading>
          <Text>This will be displayed on your public profile.</Text>
        </div>
        <div>
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Email Address</Subheading>
          <Text>Enter a new email to change your current one.</Text>
        </div>
        <div className="space-y-4">
          <div>
            <Text className="text-sm font-medium">Current email</Text>
            <Skeleton className="mt-1 h-9 w-full rounded-lg" />
          </div>
          <div>
            <Text className="text-sm font-medium">New email (optional)</Text>
            <Skeleton className="mt-1 h-9 w-full rounded-lg" />
          </div>
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Change Password</Subheading>
          <Text>Leave blank to keep your current password. Minimum 8 characters.</Text>
        </div>
        <div className="space-y-4">
          <div>
            <Text className="text-sm font-medium">Current password</Text>
            <Skeleton className="mt-1 h-9 w-full rounded-lg" />
          </div>
          <div>
            <Text className="text-sm font-medium">New password (optional)</Text>
            <Skeleton className="mt-1 h-9 w-full rounded-lg" />
          </div>
          <div>
            <Text className="text-sm font-medium">Confirm new password</Text>
            <Skeleton className="mt-1 h-9 w-full rounded-lg" />
          </div>
        </div>
      </section>

      <Divider className="my-10" soft />

      <div className="flex justify-end gap-4">
        <Skeleton className="h-9 w-16 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  )
}
