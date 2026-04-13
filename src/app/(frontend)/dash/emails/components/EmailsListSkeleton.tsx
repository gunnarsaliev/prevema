'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function EmailsListSkeleton() {
  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Sidebar skeleton */}
      <div className="flex w-[320px] shrink-0 flex-col border-r bg-background">
        {/* Header */}
        <div className="flex flex-col gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-8 w-full" />
        </div>

        {/* Email list skeleton */}
        <div className="flex-1 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3 border-b p-4">
              <Skeleton className="size-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <div className="flex flex-col items-center justify-center flex-1 text-center p-8">
          <Skeleton className="size-16 rounded-full mb-4" />
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </div>
  )
}
