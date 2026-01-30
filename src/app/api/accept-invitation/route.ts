import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { acceptInvitation, declineInvitation } from '@/collections/Invitations/hooks/acceptInvitation'

/**
 * POST /api/accept-invitation
 * Accept an invitation to join an organization
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await req.json() as { token: string; action?: 'accept' | 'decline' }
    const { token, action } = body

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Get the current user from the request
    const user = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 })
    }

    // Create a mock PayloadRequest object
    const payloadReq = {
      payload,
      user: user.user,
      headers: req.headers,
    } as any

    let result
    if (action === 'decline') {
      result = await declineInvitation(token, payloadReq)
    } else {
      result = await acceptInvitation(token, payloadReq)
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error processing invitation:', error)
    return NextResponse.json({ error: error.message || 'Failed to process invitation' }, { status: 400 })
  }
}

/**
 * GET /api/accept-invitation?token=xxx
 * Get invitation details
 */
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const token = req.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Check if user is authenticated
    const authResult = await payload.auth({ headers: req.headers })
    const isAuthenticated = !!authResult?.user
    const currentUserEmail = authResult?.user?.email

    // Find the invitation
    const invitations = await payload.find({
      collection: 'invitations',
      where: {
        token: {
          equals: token,
        },
      },
      depth: 2, // Populate relationships (tenant, invitedBy)
      limit: 1,
    })

    if (invitations.docs.length === 0) {
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 404 })
    }

    const invitation = invitations.docs[0]

    console.log('📋 Invitation data:', {
      email: invitation.email,
      organization: invitation.team,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      isAuthenticated,
      currentUserEmail,
    })

    // Check if expired
    const now = new Date()
    const expiresAt = new Date(invitation.expiresAt)
    const isExpired = now > expiresAt

    // Check if invitation email matches current user (if logged in)
    const emailMismatch = isAuthenticated && currentUserEmail !== invitation.email

    return NextResponse.json({
      email: invitation.email,
      tenant: invitation.team,  // Keep 'tenant' in response for backwards compatibility with frontend
      role: invitation.role,
      status: isExpired ? 'expired' : invitation.status,
      expiresAt: invitation.expiresAt,
      isAuthenticated,
      currentUserEmail,
      emailMismatch,
    })
  } catch (error: any) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch invitation' }, { status: 400 })
  }
}
