import type { CollectionAfterChangeHook } from 'payload'
import type { User } from '@/payload-types'
import { parseInvitationError } from '@/utils/parseInvitationError'

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
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] 🔍 autoAcceptInvitation hook - checking context:`, {
    hasContext: !!req.context,
    contextKeys: req.context ? Object.keys(req.context) : [],
    invitationToken: req.context?.invitationToken ? 'present' : 'missing',
    userEmail: doc.email,
  })

  const invitationToken = req.context?.invitationToken as string | undefined

  if (!invitationToken) {
    console.log(`[${timestamp}] ℹ️  No invitation token - user creating own organization`)
    return doc
  }

  console.log(`[${timestamp}] 🎫 Auto-accepting invitation for new user: ${doc.email}`)

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
      const error = new Error(`Invalid invitation token. The invitation link may have been deleted or is incorrect.`)
      console.error(`[${timestamp}] ❌ ${error.message}`)
      throw error
    }

    const invitation = invitations.docs[0]
    console.log(`[${timestamp}] 📋 Found invitation:`, {
      id: invitation.id,
      email: invitation.email,
      status: invitation.status,
      organization: invitation.organization,
      role: invitation.role,
    })

    // Validate invitation
    if (invitation.status !== 'pending') {
      const error = new Error(`This invitation has already been ${invitation.status}. Please request a new invitation.`)
      console.error(`[${timestamp}] ❌ ${error.message}`)
      throw error
    }

    // Check if invitation has expired
    const now = new Date()
    const expiresAt = new Date(invitation.expiresAt)
    if (now > expiresAt) {
      // Mark as expired before throwing
      await payload.update({
        collection: 'invitations',
        id: invitation.id,
        data: {
          status: 'expired',
        },
      })
      const error = new Error(`This invitation has expired. Please request a new invitation from your organization administrator.`)
      console.error(`[${timestamp}] ❌ ${error.message}`)
      throw error
    }

    // Check if the invitation email matches the user's email
    if (invitation.email !== doc.email) {
      const error = new Error(`This invitation was sent to ${invitation.email}, but you're trying to register with ${doc.email}. Please use the correct email address.`)
      console.error(`[${timestamp}] ❌ ${error.message}`)
      throw error
    }

    // Get the organization ID
    const organizationId =
      typeof invitation.organization === 'object'
        ? invitation.organization.id
        : invitation.organization

    console.log(`[${timestamp}] 🏢 Processing membership for organization: ${organizationId}`)

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
      console.log(`[${timestamp}] 🔄 Found existing membership, checking if update needed`)
      if (membership.role !== invitation.role) {
        await payload.update({
          collection: 'members',
          id: membership.id,
          data: {
            role: invitation.role || 'editor',
            status: 'active',
          },
        })
        console.log(`[${timestamp}] ✅ Updated existing member role to ${invitation.role}`)
      } else {
        console.log(`[${timestamp}] ✅ Membership already exists with correct role: ${membership.role}`)
      }
    } else {
      // Create new membership - use overrideAccess because new user doesn't have permissions yet
      console.log(`[${timestamp}] ➕ Creating new membership with role: ${invitation.role || 'editor'}`)
      try {
        await payload.create({
          collection: 'members',
          data: {
            user: doc.id,
            organization: organizationId,
            role: invitation.role || 'editor',
            status: 'active',
          },
          overrideAccess: true, // Bypass access controls - invitation acceptance is authorized by the invitation itself
          context: {
            isInvitationAcceptance: true, // Skip seat limit check - invitation was already validated when created
          },
        })
        console.log(`[${timestamp}] ✅ Created member record for ${doc.email} in organization ${organizationId}`)
      } catch (memberError) {
        // Parse the error to get user-friendly message
        const { userMessage, technicalDetails } = parseInvitationError(memberError)
        console.error(`[${timestamp}] ❌ Member creation failed:`)
        console.error(`[${timestamp}] 📋 Technical details:`, technicalDetails)

        // Throw user-friendly error with original error preserved in cause
        const error = new Error(userMessage, { cause: memberError })
        throw error
      }
    }

    // Mark invitation as accepted
    console.log(`[${timestamp}] 📝 Updating invitation status to accepted`)
    try {
      await payload.update({
        collection: 'invitations',
        id: invitation.id,
        data: {
          status: 'accepted',
        },
      })
      console.log(`[${timestamp}] ✅ Invitation marked as accepted`)
    } catch (invitationUpdateError) {
      const { userMessage, technicalDetails } = parseInvitationError(invitationUpdateError)
      console.error(`[${timestamp}] ❌ Invitation update failed:`)
      console.error(`[${timestamp}] 📋 Technical details:`, technicalDetails)

      // Throw user-friendly error - membership was created but status update failed
      const error = new Error(
        `You've been added to the organization, but we couldn't update the invitation status. ${userMessage}`,
        { cause: invitationUpdateError },
      )
      throw error
    }

    console.log(
      `[${timestamp}] 🎉 Successfully auto-accepted invitation for ${doc.email} to organization ${organizationId} with role ${invitation.role}`,
    )
  } catch (error) {
    console.error(`[${timestamp}] ❌ Error auto-accepting invitation:`, error)
    console.error(`[${timestamp}] ❌ Full error stack:`, error instanceof Error ? error.stack : 'No stack trace')
    // Re-throw the error to prevent user creation if invitation acceptance fails
    throw error
  }

  return doc
}
