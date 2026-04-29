import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { OrganizationForm } from './OrganizationForm'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Organization',
}

export default async function OrganizationPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const { docs } = await payload.find({
    collection: 'organizations',
    where: { owner: { equals: user?.id } },
    limit: 1,
    depth: 0,
  })

  const org = docs[0] ?? null

  return (
    <>
      <Link href={'/tw/settings'}> Go back to settings</Link>
      <OrganizationForm
        defaultValues={{
          name: org?.name ?? '',
          senderName: org?.emailConfig?.senderName ?? '',
          fromEmail: org?.emailConfig?.fromEmail ?? '',
          replyToEmail: org?.emailConfig?.replyToEmail ?? '',
          resendApiKey: org?.emailConfig?.resendApiKey ?? '',
        }}
      />
    </>
  )
}
