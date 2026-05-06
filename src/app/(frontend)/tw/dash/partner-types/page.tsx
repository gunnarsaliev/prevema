import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getCachedUserOrgIds, getCachedPartnerTypes } from '@/lib/cached-queries'
import { PartnerTypesTable } from './PartnerTypesTable'
import type { Metadata } from 'next'
import type { PartnerType } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Partner Types',
}

export default async function PartnerTypesPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)

  const partnerTypes = await getCachedPartnerTypes(organizationIds)

  return <PartnerTypesTable partnerTypes={partnerTypes as PartnerType[]} />
}
