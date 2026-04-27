export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-8 pb-16">
      <div className="h-5 w-28 rounded-lg bg-zinc-200 dark:bg-zinc-700" />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="aspect-square w-full rounded-xl bg-zinc-200 dark:bg-zinc-700" />
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex gap-2">
            <div className="h-5 w-20 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-5 w-20 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-5 w-16 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          </div>
          <div className="h-9 w-2/3 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-4 w-36 rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
            ))}
          </div>
          <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>

      <div className="h-px w-full bg-zinc-950/5 dark:bg-white/5" />

      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-4 w-5/6 rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-950/5 p-4 space-y-3 dark:border-white/5">
            <div className="h-3.5 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-4 w-4/5 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
        ))}
      </div>
    </div>
  )
}
