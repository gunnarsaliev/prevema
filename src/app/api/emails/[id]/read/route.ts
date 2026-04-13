import { headers as getHeaders } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const headers = await getHeaders()
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const emailId = parseInt(id, 10)
    if (isNaN(emailId)) {
      return NextResponse.json({ error: 'Invalid email ID' }, { status: 400 })
    }

    // Update the email's read status
    const updatedEmail = await payload.update({
      collection: 'email-logs',
      id: emailId,
      data: {
        read: true,
      },
      overrideAccess: false,
      user,
    })

    return NextResponse.json({ success: true, email: updatedEmail })
  } catch (error) {
    console.error('Error marking email as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark email as read' },
      { status: 500 }
    )
  }
}
