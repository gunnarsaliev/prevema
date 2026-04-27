import { Skeleton } from '@/components/ui/skeleton'
import { Divider } from '@/components/catalyst/divider'

export function EventsListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <ul className="mt-10">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i}>
          <Divider soft={i > 0} />
          <div className="flex items-center justify-between">
            <div className="flex gap-6 py-6">
              <div className="w-32 shrink-0">
                <Skeleton className="aspect-[3/2] w-full rounded-lg" />
              </div>
              <div className="space-y-2 py-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3.5 w-36" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-16 rounded-full max-sm:hidden" />
              <Skeleton className="size-6 rounded" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
