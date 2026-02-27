import type { CollectionConfig } from 'payload'
import {
  checkRole,
  hasOrganizationRole,
  getUserOrganizationIdsWithMinRole,
} from '@/access/utilities'
import { autoSelectOrganization } from '@/hooks/autoSelectOrganization'
import { defaultOrganizationValue } from '@/fields/defaultOrganizationValue'
import { canAddMember } from '@/lib/stripe/subscriptionHelpers'
import crypto from 'crypto'

export const Invitations: CollectionConfig = {
  slug: 'invitations',
  admin: {
    useAsTitle: 'email',
    group: 'System',
    defaultColumns: ['email', 'organization', 'role', 'status', 'expiresAt'],
    // Visible to all authenticated users (access control handled by access permissions)
  },
  access: {
    // Super-admins, system admins, organization owners, and organization admins can create invitations
    create: async ({ req: { user, payload }, data }) => {
      if (!user) return false

      // Super-admins and system admins can create any invitation
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // If data.organization is provided (during actual creation), check specific org permission
      if (data?.organization) {
        const organizationId =
          typeof data.organization === 'object' ? data.organization.id : data.organization

        // Check if user has at least 'admin' role (includes owner and admin)
        const hasAdminAccess = await hasOrganizationRole(payload, user, organizationId, 'admin')

        return hasAdminAccess
      }

      // If no data.organization (e.g., checking if "Create New" button should show),
      // check if user manages any organizations
      const managedOrganizationIds = await getUserOrganizationIdsWithMinRole(
        payload,
        user,
        'admin',
      )

      // Allow create button if user manages at least one organization
      return managedOrganizationIds.length > 0
    },
    // Super-admins, system admins can read all invitations, organization owners/admins can see invitations for their organizations, users can see invitations sent to their email
    read: async ({ req: { user, payload } }) => {
      if (!user) return false

      // Super-admins and system admins can see all invitations
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Get organizations where user is owner or admin
      const managedOrganizationIds = await getUserOrganizationIdsWithMinRole(
        payload,
        user,
        'admin',
      )

      // Build query: user's email OR organizations they manage (owner/admin)
      const orConditions: any[] = [
        {
          email: {
            equals: user.email,
          },
        },
      ]

      if (managedOrganizationIds.length > 0) {
        orConditions.push({
          organization: {
            in: managedOrganizationIds,
          },
        })
      }

      return {
        or: orConditions,
      }
    },
    // Super-admins, system admins, organization owners, and organization admins can update invitations
    update: async ({ req: { user, payload } }) => {
      if (!user) return false

      // Super-admins and system admins can update any invitation
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Organization owners and admins can update invitations for their organizations
      const managedOrganizationIds = await getUserOrganizationIdsWithMinRole(
        payload,
        user,
        'admin',
      )

      if (managedOrganizationIds.length > 0) {
        return {
          organization: {
            in: managedOrganizationIds,
          },
        }
      }

      return false
    },
    // Super-admins, system admins, organization owners, and organization admins can delete invitations
    delete: async ({ req: { user, payload } }) => {
      if (!user) return false

      // Super-admins and system admins can delete any invitation
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Organization owners and admins can delete invitations for their organizations
      const managedOrganizationIds = await getUserOrganizationIdsWithMinRole(
        payload,
        user,
        'admin',
      )

      if (managedOrganizationIds.length > 0) {
        return {
          organization: {
            in: managedOrganizationIds,
          },
        }
      }

      return false
    },
  },
  hooks: {
    beforeValidate: [
      autoSelectOrganization,
      // Check seat limits before creating invitation
      async ({ data, operation, req }) => {
        if (operation !== 'create') {
          return data
        }

        // Get organization ID
        const organizationId =
          typeof data?.organization === 'object' ? data.organization.id : data?.organization

        if (!organizationId) {
          throw new Error('Organization is required to create an invitation')
        }

        // Check if organization has available seats
        const result = await canAddMember(req.payload, organizationId, req.user)

        if (!result.canAdd) {
          throw new Error(
            result.reason ||
              'Cannot send invitation: organization has no available seats. Please upgrade your subscription or remove inactive members.',
          )
        }

        console.log(
          `✅ Seat limit check passed for organization ${organizationId} - invitation can be sent`,
        )

        return data
      },
    ],
    beforeChange: [
      ({ data, operation, req }) => {
        // Generate a unique token for new invitations
        if (operation === 'create') {
          data.token = crypto.randomBytes(32).toString('hex')
          data.status = 'pending'

          // Set expiration to 7 days from now
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + 7)
          data.expiresAt = expiresAt.toISOString()

          // Set invitedBy to current user if not already set
          if (!data.invitedBy && req.user) {
            data.invitedBy = req.user.id
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Send invitation email after creation
        if (operation === 'create') {
          console.log('🔔 Invitation created, preparing to send email...')
          console.log('📧 Recipient:', doc.email)
          console.log('🔑 RESEND_API_KEY present:', !!process.env.RESEND_API_KEY)

          const inviteUrl = `${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/accept-invitation?token=${doc.token}`
          console.log('🔗 Invitation URL:', inviteUrl)

          try {
            // Fetch organization details to include in email
            let tenantName = 'an organization'
            if (typeof doc.organization === 'string') {
              const tenant = await req.payload.findByID({
                collection: 'organizations',
                id: doc.organization,
              })
              tenantName = tenant.name || tenantName
            } else if (
              doc.organization &&
              typeof doc.organization === 'object' &&
              'name' in doc.organization
            ) {
              tenantName = doc.organization.name || tenantName
            }

            // Get inviter details
            let inviterName = 'Someone'
            if (doc.invitedBy) {
              try {
                const inviterId =
                  typeof doc.invitedBy === 'string' ? doc.invitedBy : doc.invitedBy.id
                if (inviterId) {
                  const inviter = await req.payload.findByID({
                    collection: 'users',
                    id: inviterId,
                  })
                  inviterName = inviter.name || inviter.email || inviterName
                }
              } catch (err) {
                console.warn('Could not fetch inviter details:', err)
                // Continue with default inviterName
              }
            }

            // Format role name
            const roleLabel = doc.role
              .split('-')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')

            console.log('📤 Attempting to send email via Resend...')
            console.log('🔍 req.payload.sendEmail exists:', typeof req.payload.sendEmail)

            const emailResult = await req.payload.sendEmail({
              to: doc.email,
              subject: `You've been invited to join ${tenantName}`,
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
                    <h1 style="color: #2c3e50; margin-top: 0;">You're Invited! 🎉</h1>
                    <p style="font-size: 16px; color: #555;">
                      <strong>${inviterName}</strong> has invited you to join <strong>${tenantName}</strong>.
                    </p>
                  </div>
                  
                  <div style="background-color: #fff; border: 1px solid #e1e4e8; border-radius: 8px; padding: 25px; margin-bottom: 20px;">
                    <h2 style="color: #2c3e50; font-size: 18px; margin-top: 0;">Invitation Details</h2>
                    <p style="margin: 10px 0;">
                      <strong>Organization:</strong> ${tenantName}<br>
                      <strong>Role:</strong> ${roleLabel}<br>
                      <strong>Expires:</strong> ${new Date(doc.expiresAt).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        },
                      )}
                    </p>
                  </div>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${inviteUrl}" style="display: inline-block; background-color: #0066cc; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Accept Invitation
                    </a>
                  </div>

                  <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 15px; margin-top: 20px;">
                    <p style="margin: 0; font-size: 14px; color: #856404;">
                      ⏰ <strong>Note:</strong> This invitation will expire in 7 days. Make sure to accept it before then!
                    </p>
                  </div>

                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e4e8; font-size: 12px; color: #6c757d; text-align: center;">
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #0066cc;">${inviteUrl}</p>
                  </div>
                </body>
                </html>
              `,
            })

            console.log('📬 Email send result:', emailResult)
            console.log(`✅ Invitation email sent to ${doc.email} for organization: ${tenantName}`)
          } catch (error) {
            console.error('❌ Failed to send invitation email:', error)
            // Don't throw error - we still want the invitation to be created
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: {
        description: 'Email address of the person being invited',
      },
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
      defaultValue: defaultOrganizationValue,
      admin: {
        description: 'The organization this user is being invited to',
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
        {
          label: 'Viewer',
          value: 'viewer',
        },
      ],
      admin: {
        description:
          'The role this user will have in the organization (admin can manage, editor has edit access, viewer has read-only access)',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        {
          label: 'Pending',
          value: 'pending',
        },
        {
          label: 'Accepted',
          value: 'accepted',
        },
        {
          label: 'Declined',
          value: 'declined',
        },
        {
          label: 'Expired',
          value: 'expired',
        },
      ],
      admin: {
        readOnly: true,
        description: 'Current status of the invitation',
      },
    },
    {
      name: 'token',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      admin: {
        readOnly: true,
        description: 'When this invitation expires',
      },
    },
    {
      name: 'invitedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        description: 'User who sent the invitation',
      },
      defaultValue: ({ user }: any) => user?.id,
    },
  ],
}
