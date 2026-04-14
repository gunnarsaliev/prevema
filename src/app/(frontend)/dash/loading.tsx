import {
  StatsCardsSkeleton,
  UpcomingEventSkeleton,
  QuickStartSkeleton,
} from './components/DashboardSkeletons'

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
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
