'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'

type UpdateOrganizationResult =
  | { success: true; message: string }
  | { success: false; error: string }

type UpdateUserProfileResult =
  | { success: true; message: string }
  | { success: false; error: string }

type Member = {
  id: string
  user: {
    id: string
    name: string
    email: string
    profileImage?: {
      url: string
    }
  }
  role: string
  status: string
  createdAt: string
}

type GetMembersResult = { success: true; members: Member[] } | { success: false; error: string }

type CreateInvitationResult = { success: true; message: string } | { success: false; error: string }

function parsePayloadError(err: unknown): string {
  if (!(err instanceof Error)) return 'Failed to update organization'

  const msg = err.message

  // Payload validation errors are sometimes nested as JSON in the message
  try {
    const parsed = JSON.parse(msg) as { errors?: Array<{ message?: string }> }
    if (parsed.errors?.length) {
      return parsed.errors.map((e) => e.message ?? 'Unknown error').join(', ')
    }
  } catch {
    // not JSON — fall through
  }

  return msg
}

export async function updateOrganization(formData: FormData): Promise<UpdateOrganizationResult> {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Find the organization owned by the current user
    const { docs } = await payload.find({
      collection: 'organizations',
      where: { owner: { equals: user.id } },
      limit: 1,
      depth: 0,
    })

    const org = docs[0]

    if (!org) {
      return { success: false, error: 'Organization not found' }
    }

    // Build organization update data
    const organizationData: Record<string, unknown> = {}

    const orgName = formData.get('orgName') as string | null
    if (orgName) organizationData.name = orgName

    // Email configuration
    const orgSenderName = formData.get('orgSenderName') as string | null
    const orgFromEmail = formData.get('orgFromEmail') as string | null
    const orgReplyToEmail = formData.get('orgReplyToEmail') as string | null
    const orgResendApiKey = formData.get('orgResendApiKey') as string | null

    if (orgSenderName || orgFromEmail || orgReplyToEmail || orgResendApiKey) {
      organizationData.emailConfig = {
        ...(orgSenderName && { senderName: orgSenderName }),
        ...(orgFromEmail && { fromEmail: orgFromEmail }),
        ...(orgReplyToEmail && { replyToEmail: orgReplyToEmail }),
        ...(orgResendApiKey && { resendApiKey: orgResendApiKey }),
      }
    }

    // Update the organization
    const updated = await payload.update({
      collection: 'organizations',
      id: org.id,
      data: organizationData as any,
    })

    if (!updated) {
      throw new Error('Failed to update organization')
    }

    return { success: true, message: 'Organization updated successfully' }
  } catch (err) {
    return { success: false, error: parsePayloadError(err) }
  }
}

export async function updateUserProfile(formData: FormData): Promise<UpdateUserProfileResult> {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get form values
    const name = formData.get('name') as string | null
    const newEmail = formData.get('newEmail') as string | null
    const currentPassword = formData.get('currentPassword') as string | null
    const newPassword = formData.get('newPassword') as string | null
    const confirmPassword = formData.get('confirmPassword') as string | null

    // Check if email or password change is requested
    const isChangingEmail = newEmail && newEmail.trim() !== '' && newEmail !== user.email
    const isChangingPassword = newPassword && newPassword.trim() !== ''

    // Validate current password if changing email or password
    if (isChangingEmail || isChangingPassword) {
      if (!currentPassword) {
        return { success: false, error: 'Current password is required to change email or password' }
      }

      // Verify current password
      try {
        const loginResult = await payload.login({
          collection: 'users',
          data: {
            email: user.email,
            password: currentPassword,
          },
        })

        if (!loginResult.user) {
          return { success: false, error: 'Current password is incorrect' }
        }
      } catch (err) {
        return { success: false, error: 'Current password is incorrect' }
      }
    }

    // Validate new password
    if (isChangingPassword) {
      if (!newPassword || newPassword.length < 8) {
        return { success: false, error: 'New password must be at least 8 characters long' }
      }

      if (newPassword !== confirmPassword) {
        return { success: false, error: 'New passwords do not match' }
      }
    }

    // Build user update data
    const userData: Record<string, unknown> = {}

    if (name) userData.name = name
    if (isChangingEmail) userData.email = newEmail
    if (isChangingPassword) userData.password = newPassword

    // Handle avatar upload
    const avatarFile = formData.get('avatar') as File | null
    if (avatarFile && avatarFile.size > 0) {
      const imageResult = await payload.create({
        collection: 'media',
        data: { alt: `Profile photo for ${name || user.name}` },
        file: {
          data: Buffer.from(await avatarFile.arrayBuffer()),
          name: avatarFile.name,
          mimetype: avatarFile.type,
          size: avatarFile.size,
        },
        user,
        overrideAccess: false,
      })

      if (imageResult) {
        userData.profileImage = imageResult.id
      }
    }

    // Update the user
    const updated = await payload.update({
      collection: 'users',
      id: user.id,
      data: userData as any,
    })

    if (!updated) {
      throw new Error('Failed to update profile')
    }

    return { success: true, message: 'Profile updated successfully' }
  } catch (err) {
    return { success: false, error: parsePayloadError(err) }
  }
}

