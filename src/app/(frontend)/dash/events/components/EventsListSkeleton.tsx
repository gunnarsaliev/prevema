import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

export function EventsListSkeleton() {
  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      {/* TopBar skeleton */}
      <div className="flex items-center justify-between border-b px-6 py-3 shrink-0">
        <div className="space-y-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-44" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="px-8 py-8 space-y-8">
          {/* Search bar skeleton */}
          <Skeleton className="h-10 w-full max-w-sm" />

          {/* Event card grid skeleton */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-40 w-full rounded-none" />
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-10" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
                <CardFooter className="pt-0">
                  <Skeleton className="h-3 w-28" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
