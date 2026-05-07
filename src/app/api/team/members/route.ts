import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/team/members
 * Get all members of the user's current organization
 */
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Get the current user
    const authResult = await payload.auth({ headers: req.headers })
    if (!authResult?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = authResult.user

    // Get user's organizations (where they are owner, admin, or member)
    const memberships = await payload.find({
      collection: 'members',
      where: {
        user: {
          equals: user.id,
        },
      },
      depth: 1, // Populate organization
      limit: 1000,
    })

    if (memberships.docs.length === 0) {
      return NextResponse.json({ members: [], organization: null })
    }

    // For now, use the first organization. In a real app, you might have org selection
    const membership = memberships.docs[0]
    const organizationId =
      typeof membership.organization === 'object'
        ? membership.organization.id
        : membership.organization

    // Get all members of this organization
    const orgMembers = await payload.find({
      collection: 'members',
      where: {
        organization: {
          equals: organizationId,
        },
      },
      depth: 2, // Populate user and organization
      sort: '-createdAt',
      limit: 1000,
    })

    // Get pending invitations for this organization
    const invitations = await payload.find({
      collection: 'invitations',
      where: {
        and: [
          {
            organization: {
              equals: organizationId,
            },
          },
          {
            status: {
              equals: 'pending',
            },
          },
        ],
      },
      depth: 1, // Populate organization
      sort: '-createdAt',
      limit: 1000,
    })

    // Format members data
    const formattedMembers = orgMembers.docs.map((member) => {
      const userObj = typeof member.user === 'object' ? member.user : null
      return {
        id: member.id,
        name: userObj?.name || userObj?.email || 'Unknown',
        email: userObj?.email || 'Unknown',
        role: member.role,
        status: member.status,
        isOwner: member.role === 'owner',
        joinedAt: member.createdAt,
      }
    })

    // Format invitations data
    const formattedInvitations = invitations.docs.map((invitation) => ({
      id: invitation.id,
      name: invitation.email, // Show email as name for invitations
      email: invitation.email,
      role: invitation.role,
      status: 'Invited',
      isInvitation: true,
      invitedAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
    }))

    // Combine members and invitations
    const allTeamMembers = [...formattedMembers, ...formattedInvitations]

    return NextResponse.json({
      members: allTeamMembers,
      organization: membership.organization,
    })
  } catch (error: any) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch team members' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/team/members
 * Invite new members to the organization
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Get the current user
    const authResult = await payload.auth({ headers: req.headers })
    if (!authResult?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = authResult.user
    const body = await req.json()
    const { emails, role } = body

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Email addresses are required' }, { status: 400 })
    }

    if (!role || !['admin', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Valid role is required' }, { status: 400 })
    }

    // Get user's organizations to find which one to invite to
    const memberships = await payload.find({
      collection: 'members',
      where: {
        user: {
          equals: user.id,
        },
      },
      depth: 1,
      limit: 1000,
    })

    if (memberships.docs.length === 0) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    // Use the first organization where user is owner or admin
    const adminMembership = memberships.docs.find((m) => m.role === 'owner' || m.role === 'admin')

    if (!adminMembership) {
      return NextResponse.json(
        { error: 'Insufficient permissions to invite members' },
        { status: 403 },
      )
    }

    const organizationId =
      typeof adminMembership.organization === 'object'
        ? adminMembership.organization.id
        : adminMembership.organization

    const results = []
    const errors = []

    // Create invitations for each email
    for (const email of emails) {
      try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          errors.push({ email, error: 'Invalid email format' })
          continue
        }

        // Check if user is already a member
        const existingMember = await payload.find({
          collection: 'members',
          where: {
            and: [
              {
                organization: {
                  equals: organizationId,
                },
              },
            ],
          },
          depth: 1,
          limit: 1000,
        })

        const isAlreadyMember = existingMember.docs.some((member) => {
          const memberUser = typeof member.user === 'object' ? member.user : null
          return memberUser?.email === email
        })

        if (isAlreadyMember) {
          errors.push({ email, error: 'User is already a member' })
          continue
        }

        // Check if there's already a pending invitation
        const existingInvitation = await payload.find({
          collection: 'invitations',
          where: {
            and: [
              {
                organization: {
                  equals: organizationId,
                },
              },
              {
                email: {
                  equals: email,
                },
              },
              {
                status: {
                  equals: 'pending',
                },
              },
            ],
          },
          limit: 1,
        })

        if (existingInvitation.docs.length > 0) {
          errors.push({ email, error: 'Invitation already sent' })
          continue
        }

        // Create the invitation
        const invitation = await payload.create({
          collection: 'invitations',
          data: {
            email,
            organization: organizationId,
            role,
            invitedBy: user.id,
          },
          draft: false,
        })

        results.push({
          email,
          invitationId: invitation.id,
          status: 'success',
        })
      } catch (error: any) {
        errors.push({
          email,
          error: error.message || 'Failed to send invitation',
        })
      }
    }

    return NextResponse.json({
      success: results.length > 0,
      results,
      errors,
      message: `Successfully sent ${results.length} invitation${results.length !== 1 ? 's' : ''}`,
    })
  } catch (error: any) {
    console.error('Error inviting members:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to invite members' },
      { status: 500 },
    )
  }
}

