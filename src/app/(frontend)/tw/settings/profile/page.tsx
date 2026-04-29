import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { ProfileForm } from './ProfileForm'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Profile',
}

export default async function ProfilePage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const avatarUrl =
    user?.profileImage && typeof user.profileImage === 'object'
      ? (user.profileImage.url ?? null)
      : null

  return (
    <ProfileForm
      defaultValues={{
        name: user?.name ?? '',
        email: user?.email ?? '',
        avatarUrl,
      }}
    />
  )
}
