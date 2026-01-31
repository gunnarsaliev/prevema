import crypto from 'node:crypto'
import type { CollectionAfterChangeHook } from 'payload'
import type { Organization } from '@/payload-types'

/**
 * Automatically send invitations when organization members are added with email addresses
 */
export const autoInviteMembers: CollectionAfterChangeHook<Organization> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  // Only process updates (not creation)
  if (operation !== 'update') {
    return doc
  }

  const { payload } = req

  // Get members arrays
  const currentMembers = doc.members || []
  const previousMembers = (previousDoc?.members as any[]) || []

  // Find new members with email addresses (no user relationship)
  const newEmailMembers = currentMembers.filter((member: any) => {
    // Must have email and no user
    if (!member.email || member.user) {
      return false
    }

    // Check if this is a new member (not in previous members)
    const isNew = !previousMembers.some((prevMember: any) => {
      return prevMember.email === member.email
    })

    return isNew
  })

  if (newEmailMembers.length === 0) {
    console.log('No new email-based members to invite')
    return doc
  }

  console.log(`📧 Found ${newEmailMembers.length} new member(s) to invite`)

  // Send invitations for each email-based member
  const invitationResults: Array<{ email: string; success: boolean; error?: string }> = []

  for (const member of newEmailMembers) {
    const email = member.email
    const role = member.role || 'editor'

    if (!email) {
      console.warn('⚠️ Skipping invitation for member without email')
      continue
    }

    try {
      console.log(`📤 Creating invitation for ${email} with role ${role}`)

      // Create invitation
      await payload.create({
        collection: 'invitations',
        draft: false,
        data: {
          email,
          organization: doc.id,
          role,
          status: 'pending',
          token: crypto.randomBytes(32).toString('hex'),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          invitedBy: req.user?.id,
        },
      })

      invitationResults.push({ email, success: true })
      console.log(`✅ Invitation sent to ${email}`)
    } catch (error) {
      console.error(`❌ Failed to send invitation to ${email}:`, error)
      invitationResults.push({
        email,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Remove email-only members from the organization (they'll be added when they accept)
  const updatedMembers = currentMembers.filter((member: any) => {
    // Keep members that have a user relationship
    // Remove members that only have email (invitations sent)
    return member.user !== null && member.user !== undefined
  })

  // Update the organization to remove email-only members
  try {
    await payload.update({
      collection: 'organizations',
      id: doc.id,
      data: {
        members: updatedMembers,
      },
    })

    console.log(`✅ Removed ${newEmailMembers.length} email-only member(s) from organization`)
    console.log('📬 Invitations sent. Users will be added when they accept.')
  } catch (error) {
    console.error('❌ Failed to update organization members:', error)
  }

  // Add success/error messages to admin UI
  const successCount = invitationResults.filter((r) => r.success).length
  const errorCount = invitationResults.filter((r) => !r.success).length

  if (successCount > 0) {
    req.payload.logger.info(
      `✅ Sent ${successCount} invitation(s): ${invitationResults
        .filter((r) => r.success)
        .map((r) => r.email)
        .join(', ')}`,
    )
  }

  if (errorCount > 0) {
    req.payload.logger.warn(
      `⚠️  Failed to send ${errorCount} invitation(s): ${invitationResults
        .filter((r) => !r.success)
        .map((r) => `${r.email} (${r.error})`)
        .join(', ')}`,
    )
  }

  return doc
}
