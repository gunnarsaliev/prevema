import type { CollectionConfig } from 'payload'
import { checkRole, getUserOrganizationIds } from '@/access/utilities'

export const EmailLogs: CollectionConfig = {
  slug: 'email-logs',
  labels: {
    singular: 'Email History',
    plural: 'Email History',
  },
  admin: {
    useAsTitle: 'recipientEmail',
    group: 'Communication',
    defaultColumns: ['recipientEmail', 'template', 'status', 'sentAt'],
    description: 'Audit log of all sent emails',
  },
  access: {
    admin: ({ req: { user } }) => checkRole(['super-admin', 'admin', 'user'], user),
    create: () => true, // System can create logs
    read: async ({ req: { user, payload } }) => {
      // Super-admins and admins can read all logs
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Regular users can only read logs for their organizations
      if (!user) return false

      const teamIds = await getUserOrganizationIds(payload, user)

      if (teamIds.length > 0) {
        return {
          team: {
            in: teamIds,
          },
        }
      }

      return false
    },
    update: () => false, // Logs are immutable
    delete: ({ req: { user } }) => checkRole(['super-admin'], user), // Only super-admins can delete logs
  },
  fields: [
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
      admin: {
        description: 'The organization this email belongs to',
      },
    },
    {
      name: 'template',
      type: 'relationship',
      relationTo: 'email-templates',
      required: true,
      admin: {
        description: 'The template used for this email',
      },
    },
    {
      name: 'recipientEmail',
      type: 'email',
      required: true,
      admin: {
        description: 'Email address of the recipient',
      },
    },
    {
      name: 'triggerEvent',
      type: 'select',
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Participant Created', value: 'participant.created' },
        { label: 'Participant Updated', value: 'participant.updated' },
        { label: 'Partner Invited', value: 'partner.invited' },
        { label: 'Event Published', value: 'event.published' },
        { label: 'Form Submitted', value: 'form.submitted' },
        { label: 'Custom', value: 'custom' },
        { label: 'Test', value: 'test' },
      ],
      required: true,
      admin: {
        description: 'What triggered this email',
      },
    },
    {
      name: 'variables',
      type: 'textarea',
      admin: {
        description: 'Variables used in the email (JSON format)',
        readOnly: true,
        rows: 5,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Sent', value: 'sent' },
        { label: 'Failed', value: 'failed' },
        { label: 'Scheduled', value: 'scheduled' },
      ],
      required: true,
      defaultValue: 'sent',
      admin: {
        description: 'Status of the email',
      },
    },
    {
      name: 'errorMessage',
      type: 'textarea',
      admin: {
        description: 'Error message if sending failed',
        condition: (data) => data.status === 'failed',
        readOnly: true,
      },
    },
    {
      name: 'sentAt',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the email was sent',
        readOnly: true,
      },
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'sentBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who manually sent this email (if applicable)',
        readOnly: true,
      },
    },
  ],
}
