import { ParticipantFormSkeleton } from '../../create/ParticipantFormSkeleton'

export default function Loading() {
  return (
    <div className="px-8 py-8">
      <ParticipantFormSkeleton mode="edit" />
    </div>
  )
}
