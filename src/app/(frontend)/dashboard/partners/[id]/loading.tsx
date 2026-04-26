import { PartnerDetailSkeleton } from './components/PartnerDetailSkeleton'

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="px-6 py-8 md:px-8">
        <PartnerDetailSkeleton />
      </div>
    </div>
  )
}
