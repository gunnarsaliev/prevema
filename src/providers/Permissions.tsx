'use client'

import React, { createContext, useContext } from 'react'

interface PermissionsContextType {
  role: 'owner' | 'admin' | 'editor' | 'viewer' | null
  canEdit: boolean
  canAdmin: boolean
  isOwner: boolean
}

const PermissionsContext = createContext<PermissionsContextType>({
  role: null,
  canEdit: false,
  canAdmin: false,
  isOwner: false,
})

interface PermissionsProviderProps {
  children: React.ReactNode
  role: 'owner' | 'admin' | 'editor' | 'viewer' | null
  canEdit: boolean
  canAdmin: boolean
  isOwner: boolean
}

/**
 * Client-side context provider for user permissions
 *
 * SECURITY NOTE: This is for UI/UX purposes only.
 * The actual permission values are passed from server components
 * and cannot be manipulated by the client to bypass access control.
 * All API calls are protected by server-side access control in Payload collections.
 */
export function PermissionsProvider({
  children,
  role,
  canEdit,
  canAdmin,
  isOwner,
}: PermissionsProviderProps) {
  return (
    <PermissionsContext.Provider value={{ role, canEdit, canAdmin, isOwner }}>
      {children}
    </PermissionsContext.Provider>
  )
}

/**
 * Hook to access user permissions in the current organization
 *
 * @returns Object with role and permission flags
 */
export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider')
  }
  return context
}
