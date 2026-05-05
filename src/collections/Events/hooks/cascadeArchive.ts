import type { CollectionAfterChangeHook } from 'payload'
import { revalidateTag } from 'next/cache'
import { orgParticipantsTag, orgPartnersTag, orgCountsTag } from '@/lib/cached-queries'

export const cascadeArchive: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const wasArchived = previousDoc?.status !== 'archived'
  const isNowArchived = doc.status === 'archived'

  if (!wasArchived || !isNowArchived) return doc

  const eventId = doc.id
  const organizationId =
    typeof doc.organization === 'object' ? doc.organization?.id : doc.organization

  try {
    const { docs: participants } = await req.payload.find({
      collection: 'participants',
      where: { event: { equals: eventId } },
      limit: 1000,
      depth: 0,
      overrideAccess: true,
    })

    for (const p of participants) {
      await req.payload.update({
        collection: 'participants',
        id: p.id,
        data: { event: null } as any,
        overrideAccess: true,
      })
    }
  } catch (err) {
    req.payload.logger.error({ err, eventId }, 'cascadeArchive: failed to unlink participants')
  }

  try {
    const { docs: partners } = await req.payload.find({
      collection: 'partners',
      where: { event: { equals: eventId } },
      limit: 1000,
      depth: 0,
      overrideAccess: true,
    })

    for (const p of partners) {
      await req.payload.update({
        collection: 'partners',
        id: p.id,
        data: { event: null } as any,
        overrideAccess: true,
      })
    }
  } catch (err) {
    req.payload.logger.error({ err, eventId }, 'cascadeArchive: failed to unlink partners')
  }

  if (organizationId) {
    revalidateTag(orgParticipantsTag(organizationId))
    revalidateTag(orgPartnersTag(organizationId))
    revalidateTag(orgCountsTag(organizationId))
  }

  return doc
}
