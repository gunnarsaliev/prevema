import { PartnerTypesTableSkeleton } from './components/PartnerTypesTableSkeleton'

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="px-6 py-8 md:px-8">
        <header className="mb-8 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Partner Types</h1>
          <p className="text-sm text-muted-foreground">
            Types that define required fields for partner registration.
          </p>
        </header>
        <PartnerTypesTableSkeleton />
      </div>
    </div>
  )
}
