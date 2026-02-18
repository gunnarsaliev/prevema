import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { PartnerTypesList } from './components/PartnerTypesList'

export default async function PartnerTypesPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const { docs } = await payload.find({
    collection: 'partner-types',
    overrideAccess: false,
    user,
    depth: 1, // resolve event name
    limit: 200,
    sort: 'name',
  })

  return (
    <div className="px-6 py-8">
      <PartnerTypesList partnerTypes={docs} />
    </div>
  )
}
