import { redirect } from 'next/navigation'

export default async function ParticipantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/dash/participants/${id}/edit`)
}
