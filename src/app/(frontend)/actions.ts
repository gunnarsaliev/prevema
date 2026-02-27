'use server'

import { login, logout } from '@payloadcms/next/auth'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { parseInvitationError } from '@/utils/parseInvitationError'
import { acceptInvitation } from '@/collections/Invitations/hooks/acceptInvitation'

/**
 * Parse Payload errors to provide user-friendly error messages
 * Specifically handles duplicate email errors and validation errors
 */
function parseRegistrationError(err: unknown): string {
  if (!(err instanceof Error)) return 'Registration failed'

  const msg = err.message

  // Check for "The following field is invalid: email" message
  if (msg.toLowerCase().includes('field is invalid') && msg.toLowerCase().includes('email')) {
    return 'This email address is already registered. Please use a different email or try logging in.'
  }

  // Check for duplicate email error (Postgres unique constraint)
  if (msg.toLowerCase().includes('unique') && msg.toLowerCase().includes('email')) {
    return 'This email address is already registered. Please use a different email or try logging in.'
  }

  // Check for duplicate key error
  if (msg.toLowerCase().includes('duplicate') && msg.toLowerCase().includes('email')) {
    return 'This email address is already registered. Please use a different email or try logging in.'
  }

  // Check for "already in use" or "already exists" messages
  if ((msg.toLowerCase().includes('already') && msg.toLowerCase().includes('email')) ||
      msg.toLowerCase().includes('email already')) {
    return 'This email address is already registered. Please use a different email or try logging in.'
  }

  // Payload validation errors are sometimes nested as JSON in the message
  try {
    const parsed = JSON.parse(msg) as {
      errors?: Array<{
        message?: string
        field?: string
      }>
    }
    if (parsed.errors?.length) {
      // Check for email-specific errors
      const emailErr = parsed.errors.find((e) =>
        e.message?.toLowerCase().includes('email') ||
        e.field?.toLowerCase().includes('email')
      )
      if (emailErr?.message?.toLowerCase().includes('unique') ||
          emailErr?.message?.toLowerCase().includes('already') ||
          emailErr?.message?.toLowerCase().includes('invalid')) {
        return 'This email address is already registered. Please use a different email or try logging in.'
      }
      // Return all validation errors
      return parsed.errors.map((e) => e.message ?? 'Unknown error').join(', ')
    }
  } catch {
    // not JSON — fall through
  }

  // Return the original message if we can't parse it better
  return msg
}

