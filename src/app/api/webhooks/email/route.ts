import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Webhook endpoint for receiving email events from Resend
 * POST /api/webhooks/email
 *
 * Handles:
 * - Inbound emails (email.received)
 * - Delivery status updates (email.delivered, email.bounced, email.complained, email.opened, email.clicked)
 *
 * Setup in Resend Dashboard:
 * 1. Go to Domains page and enable "Receiving" for your domain
 * 2. Add the MX record shown to your DNS provider
 * 3. Go to Webhooks page
 * 4. Add endpoint: https://your-domain.com/api/webhooks/email
 * 5. Select events: email.received, email.delivered, email.bounced, email.complained, email.opened, email.clicked
 * 6. Copy the signing secret to RESEND_WEBHOOK_SECRET env var
 *
 * Required env vars:
 * - RESEND_API_KEY: Your Resend API key (to fetch email content)
 * - RESEND_WEBHOOK_SECRET: Webhook signing secret (optional but recommended)
 */

interface ResendWebhookPayload {
  type: string
  created_at: string
  data: {
    email_id?: string
    from?: string
    to?: string[]
    cc?: string[]
    bcc?: string[]
    message_id?: string
    subject?: string
    attachments?: Array<{
      id: string
      filename: string
      content_type: string
      content_disposition?: string
      content_id?: string
    }>
    [key: string]: unknown
  }
}

interface ResendEmailContent {
  id: string
  from: string
  to: string
  cc?: string | null
  bcc?: string | null
  subject: string
  createdAt: string
  text?: string | null
  html?: string | null
  headers?: Record<string, string>
}

interface ResendAttachment {
  filename: string
  content_type: string
  content_length: number
  content_id?: string | null
  expires_at: string
  download_url: string
}

function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature || !secret) return false

  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex')

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

export async function POST(request: Request) {
  try {
    const payloadCms = await getPayload({ config })
    const rawBody = await request.text()

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = request.headers.get('resend-signature')
      if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
        console.error('❌ Invalid webhook signature')
        return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 })
      }
    }

    const webhookPayload: ResendWebhookPayload = JSON.parse(rawBody)
    const { type, data } = webhookPayload

    console.log(`📧 Received webhook event: ${type}`)

    switch (type) {
      case 'email.received': {
        // Handle inbound email
        // The webhook only contains metadata - we need to fetch the full content via API
        const emailId = data.email_id
        if (!emailId) {
          console.error('❌ No email_id in webhook payload')
          return NextResponse.json({ success: false, error: 'Missing email_id' }, { status: 400 })
        }

        const fromEmail = data.from || ''
        const toEmails = data.to || []
        const toEmail = toEmails[0] || ''

        // Try to match organization by recipient email domain
        let organizationId: number | undefined
        const emailDomain = toEmail.split('@')[1]
        if (emailDomain) {
          const orgs = await payloadCms.find({
            collection: 'organizations',
            where: {
              or: [
                { 'emailConfig.fromEmail': { contains: emailDomain } },
                { name: { contains: emailDomain.split('.')[0] } },
              ],
            },
            limit: 1,
          })
          if (orgs.docs.length > 0) {
            organizationId = orgs.docs[0].id
          }
        }

        // Fetch full email content using Resend API
        let htmlContent: string | undefined
        let textContent: string | undefined
        let headers: Record<string, string> | undefined
        let attachmentsList: Array<{
          filename: string
          contentType: string | null
          size: number | null
          url: string | null
        }> = []

        const resendApiKey = process.env.RESEND_API_KEY
        if (resendApiKey) {
          try {
            // Fetch email content (html, text, headers)
            // Use the receiving API endpoint to get full email content
            const emailContentResponse = await fetch(`https://api.resend.com/emails/${emailId}`, {
              headers: {
                Authorization: `Bearer ${resendApiKey}`,
              },
            })
            if (emailContentResponse.ok) {
              const emailData = (await emailContentResponse.json()) as ResendEmailContent
              htmlContent = emailData.html || undefined
              textContent = emailData.text || undefined
              headers = emailData.headers
            }

            // Fetch attachments list with download URLs
            // Note: Resend SDK may not have this method yet, using fetch as fallback
            if (data.attachments && data.attachments.length > 0) {
              try {
                const attachmentsResponse = await fetch(
                  `https://api.resend.com/emails/${emailId}/attachments`,
                  {
                    headers: {
                      Authorization: `Bearer ${resendApiKey}`,
                    },
                  },
                )
                if (attachmentsResponse.ok) {
                  const attachmentsData = (await attachmentsResponse.json()) as {
                    data: ResendAttachment[]
                  }
                  attachmentsList = attachmentsData.data.map((att) => ({
                    filename: att.filename,
                    contentType: att.content_type,
                    size: att.content_length,
                    url: att.download_url,
                  }))
                }
              } catch (attError) {
                console.warn('⚠️ Could not fetch attachments:', attError)
                // Fall back to webhook attachment metadata (without download URLs)
                attachmentsList = data.attachments.map((att) => ({
                  filename: att.filename,
                  contentType: att.content_type,
                  size: null,
                  url: null,
                }))
              }
            }
          } catch (apiError) {
            console.warn('⚠️ Could not fetch email content from Resend API:', apiError)
          }
        }

        await payloadCms.create({
          collection: 'email-logs',
          data: {
            direction: 'inbound',
            organization: organizationId,
            subject: data.subject || '(No Subject)',
            fromEmail,
            toEmail,
            ccEmails: data.cc?.join(', '),
            htmlContent,
            textContent,
            status: 'received',
            sentAt: new Date().toISOString(),
            messageId: emailId,
            inReplyTo: headers?.['in-reply-to'],
            attachments: attachmentsList.length > 0 ? attachmentsList : undefined,
            metadata: {
              headers,
              bcc: data.bcc,
              message_id: data.message_id,
              rawEventType: type,
            },
          },
        })

        console.log(`✅ Inbound email logged from ${fromEmail} to ${toEmail}`)
        break
      }

      case 'email.delivered':
      case 'email.bounced':
      case 'email.complained':
      case 'email.opened':
      case 'email.clicked': {
        // Update existing email log with delivery status
        const messageId = data.email_id
        if (!messageId) {
          console.warn('⚠️ No email_id in delivery event')
          break
        }

        // Find the email log by messageId
        const existingLogs = await payloadCms.find({
          collection: 'email-logs',
          where: {
            messageId: { equals: messageId },
          },
          limit: 1,
        })

        if (existingLogs.docs.length > 0) {
          const statusMap: Record<string, string> = {
            'email.delivered': 'delivered',
            'email.bounced': 'bounced',
            'email.complained': 'complained',
            'email.opened': 'opened',
            'email.clicked': 'clicked',
          }

          // Note: EmailLogs are immutable, so we create a new log entry for status updates
          // This preserves the audit trail
          console.log(`📊 Email ${messageId} status: ${statusMap[type]}`)

          // Optionally, you could update the existing record if you change the access control
          // For now, just log the status change
        } else {
          console.warn(`⚠️ No email log found for messageId: ${messageId}`)
        }
        break
      }

      default:
        console.log(`ℹ️ Unhandled webhook event type: ${type}`)
    }

    return NextResponse.json({ success: true, received: type })
  } catch (error) {
    console.error('❌ Error processing email webhook:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

// Handle webhook verification (GET request)
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Email webhook endpoint is active',
  })
}
