import { redirect } from 'next/navigation'

export default async function PartnerTypeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/dash/partner-types/${id}/edit`)
}
