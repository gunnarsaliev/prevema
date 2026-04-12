import {
  StatsCardsSkeleton,
  UpcomingEventSkeleton,
  QuickStartSkeleton,
} from './components/DashboardSkeletons'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      {/* TopBar skeleton */}
      <div className="flex items-center justify-between border-b px-6 py-3 shrink-0">
        <div className="space-y-1">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-8 w-40" />
      </div>
      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 space-y-8">
          <StatsCardsSkeleton />
          <UpcomingEventSkeleton />
          <QuickStartSkeleton />
        </div>
      </div>
    </div>
  )
}
