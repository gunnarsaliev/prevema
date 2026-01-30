import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { sendTestEmail, generateSampleVariables } from '@/services/emailTesting'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Get request body
    const body = await request.json() as { templateId: string; tenantId: string; testEmail: string }
    const { templateId, tenantId, testEmail } = body

    if (!templateId || !tenantId || !testEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: templateId, tenantId, testEmail' },
        { status: 400 },
      )
    }

    // Get the current user from the request
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access to this organization
    const organization = await payload.findByID({
      collection: 'organizations',
      id: tenantId,
    })

    if (!organization) {
      return NextResponse.json({ success: false, error: 'Organization not found' }, { status: 404 })
    }

    // Check if user is a member of this organization
    const members = (organization as any).members || []
    const isMember = members.some((member: any) => {
      const userId = typeof member.user === 'object' ? member.user?.id : member.user
      return userId === user.id
    })

    if (!isMember && !user.roles?.includes('super-admin') && !user.roles?.includes('admin')) {
      return NextResponse.json(
        { success: false, error: 'You do not have access to this organization' },
        { status: 403 },
      )
    }

    // Generate sample variables for the template
    const template = await payload.findByID({
      collection: 'email-templates',
      id: templateId,
    })

    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 })
    }

    // Generate sample variables by extracting from template content
    const sampleVariables = generateSampleVariables(template)

    // Override email variable with actual test email
    if (sampleVariables.email) {
      sampleVariables.email = testEmail
    }

    // Override organization name if available
    if (sampleVariables.tenantName && typeof organization === 'object') {
      sampleVariables.tenantName = organization.name
    }

    // Send test email
    const result = await sendTestEmail({
      payload,
      tenantId,
      templateId,
      testEmail,
      testVariables: sampleVariables,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Test email error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    )
  }
}
