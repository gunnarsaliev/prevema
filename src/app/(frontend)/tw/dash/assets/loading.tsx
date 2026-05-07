import { Skeleton } from '@/components/ui/skeleton'
import { AssetsGridSkeleton } from './components/AssetsGridSkeleton'

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between border-b px-6 py-3 shrink-0">
        <div className="space-y-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-72" />
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-muted/20 dark:bg-background">
        <div className="p-8">
          <div className="flex gap-1 mb-6">
            <Skeleton className="h-9 w-36 rounded-md" />
            <Skeleton className="h-9 w-36 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
          <AssetsGridSkeleton />
        </div>
      </div>
    </div>
  )
}
