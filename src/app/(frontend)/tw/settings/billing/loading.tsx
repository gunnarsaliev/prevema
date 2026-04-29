import { CreditCardIcon, UserGroupIcon } from '@heroicons/react/20/solid'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/catalyst/button'
import { Divider } from '@/components/catalyst/divider'
import { Heading, Subheading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl">
      <Heading>Billing</Heading>
      <Divider className="my-10 mt-6" />

      {/* Current Plan */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Current Plan</Subheading>
          <Text>Your active subscription tier and status.</Text>
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-56" />
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Billing Information */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Billing Information</Subheading>
          <Text>Cycle, renewal date and payment method.</Text>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Billing Cycle
              </Text>
              <Skeleton className="mt-1 h-5 w-20" />
            </div>
            <div>
              <Text className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Next Billing Date
              </Text>
              <Skeleton className="mt-1 h-5 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-zinc-950/10 bg-zinc-950/[2.5%] px-4 py-3 dark:border-white/10 dark:bg-white/[2.5%]">
            <CreditCardIcon className="size-5 shrink-0 text-zinc-500 dark:text-zinc-400" />
            <div>
              <Text className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Payment Method
              </Text>
              <Skeleton className="mt-0.5 h-5 w-40" />
            </div>
          </div>
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Team Seats */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Team Seats</Subheading>
          <Text>Total seats available for your organization.</Text>
        </div>
        <div>
          <div className="flex items-center gap-3 rounded-lg border border-zinc-950/10 bg-zinc-950/[2.5%] px-4 py-3 dark:border-white/10 dark:bg-white/[2.5%]">
            <UserGroupIcon className="size-5 shrink-0 text-zinc-500 dark:text-zinc-400" />
            <div>
              <Text className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Available Seats
              </Text>
              <Skeleton className="mt-0.5 h-5 w-24" />
            </div>
          </div>
        </div>
      </section>

      <Divider className="my-10" soft />

      <div className="flex justify-end gap-4">
        <Button outline disabled>
          Manage Payment Method
        </Button>
        <Button disabled>Upgrade Plan</Button>
      </div>
    </div>
  )
}
