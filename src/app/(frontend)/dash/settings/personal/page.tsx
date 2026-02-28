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

  // Fetch full user data with profileImage populated
  const fullUser = user?.id
    ? await payload.findByID({
        collection: 'users',
        id: user.id,
        depth: 1, // Populate profileImage relationship
      })
    : null

  // Get the profile image URL if it exists
  const profileImageUrl =
    fullUser?.profileImage && typeof fullUser.profileImage === 'object'
      ? fullUser.profileImage.url ?? undefined
      : undefined

  // User is guaranteed to exist due to layout auth check
  return (
    <PersonalInfoForm
      defaultValues={{
        name: fullUser?.name ?? undefined,
        email: fullUser?.email ?? '',
        avatar: profileImageUrl,
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
