import { Heading } from '@/components/catalyst/heading'
import { PartnersListSkeleton } from './PartnersListSkeleton'

export default function Loading() {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-sm:w-full sm:flex-1">
          <Heading>Partners</Heading>
        </div>
      </div>
      <PartnersListSkeleton />
    </>
  )
}
