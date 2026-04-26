import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

/**
 * Value-only skeleton for the participant detail page.
 * Layout, labels, section headings, and borders are static.
 * Only dynamic values use <Skeleton />.
 */
export function ParticipantDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <Skeleton className="h-8 w-32" />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Avatar */}
        <div className="md:col-span-1">
          <Skeleton className="aspect-square w-full rounded-xl" />
        </div>

        {/* Core fields */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-8 w-2/3" />

          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Biography */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Company card */}
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-28" />
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
