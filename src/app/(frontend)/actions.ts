'use server'

import { login, logout } from '@payloadcms/next/auth'
import config from '@/payload.config'
import { getPayload } from 'payload'

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
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
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
