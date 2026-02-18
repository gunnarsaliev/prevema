import { redirect } from 'next/navigation'

export default async function ParticipantTypeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/dash/participant-types/${id}/edit`)
}
