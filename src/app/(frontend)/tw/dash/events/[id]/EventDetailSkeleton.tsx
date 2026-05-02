import { Skeleton } from '@/components/ui/skeleton'
import { Divider } from '@/components/catalyst/divider'
import { Subheading } from '@/components/catalyst/heading'
import {
  DescriptionList,
  DescriptionTerm,
  DescriptionDetails,
} from '@/components/catalyst/description-list'

export function EventDetailSkeleton() {
  return (
    <>
      <div className="mt-4 lg:mt-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-10 gap-y-4 py-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      <div className="mt-12">
        <Subheading>Details</Subheading>
        <Divider className="mt-4" />
        <DescriptionList>
          <DescriptionTerm>Description</DescriptionTerm>
          <DescriptionDetails>
            <Skeleton className="h-4 w-64" />
          </DescriptionDetails>
        </DescriptionList>
      </div>
    </>
  )
}
