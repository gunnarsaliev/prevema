'use server'

import { login, logout } from '@payloadcms/next/auth'
import config from '@/payload.config'
import { getPayload } from 'payload'

/**
 * Parse Payload errors to provide user-friendly error messages
 * Specifically handles duplicate email errors and validation errors
 */
function parseRegistrationError(err: unknown): string {
  if (!(err instanceof Error)) return 'Registration failed'

  const msg = err.message

  // Check for "The following field is invalid: email" message
  if (msg.toLowerCase().includes('field is invalid') && msg.toLowerCase().includes('email')) {
    return 'This email address is already registered. Please use a different email or try logging in.'
  }

  // Check for duplicate email error (Postgres unique constraint)
  if (msg.toLowerCase().includes('unique') && msg.toLowerCase().includes('email')) {
    return 'This email address is already registered. Please use a different email or try logging in.'
  }

  // Check for duplicate key error
  if (msg.toLowerCase().includes('duplicate') && msg.toLowerCase().includes('email')) {
    return 'This email address is already registered. Please use a different email or try logging in.'
  }

  // Check for "already in use" or "already exists" messages
  if ((msg.toLowerCase().includes('already') && msg.toLowerCase().includes('email')) ||
      msg.toLowerCase().includes('email already')) {
    return 'This email address is already registered. Please use a different email or try logging in.'
  }

  // Payload validation errors are sometimes nested as JSON in the message
  try {
    const parsed = JSON.parse(msg) as {
      errors?: Array<{
        message?: string
        field?: string
      }>
    }
    if (parsed.errors?.length) {
      // Check for email-specific errors
      const emailErr = parsed.errors.find((e) =>
        e.message?.toLowerCase().includes('email') ||
        e.field?.toLowerCase().includes('email')
      )
      if (emailErr?.message?.toLowerCase().includes('unique') ||
          emailErr?.message?.toLowerCase().includes('already') ||
          emailErr?.message?.toLowerCase().includes('invalid')) {
        return 'This email address is already registered. Please use a different email or try logging in.'
      }
      // Return all validation errors
      return parsed.errors.map((e) => e.message ?? 'Unknown error').join(', ')
    }
  } catch {
    // not JSON — fall through
  }

  // Return the original message if we can't parse it better
  return msg
}

export async function registerAction({
  email,
  password,
  name,
}: {
  email: string
  password: string
  name: string
}) {
  try {
    const payload = await getPayload({ config })

    // Create the user
    const user = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        name,
      },
    })

    // Create a default organization for the new user
    // This ensures they can access the dashboard immediately
    try {
      await payload.create({
        collection: 'organizations',
        data: {
          name: `${name || email}'s Organization`,
          owner: user.id,
        },
        overrideAccess: true,
      })
    } catch (orgError) {
      // Log but don't fail registration if organization creation fails
      console.error('Failed to create default organization:', orgError)
    }

    // Automatically log in the user after registration
    const loginResult = await login({
      collection: 'users',
      config,
      email,
      password,
    })

    return { success: true, user: loginResult.user }
  } catch (error) {
    // Log the full error for debugging
    console.error('Registration error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error name:', error.name)
    }

    return {
      success: false,
      error: parseRegistrationError(error),
    }
  }
}

export async function loginAction({ email, password }: { email: string; password: string }) {
  try {
    const result = await login({
      collection: 'users',
      config,
      email,
      password,
    })
    return { success: true, user: result.user }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    }
  }
}

export async function logoutAction() {
  try {
    await logout({ allSessions: true, config })
  } catch (error) {
    throw new Error(
      `Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}
