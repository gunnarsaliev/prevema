import type { PayloadRequest } from 'payload'

/**
 * Accept an invitation and add the user to the organization
 */
export async function acceptInvitation(token: string, req: PayloadRequest) {
  const { payload, user } = req

  if (!user) {
    throw new Error('You must be logged in to accept an invitation')
  }

  // Find the invitation by token
  const invitations = await payload.find({
    collection: 'invitations',
    where: {
      token: {
        equals: token,
      },
    },
    limit: 1,
  })

  if (invitations.docs.length === 0) {
    throw new Error('Invalid invitation token')
  }

  const invitation = invitations.docs[0]

  // Check if invitation is still valid
  if (invitation.status !== 'pending') {
    throw new Error(`This invitation has already been ${invitation.status}`)
  }

  // Check if invitation has expired
  const now = new Date()
  const expiresAt = new Date(invitation.expiresAt)
  if (now > expiresAt) {
    // Mark as expired
    await payload.update({
      collection: 'invitations',
      id: invitation.id,
      data: {
        status: 'expired',
      },
    })
    throw new Error('This invitation has expired')
  }

  // Check if the invitation email matches the user's email
  if (invitation.email !== user.email) {
    throw new Error('This invitation was sent to a different email address')
  }

  // Get the organization ID
  const organizationId =
    typeof invitation.organization === 'object'
      ? invitation.organization.id
      : invitation.organization

  // Check if membership already exists
  const existingMembership = await payload.find({
    collection: 'members',
    where: {
      and: [
        {
          user: {
            equals: user.id,
          },
        },
        {
          organization: {
            equals: organizationId,
          },
        },
      ],
    },
    limit: 1,
  })

  if (existingMembership.docs.length > 0) {
    // Update existing membership role if different
    const membership = existingMembership.docs[0]
    if (membership.role !== invitation.role) {
      await payload.update({
        collection: 'members',
        id: membership.id,
        data: {
          role: invitation.role || 'editor',
          status: 'active',
        },
      })
      console.log(`✅ Updated existing membership role to ${invitation.role}`)
    }
  } else {
    // Create new membership
    await payload.create({
      collection: 'members',
      data: {
        user: user.id,
        organization: organizationId,
        role: invitation.role || 'editor',
        status: 'active',
      },
    })
    console.log(`✅ Created new membership for user ${user.email} in organization ${organizationId}`)
  }

  // Mark invitation as accepted
  await payload.update({
    collection: 'invitations',
    id: invitation.id,
    data: {
      status: 'accepted',
    },
  })

  return {
    success: true,
    message: 'Invitation accepted successfully',
    organization: invitation.organization,
    role: invitation.role,
  }
}

/**
 * Decline an invitation
 */
export async function declineInvitation(token: string, req: PayloadRequest) {
  const { payload, user } = req

  if (!user) {
    throw new Error('You must be logged in to decline an invitation')
  }

  // Find the invitation by token
  const invitations = await payload.find({
    collection: 'invitations',
    where: {
      token: {
        equals: token,
      },
    },
    limit: 1,
  })

  if (invitations.docs.length === 0) {
    throw new Error('Invalid invitation token')
  }

  const invitation = invitations.docs[0]

  // Check if invitation is still valid
  if (invitation.status !== 'pending') {
    throw new Error(`This invitation has already been ${invitation.status}`)
  }

  // Check if the invitation email matches the user's email
  if (invitation.email !== user.email) {
    throw new Error('This invitation was sent to a different email address')
  }

  // Mark invitation as declined
  await payload.update({
    collection: 'invitations',
    id: invitation.id,
    data: {
      status: 'declined',
    },
  })

  return {
    success: true,
    message: 'Invitation declined',
  }
}
