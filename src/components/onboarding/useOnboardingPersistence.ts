'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const PREFIX = 'prevema:onboarding:'

export const ONBOARDING_KEYS = {
  currentStep: 'currentStep',
  state: 'state',
  org: {
    name: 'org.name',
  },
  event: {
    name: 'event.name',
    startDate: 'event.startDate',
    endDate: 'event.endDate',
    eventType: 'event.eventType',
    address: 'event.address',
    theme: 'event.theme',
    why: 'event.why',
    what: 'event.what',
    who: 'event.who',
    description: 'event.description',
    where: 'event.where',
  },
  guests: {
    participantName: 'guests.participantName',
    partnerName: 'guests.partnerName',
    participantFields: 'guests.participantFields',
    partnerFields: 'guests.partnerFields',
  },
  social: {
    option: 'social.option',
  },
} as const

const fullKey = (key: string) => `${PREFIX}${key}`

function readSession<T>(key: string, initial: T): T {
  if (typeof window === 'undefined') return initial
  try {
    const raw = window.sessionStorage.getItem(fullKey(key))
    if (raw === null) return initial
    return JSON.parse(raw) as T
  } catch {
    return initial
  }
}

function writeSession<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(fullKey(key), JSON.stringify(value))
  } catch {
    // ignore quota / serialization errors
  }
}

/**
 * useSessionState — useState backed by sessionStorage.
 * SSR-safe: initial render returns `initial`, then hydrates from storage on mount.
 */
export function useSessionState<T>(
  key: string,
  initial: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initial)
  const hydrated = useRef(false)

  // Hydrate from sessionStorage after mount (prevents hydration mismatch)
  useEffect(() => {
    const stored = readSession<T | undefined>(key, undefined as unknown as T)
    if (stored !== undefined) {
      setValue(stored)
    }
    hydrated.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist on change, only after hydration so we don't clobber stored value with `initial`
  useEffect(() => {
    if (!hydrated.current) return
    writeSession(key, value)
  }, [key, value])

  return [value, setValue]
}

/**
 * Clears all onboarding-related sessionStorage keys.
 * Call this when the onboarding flow is successfully completed.
 */
export function clearOnboardingSession(): void {
  if (typeof window === 'undefined') return
  try {
    const keys: string[] = []
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const k = window.sessionStorage.key(i)
      if (k && k.startsWith(PREFIX)) keys.push(k)
    }
    keys.forEach((k) => window.sessionStorage.removeItem(k))
  } catch {
    // ignore
  }
}

/**
 * Read a value from session storage synchronously (for initial setup outside React).
 */
export function readOnboardingSession<T>(key: string, fallback: T): T {
  return readSession(key, fallback)
}

/**
 * Write a value to session storage synchronously.
 */
export function writeOnboardingSession<T>(key: string, value: T): void {
  writeSession(key, value)
}

/**
 * Returns a stable callback that writes to sessionStorage. Useful when wiring
 * onChange handlers that should immediately persist (e.g. flush before navigation).
 */
export function useOnboardingWriter() {
  return useCallback(<T>(key: string, value: T) => writeSession(key, value), [])
}
