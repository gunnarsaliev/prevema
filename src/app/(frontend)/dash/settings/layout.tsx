import { SettingsNav } from './SettingsNav'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="px-6 py-16">
      <div className="container">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Navigation */}
          <aside className="lg:w-56 lg:shrink-0">
            <SettingsNav />
          </aside>

          {/* Main Content */}
          <main className="min-w-0 flex-1">
            <div className="rounded-xl border bg-card shadow-sm">{children}</div>
          </main>
        </div>
      </div>
    </section>
  )
}
