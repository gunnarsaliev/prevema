import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { SettingsProfile4 } from '@/components/settings-profile4'

export default async function SettingsPage() {
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
    <SettingsProfile4
      className="px-6 py-8"
      defaultValues={{
        name: user.name ?? undefined,
        email: user.email,
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
