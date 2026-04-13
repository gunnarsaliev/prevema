import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { TopBar } from '@/components/shared/TopBar'
import { LibraryContent } from './components/LibraryContent'
import { getUserOrganizationIds } from '@/access/utilities'

export default async function LibraryPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  // Fetch public image templates (overrideAccess since collection read excludes public library templates)
  const { docs: imageTemplates } = await payload.find({
    collection: 'image-templates',
    where: {
      isPublicLibrary: {
        equals: true,
      },
    },
    depth: 1,
    limit: 500,
    sort: '-updatedAt',
    overrideAccess: true,
    user,
  })

  // Fetch public email templates (overrideAccess since collection read excludes public library templates)
  const { docs: emailTemplates } = await payload.find({
    collection: 'email-templates',
    where: {
      isPublicLibrary: {
        equals: true,
      },
    },
    depth: 1,
    limit: 500,
    sort: '-updatedAt',
    overrideAccess: true,
    user,
  })

  // Get user's organization IDs to check which templates they already have copies of
  const userOrgIds = await getUserOrganizationIds(payload, user)

  // For each public template, check if user already has a copy
  // We need to fetch user's existing templates to show "Already Added" state
  let userImageTemplates: any[] = []
  let userEmailTemplates: any[] = []

  if (userOrgIds.length > 0) {
    const { docs: userImageDocs } = await payload.find({
      collection: 'image-templates',
      where: {
        and: [
          {
            organization: {
              in: userOrgIds,
            },
          },
          {
            isCopy: {
              equals: true,
            },
          },
        ],
      },
      depth: 0,
      limit: 500,
    })
    userImageTemplates = userImageDocs

    const { docs: userEmailDocs } = await payload.find({
      collection: 'email-templates',
      where: {
        and: [
          {
            organization: {
              in: userOrgIds,
            },
          },
          {
            isCopy: {
              equals: true,
            },
          },
        ],
      },
      depth: 0,
      limit: 500,
    })
    userEmailTemplates = userEmailDocs
  }

  // Create sets of copied template IDs for quick lookup
  const copiedImageIds = new Set(
    userImageTemplates
      .filter((t: any) => t.copiedFrom)
      .map((t: any) => (typeof t.copiedFrom === 'object' ? t.copiedFrom.id : t.copiedFrom)),
  )

  const copiedEmailIds = new Set(
    userEmailTemplates
      .filter((t: any) => t.copiedFrom)
      .map((t: any) => (typeof t.copiedFrom === 'object' ? t.copiedFrom.id : t.copiedFrom)),
  )

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title="Template Library"
        description="Browse and copy public templates from the community"
      />
      <div className="flex-1 px-8 py-8">
        <LibraryContent
          imageTemplates={imageTemplates as any}
          emailTemplates={emailTemplates as any}
          copiedImageIds={Array.from(copiedImageIds)}
          copiedEmailIds={Array.from(copiedEmailIds)}
          hasOrganizations={userOrgIds.length > 0}
        />
      </div>
    </div>
  )
}
