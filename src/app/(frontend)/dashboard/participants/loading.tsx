import { ParticipantsTableSkeleton } from './components/ParticipantsTableSkeleton'

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="px-6 py-8 md:px-8">
        <header className="mb-8 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Participants</h1>
          <p className="text-sm text-muted-foreground">
            All participants across your organizations.
          </p>
        </header>
        <ParticipantsTableSkeleton />
      </div>
    </div>
  )
}
