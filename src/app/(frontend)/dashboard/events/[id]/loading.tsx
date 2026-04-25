import { EventDetailSkeleton } from './components/EventDetailSkeleton'

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="px-6 py-8 md:px-8">
        <EventDetailSkeleton />
      </div>
    </div>
  )
}
