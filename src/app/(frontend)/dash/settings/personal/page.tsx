import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { PersonalInfoForm } from './PersonalInfoForm'

export default async function PersonalInfoPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  return (
    <PersonalInfoForm
      defaultValues={{
        name: user.name ?? undefined,
        email: user.email,
      }}
    />
  )
}
