import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      firstName: string
      lastName: string
      email: string
      subject: string
      message: string
    }

    const { firstName, lastName, email, subject, message } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Create HTML email content
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #6A1B9A; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 10px 0;">
            <strong>Name:</strong> ${firstName} ${lastName}
          </p>
          <p style="margin: 10px 0;">
            <strong>Email:</strong> <a href="mailto:${email}">${email}</a>
          </p>
          <p style="margin: 10px 0;">
            <strong>Subject:</strong> ${subject}
          </p>
        </div>

        <div style="background-color: #fff; padding: 20px; border-left: 4px solid #6A1B9A; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Message:</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p>This email was sent from the Prevema contact form at ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `

    // Send email using Payload's email system
    await payload.sendEmail({
      to: 'info@prevema.com',
      subject: `Contact Form: ${subject}`,
      html,
      replyTo: email,
    })

    console.log(`✅ Contact form email sent from ${email}`)

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully!',
    })
  } catch (error) {
    console.error('❌ Error in contact form API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: 'Failed to send message. Please try again later.' },
      { status: 500 },
    )
  }
}
