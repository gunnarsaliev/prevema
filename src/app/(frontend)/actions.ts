'use server'

import { login, logout } from '@payloadcms/next/auth'
import config from '@/payload.config'

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
