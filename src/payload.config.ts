import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Teams } from './collections/Teams'
import { EmailLogs } from './collections/EmailLogs'
import { Events } from './collections/Events'
import { ImageTemplates } from './collections/ImageTemplates'
import { Invitations } from './collections/Invitations'
import { Participants } from './collections/Participants'
import { ParticipantTypes } from './collections/ParticipantTypes'
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
    Teams,
    EmailLogs,
    Events,
    ImageTemplates,
    Invitations,
    Participants,
    ParticipantTypes,
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
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
