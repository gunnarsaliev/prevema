import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { SettingsNav } from './SettingsNav'

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  // Authenticate user once at layout level to avoid redundant auth calls
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

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
