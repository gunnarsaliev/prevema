import { redirect } from 'next/navigation'

export default async function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/dash/partners/${id}/edit`)
}
