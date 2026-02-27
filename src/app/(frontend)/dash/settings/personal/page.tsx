import { Suspense } from 'react'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { PersonalInfoForm } from './PersonalInfoForm'
import PersonalInfoLoading from './loading'

async function PersonalInfoData() {
  // Auth is already handled in layout, just fetch user data
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  // User is guaranteed to exist due to layout auth check
  return (
    <PersonalInfoForm
      defaultValues={{
        name: user?.name ?? undefined,
        email: user?.email ?? '',
      }}
    />
  )
}

export default function PersonalInfoPage() {
  return (
    <Suspense fallback={<PersonalInfoLoading />}>
      <PersonalInfoData />
    </Suspense>
  )
}
