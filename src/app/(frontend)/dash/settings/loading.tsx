import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export default function SettingsLoading() {
  return (
    <section className="px-6 py-16">
      <div className="container">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Navigation Skeleton */}
          <aside className="lg:w-56 lg:shrink-0">
            <nav className="space-y-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2"
                >
                  <Skeleton className="size-4 shrink-0" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Content Skeleton */}
          <main className="min-w-0 flex-1">
            <div className="rounded-xl border bg-card shadow-sm">
              <div className="p-6">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="mt-1 h-4 w-64" />

                <div className="mt-6 space-y-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <Skeleton className="size-24 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                  </div>

                  <Separator />

                  {/* Form Fields */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-28" />
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  )
}
