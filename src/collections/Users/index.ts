import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { adminOnlyPricingPlanAccess } from '@/access/adminOnlyPricingPlanAccess'
import { publicAccess } from '@/access/publicAccess'
import { adminOrSelf } from '@/access/adminOrSelf'
import { checkRole } from '@/access/utilities'

import { ensureFirstUserIsAdmin } from './hooks/ensureFirstUserIsAdmin'
import { assignUnlimitedToAdmins } from './hooks/assignUnlimitedToAdmins'
import { autoAcceptInvitation } from './hooks/autoAcceptInvitation'
import { preventDeleteIfOwnsOrganizations } from './hooks/preventDeleteIfOwnsOrganizations'

export const Users: CollectionConfig = {
  slug: 'users',
  hooks: {
    beforeDelete: [preventDeleteIfOwnsOrganizations],
    afterChange: [autoAcceptInvitation],
  },
  access: {
    admin: ({ req: { user } }) => checkRole(['super-admin', 'admin', 'user'], user),
    create: publicAccess,
    delete: adminOnly,
    read: adminOrSelf,
    update: adminOrSelf,
  },
  admin: {
    group: 'System',
    defaultColumns: ['name', 'email', 'roles'],
    useAsTitle: 'email',
    hidden: ({ user }) => {
      // Hide from regular users (only super-admins and admins can see)
      return !checkRole(['super-admin', 'admin'], user)
    },
  },
  auth: {
    tokenExpiration: 1209600,
    forgotPassword: {
      generateEmailHTML: ({ req, token, user }) => {
        // Generate the reset password URL
        const resetPasswordURL = `${process.env.NEXT_PUBLIC_SERVER_URL || req.headers.get('origin')}/admin/reset/${token}`

        return `
          <!doctype html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background-color: #f8f9fa;
                  padding: 30px;
                  text-align: center;
                  border-radius: 8px 8px 0 0;
                }
                .content {
                  background-color: #ffffff;
                  padding: 30px;
                  border: 1px solid #e9ecef;
                }
                .button {
                  display: inline-block;
                  padding: 12px 24px;
                  background-color: #0066cc;
                  color: #ffffff !important;
                  text-decoration: none;
                  border-radius: 5px;
                  margin: 20px 0;
                  font-weight: 600;
                }
                .footer {
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #e9ecef;
                  font-size: 14px;
                  color: #6c757d;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1 style="margin: 0; color: #212529;">Password Reset Request</h1>
              </div>
              <div class="content">
                <p>Hello ${user.email},</p>
                <p>We received a request to reset your password for your Prevema account. If you didn't make this request, you can safely ignore this email.</p>
                <p>To reset your password, click the button below:</p>
                <p style="text-align: center;">
                  <a href="${resetPasswordURL}" class="button">Reset Password</a>
                </p>
                <p style="font-size: 14px; color: #6c757d;">
                  Or copy and paste this link into your browser:<br>
                  <a href="${resetPasswordURL}" style="color: #0066cc; word-break: break-all;">${resetPasswordURL}</a>
                </p>
                <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
                  This link will expire in 1 hour for security reasons.
                </p>
              </div>
              <div class="footer">
                <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
                <p>&copy; ${new Date().getFullYear()} Prevema. All rights reserved.</p>
              </div>
            </body>
          </html>
        `
      },
      generateEmailSubject: ({ req, user }) => {
        return `Reset your Prevema password`
      },
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      access: {
        create: adminOnlyFieldAccess,
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      defaultValue: ['user'],
      hasMany: true,
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin],
      },
      options: [
        {
          label: 'Super Admin',
          value: 'super-admin',
        },
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
    },
    {
      name: 'pricingPlan',
      type: 'select',
      required: true,
      defaultValue: 'free',
      access: {
        create: adminOnlyPricingPlanAccess,
        update: adminOnlyPricingPlanAccess,
      },
      hooks: {
        beforeChange: [assignUnlimitedToAdmins],
      },
      options: [
        {
          label: 'Free',
          value: 'free',
        },
        {
          label: 'Pro',
          value: 'pro',
        },
        {
          label: 'Organizations',
          value: 'organizations',
        },
        {
          label: 'Unlimited',
          value: 'unlimited',
        },
      ],
      admin: {
        description: 'Free: 1 tenant. Pro: 3 tenants. Organizations: 20 tenants.',
        condition: (data) => {
          // Hide pricing plan selector for super-admins and admins
          const roles = data?.roles || []
          const isAdminRole = roles.includes('super-admin') || roles.includes('admin')
          return !isAdminRole
        },
      },
    },
  ],
}
