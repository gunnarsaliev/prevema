'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { registerAction } from '../actions'
import { useAuth } from '@/providers/Auth'

export function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { refreshUser } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)

    try {
      const result = await registerAction({ email, password, name })

      if (result.success) {
        await refreshUser()
        router.push('/dash')
        router.refresh()
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className={cn('h-screen bg-muted')}>
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-6 lg:justify-start">
          {/* Logo */}
          <a href="/">
            <img
              src="https://asset.cooksa.com/prevema.svg"
              alt="Prevema Logo"
              title="Prevema"
              className="h-10 dark:invert"
            />
          </a>
          <form onSubmit={handleSubmit}>
            <div className="flex w-full max-w-sm min-w-sm flex-col items-center gap-y-4 rounded-md border border-muted bg-background px-6 py-8 shadow-md">
              <h1 className="text-xl font-semibold">Create Account</h1>

              {error && (
                <div className="w-full bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md border border-destructive/20">
                  {error}
                </div>
              )}

              <Input
                type="text"
                placeholder="Name"
                className="text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />

              <Input
                type="email"
                placeholder="Email"
                className="text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />

              <Input
                type="password"
                placeholder="Password"
                className="text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />

              <Input
                type="password"
                placeholder="Confirm Password"
                className="text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </div>
          </form>

          <div className="flex justify-center gap-1 text-sm text-muted-foreground">
            <p>Already a user?</p>
            <a href="/login" className="font-medium text-primary hover:underline">
              Login
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