export async function registerAction({
  email,
  password,
  name,
  invitationToken,
}: {
  email: string
  password: string
  name: string
  invitationToken?: string
}) {
  try {
    const payload = await getPayload({ config })

    // Check if user is registering via invitation
    let hasValidInvitation = false
    if (invitationToken) {
      try {
        // Validate the invitation token
        const invitations = await payload.find({
          collection: 'invitations',
          where: {
            token: {
              equals: invitationToken,
            },
          },
          limit: 1,
        })

        if (invitations.docs.length > 0) {
          const invitation = invitations.docs[0]

          // Check if invitation is valid
          const now = new Date()
          const expiresAt = new Date(invitation.expiresAt)
          const isExpired = now > expiresAt
          const isEmailMatch = invitation.email === email
          const isPending = invitation.status === 'pending'

          if (!isExpired && isEmailMatch && isPending) {
            hasValidInvitation = true
            console.log('✅ Valid invitation found - user will join organization', invitation.organization)
          } else {
            console.warn('⚠️  Invalid invitation:', {
              isExpired,
              isEmailMatch,
              isPending,
            })
          }
        }
      } catch (invError) {
        console.error('Error validating invitation:', invError)
        // Continue with registration even if invitation validation fails
      }
    }

    // Create the user (without invitation handling in hook - that comes after)
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] 🔍 Creating user:`, {
      hasInvitationToken: !!invitationToken,
      invitationToken: invitationToken ? invitationToken.substring(0, 10) + '...' : 'none',
      email,
    })

    const user = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        name,
      },
    })
    console.log(`[${timestamp}] ✅ User created:`, user.id, user.email)

    // If user was created via invitation, accept it now (after user is committed to DB)
    if (invitationToken && hasValidInvitation) {
      console.log(`[${timestamp}] 🎫 Accepting invitation for user ${user.id}`)
      try {
        // Create a mock PayloadRequest object for acceptInvitation
        const payloadReq = {
          payload,
          user: user,
          headers: new Headers(),
        } as any

        // Accept the invitation - this will create the member and update invitation status
        const result = await acceptInvitation(invitationToken, payloadReq)

        console.log(`[${timestamp}] ✅ Invitation accepted successfully:`, result)
      } catch (invitationError) {
        console.error(`[${timestamp}] ❌ Invitation acceptance failed:`, invitationError)

        // Parse the error to get user-friendly message
        const { userMessage, technicalDetails } = parseInvitationError(invitationError)
        console.error(`[${timestamp}] 📋 Technical details:`, technicalDetails)

        // Delete the user if invitation acceptance fails
        try {
          await payload.delete({
            collection: 'users',
            id: user.id,
            overrideAccess: true,
          })
          console.log(`[${timestamp}] 🗑️  Deleted user ${user.id} due to failed invitation acceptance`)
        } catch (deleteError) {
          console.error(`[${timestamp}] ❌ Failed to delete user:`, deleteError)
        }

        return {
          success: false,
          error: userMessage,
        }
      }
    }

    // Only create a default organization if user is NOT joining via invitation
    if (!hasValidInvitation) {
      console.log(`[${timestamp}] 📝 No valid invitation - creating default organization`)
      try {
        const org = await payload.create({
          collection: 'organizations',
          data: {
            name: `${name || email}'s Organization`,
            owner: user.id,
          },
          overrideAccess: true,
          user: user, // Pass user context so hooks can access req.user
        })
        console.log('✅ Organization created:', org.id)

        // Create subscription for the organization
        console.log('💳 Creating subscription for organization', org.id)
        try {
          // Check if user is super-admin or admin
          const isSystemAdmin = user.roles?.some((role: any) =>
            role === 'super-admin' || role === 'admin'
          )

          // Calculate trial end date (14 days from now)
          const trialEnd = new Date()
          trialEnd.setDate(trialEnd.getDate() + 14)

          // Calculate current period end (30 days from now for monthly)
          const periodEnd = new Date()
          periodEnd.setDate(periodEnd.getDate() + 30)

          if (isSystemAdmin) {
            // Create unlimited subscription for super-admins and admins
            await payload.create({
              collection: 'subscriptions',
              data: {
                organization: org.id,
                tier: 'system-unlimited',
                billingCycle: 'none',
                isSystemAdmin: true,
                seatsIncluded: -1, // Unlimited
                additionalSeats: 0,
                pricePerAdditionalSeat: 0,
                stripeStatus: 'active',
                currentPeriodStart: new Date().toISOString(),
                currentPeriodEnd: null,
              },
              overrideAccess: true,
            })
            console.log('✅ Created unlimited subscription for organization', org.id)
          } else {
            // Create free tier subscription with trial for regular users
            await payload.create({
              collection: 'subscriptions',
              data: {
                organization: org.id,
                tier: 'free',
                billingCycle: 'monthly',
                isSystemAdmin: false,
                seatsIncluded: 3, // Free tier: 3 seats
                additionalSeats: 0,
                pricePerAdditionalSeat: 0,
                stripeStatus: 'trialing',
                currentPeriodStart: new Date().toISOString(),
                currentPeriodEnd: periodEnd.toISOString(),
                trialStart: new Date().toISOString(),
                trialEnd: trialEnd.toISOString(),
              },
              overrideAccess: true,
            })
            console.log('✅ Created free trial subscription for organization', org.id)
          }
        } catch (subError) {
          console.error('❌ Failed to create subscription:', subError)
        }

        // Create owner member for the organization
        console.log('👤 Creating owner membership for user', user.id, 'in organization', org.id)
        try {
          await payload.create({
            collection: 'members',
            data: {
              user: user.id,
              organization: org.id,
              role: 'owner',
              status: 'active',
            },
            overrideAccess: true,
            context: {
              isInitialOwner: true,
            },
          })
          console.log('✅ Created owner membership for organization', org.id)
        } catch (memberError) {
          console.error('❌ Failed to create owner membership:', memberError)
        }
      } catch (orgError) {
        // Log but don't fail registration if organization creation fails
        console.error('❌ Failed to create default organization:', orgError)
        if (orgError instanceof Error) {
          console.error('Organization error details:', orgError.message)
          console.error('Organization error stack:', orgError.stack)
        }
      }
    } else {
      console.log('🎫 User registering via invitation - skipping default organization creation')
    }

    // Automatically log in the user after registration
    const loginResult = await login({
      collection: 'users',
      config,
      email,
      password,
    })

    return { success: true, user: loginResult.user }
  } catch (error) {
    // Log the full error for debugging
    console.error('Registration error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error name:', error.name)
    }

    return {
      success: false,
      error: parseRegistrationError(error),
    }
  }
}

export async function loginAction({ email, password }: { email: string; password: string }) {
  try {
    const result = await login({
      collection: 'users',
      config,
      email,
      password,
    })
    return { success: true, user: result.user }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    }
  }
}

export async function logoutAction() {
  try {
    await logout({ allSessions: true, config })
  } catch (error) {
    throw new Error(
      `Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}