/**
 * PATCH /api/team/members
 * Change a member's role
 * Body: { memberId: string, role: 'admin' | 'editor' | 'viewer' }
 */
export async function PATCH(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const authResult = await payload.auth({ headers: req.headers })
    if (!authResult?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = authResult.user
    const body = await req.json()
    const { memberId, role } = body

    if (!memberId || !role || !['admin', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'memberId and a valid role are required' }, { status: 400 })
    }

    let targetMember
    try {
      targetMember = await payload.findByID({ collection: 'members', id: memberId, depth: 1 })
    } catch {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const orgId =
      typeof targetMember.organization === 'object'
        ? targetMember.organization.id
        : targetMember.organization

    const callerMembership = await payload.find({
      collection: 'members',
      where: {
        and: [
          { user: { equals: user.id } },
          { organization: { equals: orgId } },
          { or: [{ role: { equals: 'owner' } }, { role: { equals: 'admin' } }] },
        ],
      },
      limit: 1,
      depth: 0,
    })
    if (callerMembership.docs.length === 0) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const targetUserId =
      typeof targetMember.user === 'object' ? targetMember.user.id : targetMember.user
    if (String(targetUserId) === String(user.id)) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })
    }

    // 'owner' is intentionally excluded — ownership transfer requires a dedicated flow
    if (targetMember.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot change the owner role. Transfer ownership first.' },
        { status: 400 },
      )
    }

    const updated = await payload.update({
      collection: 'members',
      id: memberId,
      data: { role },
    })

    return NextResponse.json({ success: true, member: updated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update role'
    // Hook-thrown validation errors (e.g. last-owner guard) should be 400, not 500
    const isValidationError =
      message.includes('Cannot change') || message.includes('Cannot delete')
    return NextResponse.json({ error: message }, { status: isValidationError ? 400 : 500 })
  }
}

/**
 * DELETE /api/team/members
 * Remove a member or cancel an invitation
 * Body: { memberId: string, type: 'member' | 'invitation' }
 */
export async function DELETE(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const authResult = await payload.auth({ headers: req.headers })
    if (!authResult?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = authResult.user
    const body = await req.json()
    const { id, type } = body

    if (!id || !['member', 'invitation'].includes(type)) {
      return NextResponse.json(
        { error: 'memberId and type (member|invitation) are required' },
        { status: 400 },
      )
    }

    if (type === 'member') {
      let targetMember
      try {
        targetMember = await payload.findByID({ collection: 'members', id: id, depth: 1 })
      } catch {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 })
      }

      const orgId =
        typeof targetMember.organization === 'object'
          ? targetMember.organization.id
          : targetMember.organization

      const callerMembership = await payload.find({
        collection: 'members',
        where: {
          and: [
            { user: { equals: user.id } },
            { organization: { equals: orgId } },
            { or: [{ role: { equals: 'owner' } }, { role: { equals: 'admin' } }] },
          ],
        },
        limit: 1,
        depth: 0,
      })
      if (callerMembership.docs.length === 0) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      const targetUserId =
        typeof targetMember.user === 'object' ? targetMember.user.id : targetMember.user
      if (String(targetUserId) === String(user.id)) {
        return NextResponse.json({ error: 'Cannot remove yourself from the team' }, { status: 403 })
      }

      await payload.delete({ collection: 'members', id: id })
      return NextResponse.json({ success: true })
    }

    // type === 'invitation' — soft-expire it
    let invitation
    try {
      invitation = await payload.findByID({ collection: 'invitations', id: id, depth: 1 })
    } catch {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    const orgId =
      typeof invitation.organization === 'object'
        ? invitation.organization.id
        : invitation.organization

    const callerMembership = await payload.find({
      collection: 'members',
      where: {
        and: [
          { user: { equals: user.id } },
          { organization: { equals: orgId } },
          { or: [{ role: { equals: 'owner' } }, { role: { equals: 'admin' } }] },
        ],
      },
      limit: 1,
      depth: 0,
    })
    if (callerMembership.docs.length === 0) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    await payload.update({
      collection: 'invitations',
      id: id,
      data: { status: 'expired' },
    })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to remove member'
    // Hook-thrown validation errors (e.g. last-owner guard) should be 400, not 500
    const isValidationError =
      message.includes('Cannot change') || message.includes('Cannot delete')
    return NextResponse.json({ error: message }, { status: isValidationError ? 400 : 500 })
  }
}
