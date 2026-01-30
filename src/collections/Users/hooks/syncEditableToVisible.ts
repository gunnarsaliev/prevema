import type { FieldHook } from 'payload'

/**
 * Hook to automatically add editableCollections to visibleCollections
 * Ensures editors can always view what they can edit
 */
export const syncEditableToVisible: FieldHook = ({ data, value }) => {
  const editableCollections = data?.editableCollections || []
  const visibleCollections = value || []

  // Combine visible and editable collections, removing duplicates
  const combined = [...new Set([...visibleCollections, ...editableCollections])]

  return combined
}
