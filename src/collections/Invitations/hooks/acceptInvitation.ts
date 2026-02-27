import type { PayloadRequest } from 'payload'

/**
 * Accept an invitation and add the user to the organization
 */
export async function acceptInvitation(token: string, req: PayloadRequest) {
  const { payload, user } = req

  console.log('🎫 acceptInvitation called for user:', user?.email)

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
    console.warn('⚠️  Invalid invitation token:', token.substring(0, 10) + '...')
    throw new Error('Invalid invitation token')
  }

  const invitation = invitations.docs[0]

  console.log('📧 Invitation found:', {
    email: invitation.email,
    organization: invitation.organization,
    role: invitation.role,
    status: invitation.status,
  })

  // Check if invitation is still valid
  if (invitation.status !== 'pending') {
    console.warn(`⚠️  Invitation already ${invitation.status}`)
    throw new Error(`This invitation has already been ${invitation.status}`)
  }

  // Check if invitation has expired
  const now = new Date()
  const expiresAt = new Date(invitation.expiresAt)
  if (now > expiresAt) {
    console.warn('⚠️  Invitation has expired')
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
    console.warn('⚠️  Email mismatch:', {
      invitationEmail: invitation.email,
      userEmail: user.email,
    })
    throw new Error('This invitation was sent to a different email address')
  }

  // Get the organization ID
  const organizationId =
    typeof invitation.organization === 'object'
      ? invitation.organization.id
      : invitation.organization

  console.log(`👤 Processing invitation acceptance for organization ${organizationId}`)

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
    console.log('🔄 Membership already exists, checking if update needed')
    // Update existing membership role if different
    const membership = existingMembership.docs[0]
    if (membership.role !== invitation.role) {
      console.log(`📝 Updating role from ${membership.role} to ${invitation.role}`)
      await payload.update({
        collection: 'members',
        id: membership.id,
        data: {
          role: invitation.role || 'editor',
          status: 'active',
        },
      })
      console.log(`✅ Updated existing membership role to ${invitation.role}`)
    } else {
      console.log(`✅ Membership already exists with correct role ${membership.role}`)
    }
  } else {
    console.log('➕ Creating new membership')
    // Create new membership - use overrideAccess because accepting user doesn't have permissions yet
    await payload.create({
      collection: 'members',
      data: {
        user: user.id,
        organization: organizationId,
        role: invitation.role || 'editor',
        status: 'active',
      },
      overrideAccess: true, // Bypass access controls - invitation acceptance is authorized by the invitation itself
    })
    console.log(`✅ Created new membership for user ${user.email} in organization ${organizationId} with role ${invitation.role}`)
  }

  // Mark invitation as accepted
  await payload.update({
    collection: 'invitations',
    id: invitation.id,
    data: {
      status: 'accepted',
    },
  })

  console.log(`🎉 Successfully accepted invitation for ${user.email} to organization ${organizationId}`)

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
