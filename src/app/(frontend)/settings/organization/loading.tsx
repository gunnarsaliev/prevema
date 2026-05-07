import { Skeleton } from '@/components/ui/skeleton'
import { Divider } from '@/components/catalyst/divider'
import { Heading, Subheading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl">
      <Heading>Organization</Heading>
      <Divider className="my-10 mt-6" />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Organization Name</Subheading>
          <Text>This will be displayed on your public profile.</Text>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Email Configuration</Subheading>
          <Text>Used as the sender identity for outgoing emails from this organization.</Text>
        </div>
        <div className="space-y-4">
          <div>
            <Text className="text-sm font-medium">Sender name</Text>
            <Skeleton className="mt-1 h-9 w-full rounded-lg" />
          </div>
          <div>
            <Text className="text-sm font-medium">From email</Text>
            <Skeleton className="mt-1 h-9 w-full rounded-lg" />
          </div>
          <div>
            <Text className="text-sm font-medium">Reply-to email</Text>
            <Skeleton className="mt-1 h-9 w-full rounded-lg" />
          </div>
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
          <Skeleton className="h-9 w-full rounded-lg" />
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
