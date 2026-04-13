import type { CollectionConfig } from 'payload'
import { checkRole, getUserOrganizationIds } from '@/access/utilities'

export const EmailLogs: CollectionConfig = {
  slug: 'email-logs',
  labels: {
    singular: 'Email History',
    plural: 'Email History',
  },
  admin: {
    useAsTitle: 'subject',
    group: 'Communication',
    defaultColumns: ['direction', 'subject', 'fromEmail', 'toEmail', 'status', 'createdAt'],
    description: 'Audit log of all sent and received emails',
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

      const organizationIds = await getUserOrganizationIds(payload, user)

      if (organizationIds.length > 0) {
        return {
          organization: {
            in: organizationIds,
          },
        }
      }

      return false
    },
    update: async ({ req: { user, payload } }) => {
      // Allow users to update read status for emails in their organizations
      if (!user) return false

      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      const organizationIds = await getUserOrganizationIds(payload, user)
      if (organizationIds.length > 0) {
        return {
          organization: {
            in: organizationIds,
          },
        }
      }

      return false
    },
    delete: ({ req: { user } }) => checkRole(['super-admin'], user), // Only super-admins can delete logs
  },
  fields: [
    {
      name: 'direction',
      type: 'select',
      options: [
        { label: 'Outbound', value: 'outbound' },
        { label: 'Inbound', value: 'inbound' },
      ],
      required: true,
      defaultValue: 'outbound',
      admin: {
        description: 'Whether this email was sent or received',
      },
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: false,
      admin: {
        description: 'The organization this email belongs to',
      },
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      admin: {
        description: 'Email subject line',
      },
    },
    {
      name: 'fromEmail',
      type: 'email',
      required: true,
      admin: {
        description: 'Sender email address',
      },
    },
    {
      name: 'fromName',
      type: 'text',
      admin: {
        description: 'Sender name',
      },
    },
    {
      name: 'toEmail',
      type: 'email',
      required: true,
      admin: {
        description: 'Recipient email address',
      },
    },
    {
      name: 'toName',
      type: 'text',
      admin: {
        description: 'Recipient name',
      },
    },
    {
      name: 'ccEmails',
      type: 'text',
      admin: {
        description: 'CC email addresses (comma-separated)',
        condition: (data) => data.direction === 'inbound',
      },
    },
    {
      name: 'replyTo',
      type: 'email',
      admin: {
        description: 'Reply-to email address',
      },
    },
    {
      name: 'htmlContent',
      type: 'textarea',
      admin: {
        description: 'HTML content of the email',
        rows: 10,
      },
    },
    {
      name: 'textContent',
      type: 'textarea',
      admin: {
        description: 'Plain text content of the email',
        rows: 5,
      },
    },
    {
      name: 'template',
      type: 'relationship',
      relationTo: 'email-templates',
      required: false,
      admin: {
        description: 'The template used for this email (outbound only)',
        condition: (data) => data.direction === 'outbound',
      },
    },
    {
      name: 'templateName',
      type: 'text',
      admin: {
        description: 'Name of the template at time of sending',
        readOnly: true,
        condition: (data) => data.direction === 'outbound',
      },
    },
    {
      name: 'recipientEmail',
      type: 'email',
      admin: {
        description: 'Email address of the recipient (legacy field)',
        condition: () => false, // Hidden, kept for backward compatibility
      },
    },
    {
      name: 'templateSubject',
      type: 'text',
      admin: {
        description: 'Subject line from the template at time of sending (legacy field)',
        condition: () => false, // Hidden, kept for backward compatibility
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
        { label: 'Inbound', value: 'inbound' },
      ],
      admin: {
        description: 'What triggered this email',
        condition: (data) => data.direction === 'outbound',
      },
    },
    {
      name: 'variables',
      type: 'textarea',
      admin: {
        description: 'Variables used in the email (JSON format)',
        readOnly: true,
        rows: 5,
        condition: (data) => data.direction === 'outbound',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Sent', value: 'sent' },
        { label: 'Failed', value: 'failed' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Received', value: 'received' },
        { label: 'Bounced', value: 'bounced' },
        { label: 'Complained', value: 'complained' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Opened', value: 'opened' },
        { label: 'Clicked', value: 'clicked' },
      ],
      required: true,
      defaultValue: 'sent',
      admin: {
        description: 'Status of the email',
      },
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this email has been read by the user',
      },
    },
    {
      name: 'errorMessage',
      type: 'textarea',
      admin: {
        description: 'Error message if sending failed',
        condition: (data) => data.status === 'failed' || data.status === 'bounced',
        readOnly: true,
      },
    },
    {
      name: 'sentAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the email was sent/received',
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
        condition: (data) => data.direction === 'outbound',
      },
    },
    {
      name: 'messageId',
      type: 'text',
      admin: {
        description: 'Email message ID from the email provider',
        readOnly: true,
      },
    },
    {
      name: 'inReplyTo',
      type: 'text',
      admin: {
        description: 'Message ID this email is replying to',
        condition: (data) => data.direction === 'inbound',
      },
    },
    {
      name: 'attachments',
      type: 'array',
      admin: {
        description: 'Email attachments',
      },
      fields: [
        {
          name: 'filename',
          type: 'text',
          required: true,
        },
        {
          name: 'contentType',
          type: 'text',
        },
        {
          name: 'size',
          type: 'number',
          admin: {
            description: 'File size in bytes',
          },
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            description: 'URL to download the attachment',
          },
        },
      ],
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata from the email provider',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Set read status based on direction:
        // - Outbound (sent) emails are read by default
        // - Inbound (received) emails are unread by default
        if (operation === 'create') {
          if (data.read === undefined || data.read === null) {
            data.read = data.direction === 'outbound'
          }
        }

        // Auto-populate legacy fields for backward compatibility
        if (operation === 'create' && data.direction === 'outbound') {
          if (!data.recipientEmail && data.toEmail) {
            data.recipientEmail = data.toEmail
          }
          if (!data.templateSubject && data.subject) {
            data.templateSubject = data.subject
          }
        }
        return data
      },
    ],
  },
}
