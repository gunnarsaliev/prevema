import { BeforeChangeHook } from 'payload/dist/collections/config/types'

export const populateOrganizationFromEvent: BeforeChangeHook = async ({ req, data, operation }) => {
  // Auto-populate organization from event
  if (data.event) {
    const eventId = typeof data.event === 'object' ? data.event.id : data.event

    try {
      const event = await req.payload.findByID({
        collection: 'events',
        id: eventId,
        depth: 0,
      })

      if (event && event.organization) {
        data.organization = typeof event.organization === 'object' ? event.organization.id : event.organization
      }
    } catch (error) {
      console.error('Error fetching event for organization:', error)
    }
  }

  return data
}
