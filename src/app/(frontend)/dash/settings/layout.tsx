import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  // Authenticate user once at layout level to avoid redundant auth calls
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  return (
    <section className="px-6 py-16">
      <div className="container">
        <div className="min-w-0">
          <div className="rounded-xl border bg-card shadow-sm">{children}</div>
        </div>
      </div>
    </section>
  )
}
