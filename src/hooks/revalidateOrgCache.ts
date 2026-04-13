import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidateTag } from 'next/cache'

function getOrgId(doc: Record<string, any>): number | string | null {
  const org = doc.organization
  if (!org) return null
  return typeof org === 'object' ? org.id : org
}

/**
 * Factory: returns afterChange + afterDelete hooks that revalidate one or more
 * cache tags derived from the document's organization field.
 */
export function makeOrgCacheRevalidator(tagFns: ((orgId: number | string) => string)[]) {
  const afterChange: CollectionAfterChangeHook = ({ doc }) => {
    const orgId = getOrgId(doc)
    if (orgId != null) {
      tagFns.forEach((fn) => revalidateTag(fn(orgId)))
    }
    return doc
  }

  const afterDelete: CollectionAfterDeleteHook = ({ doc }) => {
    const orgId = getOrgId(doc)
    if (orgId != null) {
      tagFns.forEach((fn) => revalidateTag(fn(orgId)))
    }
  }

  return { afterChange, afterDelete }
}
