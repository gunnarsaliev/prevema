import type { CollectionConfig } from 'payload'
import { checkRole, getUserTeamIds } from '@/access/utilities'
import { autoSelectTeam } from '@/hooks/autoSelectTeam'
import { defaultTeamValue } from '@/fields/defaultTeamValue'
import { formatSlugHook } from '@/utils/formatSlug'
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  LinkFeature,
  ParagraphFeature,
} from '@payloadcms/richtext-lexical'

export const EmailTemplates: CollectionConfig = {
  slug: 'email-templates',
  hooks: {
    beforeValidate: [autoSelectTeam],
  },
  access: {
    admin: ({ req: { user } }) => checkRole(['super-admin', 'admin', 'user'], user),
    create: async ({ req: { user, payload } }) => {
      // Super-admins and admins can create templates for any team
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Regular users can only create templates for their teams
      return !!user
    },
    read: async ({ req: { user, payload } }) => {
      // Super-admins and admins can read all templates
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Regular users can only read templates for their teams
      if (!user) return false

      const teamIds = await getUserTeamIds(payload, user)

      if (teamIds.length > 0) {
        return {
          team: {
            in: teamIds,
          },
        }
      }

      return false
    },
    update: async ({ req: { user, payload } }) => {
      // Super-admins and admins can update any template
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Regular users can only update templates for their teams
      if (!user) return false

      const teamIds = await getUserTeamIds(payload, user)

      if (teamIds.length > 0) {
        return {
          team: {
            in: teamIds,
          },
        }
      }

      return false
    },
    delete: async ({ req: { user, payload } }) => {
      // Super-admins and admins can delete any template
      if (checkRole(['super-admin', 'admin'], user)) {
        return true
      }

      // Regular users can only delete templates for their teams
      if (!user) return false

      const teamIds = await getUserTeamIds(payload, user)

      if (teamIds.length > 0) {
        return {
          team: {
            in: teamIds,
          },
        }
      }

      return false
    },
  },
  admin: {
    useAsTitle: 'name',
    group: 'Communication',
    defaultColumns: ['name', 'team', 'subject', 'updatedAt'],
    description: 'Create and manage email templates with dynamic variables',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Template name',
      required: true,
      admin: {
        description: 'Template identifier (e.g., "participant-welcome", "partner-invitation")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Template description',
      admin: {
        description: 'What this template is used for',
      },
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
      defaultValue: defaultTeamValue,
      admin: {
        description: 'The team this template belongs to',
        position: 'sidebar',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      hooks: {
        beforeValidate: [formatSlugHook('name')],
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this template is active and can be used',
        position: 'sidebar',
      },
    },
    {
      name: 'testEmailButton',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/collections/EmailTemplates/components#SendTestEmailButton',
        },
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          description: 'Email subject and body content',
          fields: [
            {
              name: 'subject',
              type: 'text',
              label: 'Email subject',
              required: true,
              admin: {
                description: 'Email subject line. Use {{variable}} for dynamic content.',
              },
            },
            {
              name: 'htmlBody',
              type: 'richText',
              label: 'Message',
              required: true,
              admin: {
                description:
                  'HTML email body. Use {{variable}} for dynamic content (Handlebars syntax).',
              },
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BoldFeature(),
                    ItalicFeature(),
                    UnderlineFeature(),
                    LinkFeature({}),
                    ParagraphFeature(),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
            },
            {
              name: 'generateContentButton',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/collections/EmailTemplates/components#GenerateContentButton',
                },
              },
            },
          ],
        },
        {
          label: 'Variables',
          description:
            'Variables are automatically determined based on the trigger event you selected in the Settings tab. Click any variable to copy it to your clipboard.',
          fields: [
            {
              name: 'variablesList',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/fields/VariablesList#VariablesListField',
                },
              },
            },
          ],
        },
        {
          label: 'Settings',
          description: 'Template configuration and automation triggers',
          fields: [
            {
              name: 'automationTriggers',
              type: 'group',
              admin: {
                description: 'Configure when this template should be automatically sent',
              },
              fields: [
                {
                  name: 'triggerEvent',
                  type: 'select',
                  options: [
                    { label: 'None - Manual Only', value: 'none' },
                    { label: 'Participant Created', value: 'participant.created' },
                    { label: 'Participant Updated', value: 'participant.updated' },
                    { label: 'Partner Invited', value: 'partner.invited' },
                    { label: 'Event Published', value: 'event.published' },
                    { label: 'Form Submitted', value: 'form.submitted' },
                    { label: 'Custom Trigger', value: 'custom' },
                  ],
                  defaultValue: 'none',
                  admin: {
                    description: 'Select the event that triggers this email template',
                  },
                },
                {
                  name: 'statusFilter',
                  type: 'select',
                  hasMany: true,
                  admin: {
                    description:
                      'Only trigger for specific statuses (leave empty for all statuses)',
                    condition: (data, siblingData) =>
                      siblingData?.triggerEvent === 'participant.updated' ||
                      siblingData?.triggerEvent === 'partner.invited',
                  },
                  options: [
                    { label: 'Not Approved', value: 'not-approved' },
                    { label: 'Approved', value: 'approved' },
                    { label: 'Need More Information', value: 'need-info' },
                    { label: 'Cancelled', value: 'cancelled' },
                  ],
                },
                {
                  name: 'customTriggerName',
                  type: 'text',
                  admin: {
                    description: 'If "Custom Trigger" is selected, specify the trigger name',
                    condition: (data, siblingData) => siblingData?.triggerEvent === 'custom',
                  },
                },
                {
                  name: 'delayMinutes',
                  type: 'number',
                  min: 0,
                  admin: {
                    description: 'Delay in minutes before sending (0 for immediate)',
                  },
                  defaultValue: 0,
                },
                {
                  name: 'conditions',
                  type: 'textarea',
                  admin: {
                    description:
                      'Optional JSON conditions for when to send (e.g., {"fieldName": "value"})',
                    rows: 3,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
