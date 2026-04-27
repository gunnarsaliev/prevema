import { Link } from '@/components/catalyst/link'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import { ParticipantDetailSkeleton } from './ParticipantDetailSkeleton'

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <div className="max-lg:hidden">
        <Link
          href="/tw/dash/participants"
          className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400"
        >
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Participants
        </Link>
      </div>
      <ParticipantDetailSkeleton />
    </div>
  )
}
