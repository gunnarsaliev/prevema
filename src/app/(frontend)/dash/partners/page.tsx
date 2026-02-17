import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { PartnersList } from './components/PartnersList'

export default async function PartnersPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const { docs } = await payload.find({
    collection: 'partners',
    overrideAccess: false,
    user,
    depth: 1, // resolve partnerType and tier names
    limit: 500,
    sort: 'companyName',
  })

  return (
    <div className="px-6 py-8">
      <PartnersList partners={docs} />
    </div>
  )
}
