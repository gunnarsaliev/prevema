import type { PayloadRequest } from 'payload'

/**
 * Accept an invitation and add the user to the team
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

  // Get the team ID
  const teamId = typeof invitation.team === 'object' ? invitation.team.id : invitation.team

  // Fetch the team
  const team = await payload.findByID({
    collection: 'teams',
    id: teamId,
  })

  // Update the team to add the user as a member
  const currentMembers = team.members || []

  // Check if user is already a member
  const existingMemberIndex = currentMembers.findIndex((m: any) => {
    const userId = typeof m.user === 'object' ? m.user.id : m.user
    return userId === user.id
  })

  if (existingMemberIndex >= 0) {
    // Update existing member's role (in case invitation has a different role)
    currentMembers[existingMemberIndex].role = invitation.role || 'editor'
  } else {
    // Add new member with role
    currentMembers.push({
      user: user.id,
      role: invitation.role || 'editor',
    })
  }

  // Update the team
  await payload.update({
    collection: 'teams',
    id: teamId,
    data: {
      members: currentMembers,
    },
  })

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
    team: invitation.team,
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
