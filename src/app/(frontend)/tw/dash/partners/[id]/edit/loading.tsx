import { PartnerFormSkeleton } from '../../create/PartnerFormSkeleton'

export default function Loading() {
  return (
    <div className="px-8 py-8">
      <PartnerFormSkeleton mode="edit" />
    </div>
  )
}
