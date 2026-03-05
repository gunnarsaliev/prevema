import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  return <>{children}</>
}
