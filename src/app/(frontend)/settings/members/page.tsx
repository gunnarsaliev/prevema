import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { MembersClient, type MemberRow } from '@/components/settings-members-client'

export default async function MembersPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  // Find user's first membership to get the org
  const memberships = await payload.find({
    collection: 'members',
    where: { user: { equals: user.id } },
    depth: 1,
    limit: 1,
  })

  if (memberships.docs.length === 0) {
    return (
      <section className="py-32">
        <div className="container max-w-3xl">
          <p className="text-sm text-muted-foreground">
            You are not part of any organization yet.
          </p>
        </div>
      </section>
    )
  }

  const firstMembership = memberships.docs[0]
  const org = typeof firstMembership.organization === 'object' ? firstMembership.organization : null
  const orgId = String(org?.id ?? (firstMembership.organization as string | number))
  const orgName = org && 'name' in org ? (org as any).name : 'Organization'

  // Fetch all members of the org
  const orgMembers = await payload.find({
    collection: 'members',
    where: { organization: { equals: orgId } },
    depth: 2,
    sort: '-createdAt',
    limit: 1000,
  })

  // Fetch pending invitations
  const invitations = await payload.find({
    collection: 'invitations',
    where: {
      and: [
        { organization: { equals: orgId } },
        { status: { equals: 'pending' } },
      ],
    },
    depth: 1,
    sort: '-createdAt',
    limit: 1000,
  })

  const memberRows: MemberRow[] = orgMembers.docs.map((m) => {
    const u = typeof m.user === 'object' ? m.user : null
    return {
      id: String(m.id),
      userId: (u as any)?.id ? String((u as any).id) : undefined,
      name: (u as any)?.name || (u as any)?.email || 'Unknown',
      email: (u as any)?.email || '',
      role: m.role as MemberRow['role'],
      status: m.status,
      isOwner: m.role === 'owner',
      isInvitation: false,
      joinedAt: m.createdAt,
    }
  })

  const invitationRows: MemberRow[] = invitations.docs.map((inv) => ({
    id: String(inv.id),
    name: inv.email,
    email: inv.email,
    role: inv.role as MemberRow['role'],
    status: 'invited',
    isOwner: false,
    isInvitation: true,
    invitedAt: inv.createdAt,
    expiresAt: inv.expiresAt ?? undefined,
  }))

  return (
    <MembersClient
      initialMembers={[...memberRows, ...invitationRows]}
      organization={{ id: orgId, name: orgName }}
      currentUserId={String(user.id)}
    />
  )
}
