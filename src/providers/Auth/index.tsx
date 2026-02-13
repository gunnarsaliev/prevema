'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

import type { User } from '@/payload-types'
import { getClientSideURL } from '@/utils/getURL'

type AuthStatus = 'loggedIn' | 'loggedOut'

type AuthContextType = {
  user: User | null
  status: AuthStatus | undefined
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  status: undefined,
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus | undefined>(undefined)

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch(`${getClientSideURL()}/api/users/me`, {
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        if (data?.user) {
          setUser(data.user)
          setStatus('loggedIn')
          return
        }
      }
    } catch {
      // network error — fall through to loggedOut
    }

    setUser(null)
    setStatus('loggedOut')
  }, [])

  useEffect(() => {
    void fetchMe()
  }, [fetchMe])

  return (
    <AuthContext.Provider value={{ user, status, refreshUser: fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  return useContext(AuthContext)
}
