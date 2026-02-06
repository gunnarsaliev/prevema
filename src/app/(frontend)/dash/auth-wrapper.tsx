import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { validateEventAccess } from '@/utils/validateEventAccess'

/**
 * Server-side authentication wrapper for /dash routes
 * Checks PayloadCMS session and validates eventId belongs to user's organizations
 */
export async function AuthWrapper({ children }: { children: React.ReactNode }) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Check authentication
  const { user } = await payload.auth({ headers })

  // Redirect to admin login if not authenticated
  if (!user) {
    redirect('/admin/login')
  }

  // Validate eventId if present in URL
  const headersList = await getHeaders()
  const referer = headersList.get('referer') || headersList.get('x-url') || ''

  if (referer) {
    try {
      const url = new URL(referer)
      const eventId = url.searchParams.get('eventId')

      // If eventId exists, validate it belongs to user's organizations
      if (eventId) {
        const isValid = await validateEventAccess(payload, user, eventId)

        if (!isValid) {
          // Remove invalid eventId from URL
          url.searchParams.delete('eventId')
          const newUrl = `${url.pathname}${url.search}`
          redirect(newUrl)
        }
      }
    } catch (error) {
      // URL parsing failed, continue without validation
      console.error('[AuthWrapper] URL parsing error:', error)
    }
  }

  // User is authenticated and eventId is valid (if present)
  return <>{children}</>
}
