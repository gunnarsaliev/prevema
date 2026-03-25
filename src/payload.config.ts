import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { resendAdapter } from '@payloadcms/email-resend'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Organizations } from './collections/Organizations'
import { Members } from './collections/Members'
import { Subscriptions } from './collections/Subscriptions'
import { EmailLogs } from './collections/EmailLogs'
import { Events } from './collections/Events'
import { ImageTemplates } from './collections/ImageTemplates'
import { Invitations } from './collections/Invitations'
import { Participants } from './collections/Participants'
import { ParticipantRoles } from './collections/ParticipantRoles'
import { Partners } from './collections/Partners'
import { PartnerTiers } from './collections/PartnerTiers'
import { PartnerTypes } from './collections/PartnerTypes'
import { EmailTemplates } from './collections/EmailTemplates'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Organizations,
    Members,
    Subscriptions,
    EmailLogs,
    Events,
    ImageTemplates,
    Invitations,
    Participants,
    ParticipantRoles,
    Partners,
    PartnerTiers,
    PartnerTypes,
    EmailTemplates,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  /**
   * System Email Configuration
   *
   * This adapter is used for ALL system-level emails including:
   * - Password reset emails
   * - User invitations
   * - System notifications
   *
   * IMPORTANT: Use a PRODUCTION Resend API key with a VERIFIED DOMAIN
   * Test keys (onboarding@resend.dev) can only send to the account owner's email.
   *
   * Organization-specific emails (triggered within the platform) use custom
   * Resend configurations stored in Organizations.emailConfig, not this adapter.
   * See: src/services/email.ts for tenant email implementation.
   */
  email: resendAdapter({
    defaultFromAddress: process.env.RESEND_DEFAULT_FROM_ADDRESS || 'onboarding@resend.dev',
    defaultFromName: process.env.RESEND_DEFAULT_FROM_NAME || 'Prevema',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || 'auto',
        endpoint: process.env.S3_ENDPOINT || '',
        forcePathStyle: false,
      },
      acl: 'public-read',
      ...(process.env.S3_PUBLIC_URL && {
        publicURL: process.env.S3_PUBLIC_URL,
      }),
    }),
  ],
})
