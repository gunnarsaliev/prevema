import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getUserOrganizationIds } from '@/access/utilities'

import { EmailTemplateForm } from '../components/EmailTemplateForm'

export default async function CreateEmailTemplatePage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>
}) {
  const { eventId } = await searchParams
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  let organizationId: string | number

  // If eventId is provided, fetch the event to get its organization
  if (eventId) {
    const event = await payload.findByID({
      collection: 'events',
      id: Number(eventId),
      overrideAccess: false,
      user,
      depth: 0,
      select: { organization: true },
    })

    if (!event) {
      redirect('/dash/assets')
    }

    // Get organization ID from event
    organizationId =
      typeof event.organization === 'object' ? event.organization.id : event.organization
  } else {
    // Get all organization IDs where user is a member
    const organizationIds = await getUserOrganizationIds(payload, user)

    if (organizationIds.length === 0) {
      redirect('/dash')
    }

    // Use first organization
    organizationId = organizationIds[0]
  }

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create email template</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create a new email template for automated communications.
        </p>
      </div>
      <EmailTemplateForm mode="create" displayMode="simple" organizationId={organizationId} />
    </div>
  )
}
