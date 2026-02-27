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

  // Check if there's an invitation token in the request context
  console.log('🔍 autoAcceptInvitation hook - checking context:', {
    hasContext: !!req.context,
    contextKeys: req.context ? Object.keys(req.context) : [],
    invitationToken: req.context?.invitationToken,
  })

  const invitationToken = req.context?.invitationToken as string | undefined

  if (!invitationToken) {
    console.log('⚠️  No invitation token provided during user creation')
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
              equals: doc.id,
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
        console.log(`✅ Updated existing member role to ${invitation.role}`)
      }
    } else {
      // Create new membership
      await payload.create({
        collection: 'members',
        data: {
          user: doc.id,
          organization: organizationId,
          role: invitation.role || 'editor',
          status: 'active',
        },
      })
      console.log(`✅ Added user ${doc.email} to organization ${organizationId} as new member`)
    }

    // Mark invitation as accepted
    await payload.update({
      collection: 'invitations',
      id: invitation.id,
      data: {
        status: 'accepted',
      },
    })

    console.log(
      `✅ Successfully auto-accepted invitation for ${doc.email} to organization ${organizationId} with role ${invitation.role}`,
    )
  } catch (error) {
    console.error('❌ Error auto-accepting invitation:', error)
    // Don't throw - user creation should still succeed even if invitation acceptance fails
  }

  return doc
}
