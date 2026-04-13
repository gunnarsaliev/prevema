'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function EmailsListSkeleton() {
  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      {/* TopBar skeleton */}
      <div className="border-b border-border px-6 py-3">
        <div className="flex items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="px-8 py-6">
          {/* Filters skeleton */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-9 w-72" />
          </div>

          {/* Table skeleton */}
          <div className="rounded-md border">
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>

              {/* Rows */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center py-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