export async function getOrganizationMembers(): Promise<GetMembersResult> {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Find the organization owned by the current user
    const { docs } = await payload.find({
      collection: 'organizations',
      where: { owner: { equals: user.id } },
      limit: 1,
      depth: 0,
    })

    const org = docs[0]

    if (!org) {
      return { success: false, error: 'Organization not found' }
    }

    // Fetch members with user details
    const membersResult = await payload.find({
      collection: 'members',
      where: {
        organization: { equals: org.id },
      },
      depth: 1,
      limit: 100,
      sort: '-createdAt',
    })

    const members = membersResult.docs.map((member: any) => ({
      id: member.id,
      user: {
        id: member.user.id,
        name: member.user.name || member.user.email,
        email: member.user.email,
        profileImage: member.user.profileImage?.url
          ? { url: member.user.profileImage.url }
          : undefined,
      },
      role: member.role,
      status: member.status,
      createdAt: member.createdAt,
    }))

    return { success: true, members }
  } catch (err) {
    console.error('Failed to fetch members:', err)
    return { success: false, error: parsePayloadError(err) }
  }
}

export async function createInvitation(formData: FormData): Promise<CreateInvitationResult> {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Find the organization owned by the current user
    const { docs } = await payload.find({
      collection: 'organizations',
      where: { owner: { equals: user.id } },
      limit: 1,
      depth: 0,
    })

    const org = docs[0]

    if (!org) {
      return { success: false, error: 'Organization not found' }
    }

    // Get form values
    const email = formData.get('email') as string | null
    const role = formData.get('role') as 'admin' | 'editor' | 'viewer' | null

    if (!email) {
      return { success: false, error: 'Email is required' }
    }

    if (!role) {
      return { success: false, error: 'Role is required' }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Invalid email format' }
    }

    // Check if user with this email exists and is already a member
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        email: { equals: email },
      },
      limit: 1,
    })

    if (existingUser.docs.length > 0) {
      // User exists, check if they're already a member
      const existingMember = await payload.find({
        collection: 'members',
        where: {
          and: [
            { organization: { equals: org.id } },
            { user: { equals: existingUser.docs[0].id } },
          ],
        },
        limit: 1,
      })

      if (existingMember.docs.length > 0) {
        return { success: false, error: 'User is already a member of this organization' }
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await payload.find({
      collection: 'invitations',
      where: {
        and: [
          { organization: { equals: org.id } },
          { email: { equals: email } },
          { status: { equals: 'pending' } },
        ],
      },
      limit: 1,
    })

    if (existingInvitation.docs.length > 0) {
      return { success: false, error: 'An invitation has already been sent to this email' }
    }

    // Create invitation
    const invitationData: any = {
      email,
      organization: org.id,
      role,
      invitedBy: user.id,
    }

    await payload.create({
      collection: 'invitations',
      data: invitationData,
    })

    return { success: true, message: 'Invitation sent successfully' }
  } catch (err) {
    console.error('Failed to create invitation:', err)
    return { success: false, error: parsePayloadError(err) }
  }
}
