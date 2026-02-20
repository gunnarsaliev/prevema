import { Row } from '@tanstack/react-table'

export interface DeleteConfig {
  apiEndpoint: string
  entityName: string
  getEntityName?: (entity: any) => string
}

export interface CopyConfig {
  getCopyText: (entity: any) => string
}

/**
 * Generic delete handler for single entity
 * Note: Confirmation should be handled in the UI layer
 */
export async function handleEntityDelete<T extends { id: number }>(
  entity: T,
  config: DeleteConfig,
  callbacks: {
    onStart: () => void
    onSuccess: () => void
    onError: () => void
  }
): Promise<void> {
  callbacks.onStart()
  try {
    const res = await fetch(`${config.apiEndpoint}/${entity.id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Delete failed')
    callbacks.onSuccess()
  } catch {
    alert(`Failed to delete ${config.entityName}.`)
    callbacks.onError()
  }
}

/**
 * Generic bulk delete handler
 * Note: Confirmation is handled by the DataTable component
 */
export async function handleEntityBulkDelete<T extends { id: number }>(
  rows: Row<T>[],
  config: DeleteConfig,
  callbacks: {
    onStart: () => void
    onSuccess: () => void
    onError: () => void
  }
): Promise<void> {
  callbacks.onStart()
  try {
    const deletePromises = rows.map((row) =>
      fetch(`${config.apiEndpoint}/${row.original.id}`, { method: 'DELETE' })
    )
    const results = await Promise.all(deletePromises)

    const failedCount = results.filter((res) => !res.ok).length
    if (failedCount > 0) {
      alert(`Failed to delete ${failedCount} ${config.entityName}(s).`)
    }

    callbacks.onSuccess()
  } catch {
    alert(`Failed to delete ${config.entityName}s.`)
    callbacks.onError()
  }
}

/**
 * Generic copy to clipboard handler
 */
export async function handleCopyToClipboard<T extends { id: number }>(
  entity: T,
  config: CopyConfig,
  callbacks: {
    onStart: () => void
    onSuccess: () => void
    onError: () => void
  }
): Promise<void> {
  callbacks.onStart()
  try {
    const text = config.getCopyText(entity)
    await navigator.clipboard.writeText(text)
    callbacks.onSuccess()
    setTimeout(callbacks.onError, 2000) // Reset after 2s
  } catch {
    alert('Failed to copy to clipboard.')
    callbacks.onError()
  }
}

/**
 * Helper to get relation name from Payload relationship
 */
export function getRelationName(rel: unknown): string {
  if (!rel) return '—'
  if (typeof rel === 'object' && rel !== null && 'name' in rel) {
    return (rel as { name: string }).name
  }
  return '—'
}
