import { redirect } from 'next/navigation'

export default async function ParticipantsByEventPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug } = await params
  const [eventId, participantId] = slug ?? []

  if (eventId && participantId) {
    redirect(`/tw/dash/events/${eventId}/participants/${participantId}`)
  }
  if (eventId) {
    redirect(`/tw/dash/events/${eventId}/participants`)
  }
  redirect('/tw/dash/participants')
}
