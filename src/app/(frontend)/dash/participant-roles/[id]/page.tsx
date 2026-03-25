import { redirect } from 'next/navigation'

export default async function ParticipantRoleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/dash/participant-roles/${id}/edit`)
}
