import { BeforeChangeHook } from 'payload/dist/collections/config/types'

export const populateTeamFromEvent: BeforeChangeHook = async ({ req, data, operation }) => {
  // Auto-populate team from event
  if (data.event) {
    const eventId = typeof data.event === 'object' ? data.event.id : data.event

    try {
      const event = await req.payload.findByID({
        collection: 'events',
        id: eventId,
        depth: 0,
      })

      if (event && event.team) {
        data.team = typeof event.team === 'object' ? event.team.id : event.team
      }
    } catch (error) {
      console.error('Error fetching event for team:', error)
    }
  }

  return data
}
