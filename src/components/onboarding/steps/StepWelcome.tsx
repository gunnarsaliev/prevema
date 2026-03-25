'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Rocket, Building2, Calendar, Users, Mail, Palette, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createDefaultOrganizationAction } from '@/app/(frontend)/onboarding/actions'

interface StepWelcomeProps {
  onNext?: () => void
}

const steps = [
  { icon: Building2, label: 'Create your organization' },
  { icon: Calendar, label: 'Set up your first event' },
  { icon: Users, label: 'Add guest registration forms' },
  { icon: Mail, label: 'Configure email templates' },
  { icon: Palette, label: 'Design social post images' },
]

export const StepWelcome = ({ onNext }: StepWelcomeProps) => {
  const router = useRouter()
  const [isSkipping, setIsSkipping] = useState(false)

  const handleSkip = async () => {
    setIsSkipping(true)
    try {
      await createDefaultOrganizationAction()
    } catch {
      // Continue to redirect even if org creation fails
    }
    router.push('/dash/events')
  }

  return (
    <div className="flex min-h-[40.5dvh] w-full flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm text-center">
        <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-5">
          <Rocket className="h-10 w-10 text-primary" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Here's what we'll set up</h3>
        </div>

        <ul className="w-full space-y-2 text-left">
          {steps.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm text-muted-foreground">
              <Icon className="h-4 w-4 shrink-0 text-primary/70" />
              {label}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 w-full pt-2">
          <Button className="w-full" onClick={onNext}>
            Get Started
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={handleSkip}
            disabled={isSkipping}
          >
            {isSkipping ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Setting up…
              </>
            ) : (
              'Skip for now'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
