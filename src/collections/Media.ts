import type { CollectionConfig } from 'payload'

import {
  publicMediaCreate,
  publicMediaRead,
  mediaUpdate,
  mediaDelete,
} from '@/access/publicMediaAccess'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'System',
  },
  access: {
    create: publicMediaCreate,
    read: publicMediaRead,
    update: mediaUpdate,
    delete: mediaDelete,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
    },
  ],
  upload: {
    // These are not supported on Workers yet due to lack of sharp
    crop: false,
    focalPoint: false,
    // File size limit: 5MB for images
    fileSizeLimit: 5 * 1024 * 1024,
    // Restrict to image files only
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  },
}
