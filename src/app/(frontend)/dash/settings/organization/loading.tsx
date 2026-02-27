import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export default function OrganizationLoading() {
  return (
    <div>
      <div className="p-6">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-1 h-4 w-80" />

        <div className="mt-6 space-y-6">
          {/* Organization Name and Slug */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>

          <Separator />

          {/* Email Configuration Section */}
          <div>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="mt-1 h-4 w-64" />
          </div>

          {/* Sender Name */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* From and Reply-to Email */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Resend API Key */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-56" />
          </div>

          <Separator />

          {/* Invite Users Section */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-28" />
            <div className="rounded-lg border p-4">
              <Skeleton className="h-10 w-full" />
            </div>
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
