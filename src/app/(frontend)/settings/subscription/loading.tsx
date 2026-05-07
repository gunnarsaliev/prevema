import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export default function SubscriptionLoading() {
  return (
    <div>
      <div className="p-6">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-1 h-4 w-64" />

        <div className="mt-6 space-y-6">
          {/* Current Plan Section */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-4 w-64" />
          </div>

          <Separator />

          {/* Billing Info Section */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>

          <Separator />

          {/* Seats Section */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  )
}
