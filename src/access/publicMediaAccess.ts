import type { Access } from 'payload'
import { checkRole } from './utilities'

/**
 * Allow public (unauthenticated) users to upload media files
 * This is specifically for public participant registration forms
 */
export const publicMediaCreate: Access = async ({ req: { user } }) => {
  // Allow public access (no authentication required)
  // This enables participants to upload company logos during registration
  if (!user) {
    return true
  }

  // Authenticated users also have access based on their roles
  return true
}

/**
 * Read access for media - authenticated users only
 */
export const publicMediaRead: Access = async ({ req: { user } }) => {
  // Allow public read access for displaying uploaded images
  return true
}

/**
 * Update and delete - restricted to editors and admins
 */
export const mediaUpdate: Access = async ({ req: { user } }) => {
  if (!user) {
    return false
  }

  // Super-admins and admins can update any media
  if (checkRole(['super-admin', 'admin'], user)) {
    return true
  }

  // Other authenticated users can update
  return true
}

export const mediaDelete: Access = async ({ req: { user } }) => {
  if (!user) {
    return false
  }

  // Only admins can delete media
  if (checkRole(['super-admin', 'admin'], user)) {
    return true
  }

  return false
}
