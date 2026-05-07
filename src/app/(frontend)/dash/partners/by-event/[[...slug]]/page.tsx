import { redirect } from 'next/navigation'

export default async function PartnersByEventPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug } = await params
  const [eventId, partnerId] = slug ?? []

  if (eventId && partnerId) {
    redirect(`/dash/events/${eventId}/partners/${partnerId}`)
  }
  if (eventId) {
    redirect(`/dash/events/${eventId}/partners`)
  }
  redirect('/dash/partners')
}
