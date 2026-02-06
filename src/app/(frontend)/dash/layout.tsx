import { AuthWrapper } from './auth-wrapper'
import { DashClientLayout } from './client-layout'

/**
 * Server-side layout for /dash routes
 * Wraps client layout with authentication check
 */
export default async function DashLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper>
      <DashClientLayout>{children}</DashClientLayout>
    </AuthWrapper>
  )
}
