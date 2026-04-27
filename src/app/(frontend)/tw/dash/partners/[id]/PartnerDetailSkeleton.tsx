import { Skeleton } from '@/components/ui/skeleton'
import { Divider } from '@/components/catalyst/divider'

export function PartnerDetailSkeleton() {
  return (
    <div className="space-y-8 pb-16">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Skeleton className="aspect-square w-full rounded-xl" />
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-9 w-2/3" />
          <div className="grid grid-cols-2 gap-4 pt-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <Divider />

      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      <Divider />

      <div className="space-y-4">
        <Skeleton className="h-5 w-16" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  )
}
