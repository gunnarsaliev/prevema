import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

/**
 * Skeleton for the event detail page.
 * Card chrome, icons, separators, and layout are static —
 * only the dynamic values (image, title, badges, dates, text) use <Skeleton />.
 */
export function EventDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      {/* Back button chrome */}
      <Skeleton className="h-8 w-28" />

      {/* Hero image */}
      <Skeleton className="aspect-[2/1] w-full rounded-xl" />

      {/* Title + meta */}
      <div className="space-y-4">
        {/* Badges row */}
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        {/* Title */}
        <Skeleton className="h-9 w-2/3" />

        {/* Date / location row */}
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      <Separator />

      {/* Description */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Detail cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-12" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
              <Skeleton className="h-3.5 w-2/3" />
            </CardContent>
          </Card>
        ))}

        <Card className="sm:col-span-2">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-12" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-5/6" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
