import type { CollectionAfterChangeHook } from 'payload'
import type { User } from '@/payload-types'

/**
 * Automatically accept invitation when a new user is created with an invitation token
 */
export const autoAcceptInvitation: CollectionAfterChangeHook<User> = async ({
  doc,
  operation,
  req,
}) => {
  // Only run for new user creation
  if (operation !== 'create') {
    return doc
  }

  const { payload } = req

  // Check if there's an invitation token in the request data
  const invitationToken = req.data?.invitationToken as string | undefined

  if (!invitationToken) {
    console.log('No invitation token provided during user creation')
    return doc
  }

  console.log('🎫 Auto-accepting invitation for new user:', doc.email)

  try {
    // Find the invitation by token
    const invitations = await payload.find({
      collection: 'invitations',
      where: {
        token: {
          equals: invitationToken,
        },
      },
      limit: 1,
    })

    if (invitations.docs.length === 0) {
      console.warn('⚠️  Invalid invitation token:', invitationToken)
      return doc
    }

    const invitation = invitations.docs[0]

    // Validate invitation
    if (invitation.status !== 'pending') {
      console.warn(`⚠️  Invitation already ${invitation.status}`)
      return doc
    }

    // Check if invitation has expired
    const now = new Date()
    const expiresAt = new Date(invitation.expiresAt)
    if (now > expiresAt) {
      console.warn('⚠️  Invitation has expired')
      await payload.update({
        collection: 'invitations',
        id: invitation.id,
        data: {
          status: 'expired',
        },
      })
      return doc
    }

    // Check if the invitation email matches the user's email
    if (invitation.email !== doc.email) {
      console.warn('⚠️  Invitation email mismatch:', invitation.email, 'vs', doc.email)
      return doc
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

    // Check if user is already a member (shouldn't happen, but just in case)
    const existingMemberIndex = currentMembers.findIndex((m: any) => {
      const userId = typeof m.user === 'object' ? m.user.id : m.user
      return userId === doc.id
    })

    if (existingMemberIndex >= 0) {
      // Update existing member's role
      currentMembers[existingMemberIndex].role = invitation.role || 'editor'
      console.log('✅ Updated existing member role')
    } else {
      // Add new member with role
      currentMembers.push({
        user: doc.id,
        role: invitation.role || 'editor',
      })
      console.log('✅ Added user to team as new member')
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

    console.log(`✅ Successfully auto-accepted invitation for ${doc.email} to team ${teamId} with role ${invitation.role}`)
  } catch (error) {
    console.error('❌ Error auto-accepting invitation:', error)
    // Don't throw - user creation should still succeed even if invitation acceptance fails
  }

  return doc
}
