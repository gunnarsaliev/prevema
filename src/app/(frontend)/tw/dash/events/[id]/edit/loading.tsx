import { EventFormSkeleton } from '../../create/EventFormSkeleton'

export default function Loading() {
  return (
    <div className="px-8 py-8">
      <EventFormSkeleton mode="edit" />
    </div>
  )
}
