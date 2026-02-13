'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

export const dynamic = 'force-dynamic'

interface InvitationData {
  email: string
  tenant: any
  role: string
  status: string
  expiresAt: string
}

interface ApiResponse {
  error?: string
  email?: string
  tenant?: any
  role?: string
  status?: string
  expiresAt?: string
  isAuthenticated?: boolean
  currentUserEmail?: string
  emailMismatch?: boolean
}

function AcceptInvitationContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided')
      setLoading(false)
      return
    }

    // Fetch invitation details
    fetch(`/api/accept-invitation?token=${token}`)
      .then((res) => res.json())
      .then(async (data: ApiResponse) => {
        console.log('📨 Received invitation data:', data)
        if (data.error) {
          setError(data.error)
          setLoading(false)
          return
        }

        // Check if user is authenticated
        if (!data.isAuthenticated) {
          console.log('🔐 User not authenticated, redirecting to create account...')
          // Redirect to create account page with invitation token
          window.location.href = `/create-account?invitation=${token}&email=${encodeURIComponent(data.email || '')}`
          return
        }

        // Check if logged-in user's email matches invitation email
        if (data.emailMismatch) {
          setError(`This invitation was sent to ${data.email}, but you are logged in as ${data.currentUserEmail}. Please log out and log in with the correct account.`)
          setLoading(false)
          return
        }

        // If user is authenticated and email matches, auto-accept if invitation is pending
        if (data.status === 'pending') {
          console.log('✅ User authenticated and email matches, auto-accepting invitation...')
          setProcessing(true)

          try {
            const acceptRes = await fetch('/api/accept-invitation', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token, action: 'accept' }),
            })

            const acceptData: ApiResponse = await acceptRes.json()

            if (acceptData.error) {
              setError(acceptData.error)
              setLoading(false)
              setProcessing(false)
            } else {
              console.log('🎉 Invitation accepted successfully, redirecting to dashboard...')
              setSuccess(true)
              setLoading(false)
              // Auto-redirect to dashboard after 2 seconds
              setTimeout(() => {
                window.location.href = '/admin'
              }, 2000)
            }
          } catch (err) {
            console.error('❌ Failed to auto-accept invitation:', err)
            setError('Failed to accept invitation')
            setLoading(false)
            setProcessing(false)
          }
        } else {
          // Invitation is not pending (already accepted, declined, or expired)
          setInvitation(data as InvitationData)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('❌ Failed to fetch invitation:', err)
        setError('Failed to load invitation')
        setLoading(false)
      })
  }, [token])

  const handleAccept = async () => {
    setProcessing(true)
    setError(null)

    try {
      const res = await fetch('/api/accept-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, action: 'accept' }),
      })

      const data: ApiResponse = await res.json()

      if (data.error) {
        setError(data.error)
        setProcessing(false)
      } else {
        setSuccess(true)
        // Auto-redirect to dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = '/admin'
        }, 2000)
      }
    } catch (err) {
      setError('Failed to accept invitation')
      setProcessing(false)
    }
  }

  const handleDecline = async () => {
    setProcessing(true)
    setError(null)

    try {
      const res = await fetch('/api/accept-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, action: 'decline' }),
      })

      const data: ApiResponse = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Failed to decline invitation')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Success!</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Invitation accepted successfully.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Redirecting to dashboard...</p>
          <a
            href="/admin"
            className="inline-block bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Go to Dashboard Now
          </a>
        </div>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error || 'This invitation is not valid.'}</p>
          <a
            href="/"
            className="inline-block bg-gray-600 dark:bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    )
  }

  const tenantName = typeof invitation.tenant === 'object' && invitation.tenant?.name 
    ? invitation.tenant.name 
    : 'Unknown Tenant'
  const isExpired = invitation.status === 'expired'
  const isPending = invitation.status === 'pending'
  const roleDisplay = invitation.role?.replace('-', ' ') || 'User'
  const expiresDate = invitation.expiresAt 
    ? new Date(invitation.expiresAt).toLocaleDateString() 
    : 'Unknown'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tenant Invitation</h1>
          <p className="text-gray-600 dark:text-gray-300">You've been invited to join a tenant</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tenant</p>
              <p className="font-semibold text-gray-900 dark:text-white">{tenantName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
              <p className="font-semibold text-gray-900 dark:text-white capitalize">{roleDisplay}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-semibold text-gray-900 dark:text-white">{invitation.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expires</p>
              <p className="font-semibold text-gray-900 dark:text-white">{expiresDate}</p>
            </div>
          </div>
        </div>

        {isExpired && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-400 text-sm">This invitation has expired.</p>
          </div>
        )}

        {!isPending && !isExpired && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 dark:text-yellow-400 text-sm">
              This invitation has already been {invitation.status}.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {isPending && !isExpired && (
          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              disabled={processing}
              className="flex-1 bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {processing ? 'Processing...' : 'Accept'}
            </button>
            <button
              onClick={handleDecline}
              disabled={processing}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Decline
            </button>
          </div>
        )}

        {(!isPending || isExpired) && (
          <a
            href="/admin"
            className="block text-center bg-gray-600 dark:bg-gray-700 text-white px-6 py-3 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Go to Dashboard
          </a>
        )}
      </div>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  )
}
