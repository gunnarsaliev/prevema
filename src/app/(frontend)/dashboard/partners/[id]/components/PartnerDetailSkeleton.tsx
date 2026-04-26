import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

/**
 * Value-only skeleton for the partner detail page.
 */
export function PartnerDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <Skeleton className="h-8 w-28" />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Logo */}
        <div className="md:col-span-1">
          <Skeleton className="aspect-square w-full rounded-xl" />
        </div>

        {/* Core fields */}
        <div className="md:col-span-2 space-y-4">
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

      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
