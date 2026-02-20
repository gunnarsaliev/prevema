import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { OrganizationForm } from './OrganizationForm'

export default async function OrganizationPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const { docs } = await payload.find({
    collection: 'organizations',
    where: { owner: { equals: user.id } },
    limit: 1,
    depth: 0,
  })

  const org = docs[0] ?? null

  return (
    <OrganizationForm
      defaultValues={{
        orgName: org?.name ?? undefined,
        orgSlug: org?.slug ?? undefined,
        orgSenderName: org?.emailConfig?.senderName ?? undefined,
        orgFromEmail: org?.emailConfig?.fromEmail ?? undefined,
        orgReplyToEmail: org?.emailConfig?.replyToEmail ?? undefined,
        orgResendApiKey: org?.emailConfig?.resendApiKey ?? undefined,
      }}
    />
  )
}
