import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/team/invitations/resend
 * Reset expiry and re-send invitation email.
 * Body: { invitationId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const authResult = await payload.auth({ headers: req.headers })
    if (!authResult?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = authResult.user
    const body = await req.json()
    const { invitationId } = body

    if (!invitationId) {
      return NextResponse.json({ error: 'invitationId is required' }, { status: 400 })
    }

    let invitation
    try {
      invitation = await payload.findByID({
        collection: 'invitations',
        id: invitationId,
        depth: 1,
      })
    } catch {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending invitations can be resent' },
        { status: 400 },
      )
    }

    const orgId =
      typeof invitation.organization === 'object'
        ? invitation.organization.id
        : invitation.organization

    const callerMembership = await payload.find({
      collection: 'members',
      where: {
        and: [
          { user: { equals: user.id } },
          { organization: { equals: orgId } },
          { or: [{ role: { equals: 'owner' } }, { role: { equals: 'admin' } }] },
        ],
      },
      limit: 1,
      depth: 0,
    })
    if (callerMembership.docs.length === 0) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Reset expiry to 7 days from now.
    // The Invitations afterChange hook fires on 'create' only, so we send the email manually.
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await payload.update({
      collection: 'invitations',
      id: invitationId,
      data: { expiresAt: expiresAt.toISOString() },
    })

    const orgName =
      typeof invitation.organization === 'object' && 'name' in invitation.organization
        ? (invitation.organization as any).name
        : 'your organization'

    const inviteUrl = `${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/accept-invitation?token=${invitation.token}`

    await payload.sendEmail({
      to: invitation.email,
      subject: `Reminder: You've been invited to join ${orgName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
            <h1 style="color: #2c3e50; margin-top: 0;">Invitation Reminder</h1>
            <p style="font-size: 16px; color: #555;">
              You have a pending invitation to join <strong>${orgName}</strong>.
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" style="display: inline-block; background-color: #0066cc; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Accept Invitation
            </a>
          </div>
          <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 15px; margin-top: 20px;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              ⏰ <strong>Note:</strong> This invitation expires on ${expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
            </p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e4e8; font-size: 12px; color: #6c757d; text-align: center;">
            <p>If the button doesn't work, copy and paste this link:</p>
            <p style="word-break: break-all; color: #0066cc;">${inviteUrl}</p>
          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error resending invitation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to resend invitation' },
      { status: 500 },
    )
  }
}
