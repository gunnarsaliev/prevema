import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export default function PersonalInfoLoading() {
  return (
    <div>
      <div className="p-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-1 h-4 w-64" />

        <div className="mt-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative size-24 shrink-0">
              <Skeleton className="size-24 rounded-full" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6">
                <Skeleton className="size-10 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Name Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          <Separator />

          {/* Email Section */}
          <div className="space-y-4">
            <Skeleton className="h-5 w-28" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>

          <Separator />

          {/* Password Section */}
          <div className="space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
      </div>

      {/* Footer with actions */}
      <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  )
}
