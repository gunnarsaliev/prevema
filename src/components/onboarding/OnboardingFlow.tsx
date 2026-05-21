'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Calendar, Users, Palette } from 'lucide-react'
import { Onboarding2 } from '@/components/onboarding2'
import { StepWelcome } from './steps/StepWelcome'
import { StepOrganization } from './steps/StepOrganization'
import { StepEvent } from './steps/StepEvent'
import { StepGuests } from './steps/StepGuests'
import { StepSocialPost } from './steps/StepSocialPost'
import { type OnboardingState, initialOnboardingState } from '@/types/onboarding'
import { Button } from '@/components/ui/button'
import {
  ONBOARDING_KEYS,
  clearOnboardingSession,
  readOnboardingSession,
  writeOnboardingSession,
} from './useOnboardingPersistence'

export const OnboardingFlow = () => {
  const router = useRouter()
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(initialOnboardingState)
  const [currentStep, setCurrentStep] = useState(0)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate persisted state from sessionStorage on mount
  useEffect(() => {
    const persistedState = readOnboardingSession<OnboardingState | null>(
      ONBOARDING_KEYS.state,
      null,
    )
    const persistedStep = readOnboardingSession<number>(ONBOARDING_KEYS.currentStep, 0)
    if (persistedState) {
      setOnboardingState(persistedState)
    }
    if (typeof persistedStep === 'number' && persistedStep >= 0) {
      setCurrentStep(persistedStep)
    }
    setHydrated(true)
  }, [])

  // Persist state changes
  useEffect(() => {
    if (!hydrated) return
    writeOnboardingSession(ONBOARDING_KEYS.state, onboardingState)
  }, [onboardingState, hydrated])

  useEffect(() => {
    if (!hydrated) return
    writeOnboardingSession(ONBOARDING_KEYS.currentStep, currentStep)
  }, [currentStep, hydrated])

  const updateOnboardingState = useCallback((updates: Partial<OnboardingState>) => {
    setOnboardingState((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleComplete = useCallback(() => {
    clearOnboardingSession()
  }, [])

  const { organizationId, organizationName, eventId } = onboardingState

  // Define step configurations — memoized so component function references stay stable
  // across renders (new references cause React to unmount+remount, triggering infinite loops)
  const steps = useMemo(
    () => [
      {
        title: 'Prepare your event in few easy steps',
        description: 'You can do it now or skip and get back to it later',
        className: 'bg-indigo-100 dark:bg-indigo-950/40',
        component: (props: any) => <StepWelcome {...props} />,
        isBlocking: false,
        cta: (): ReactNode => null,
      },
      {
        title: 'Create your organization',
        description: 'Set up your organization profile to get started (or skip and do it later)',
        className: 'bg-blue-100 dark:bg-blue-950/40',
        component: (props: any) => (
          <StepOrganization
            {...props}
            onOrganizationCreated={(id, name) => {
              updateOnboardingState({
                organizationId: id,
                organizationName: name,
              })
            }}
          />
        ),
        isBlocking: false, // User can skip
        cta: (): ReactNode => null, // Hide default Next button - StepOrganization has its own buttons
      },
      {
        title: 'Create your event',
        description: organizationName
          ? `Let's create your first event for ${organizationName} (or skip for now)`
          : 'Define the basics of your event (or skip and do it later)',
        className: 'bg-purple-100 dark:bg-purple-950/40',
        component: (props: any) =>
          organizationId ? (
            <StepEvent
              {...props}
              organizationId={organizationId}
              eventId={eventId}
              onEventCreated={(id, name) => {
                updateOnboardingState({
                  eventId: id,
                  eventName: name,
                })
              }}
            />
          ) : (
            <div className="flex min-h-[40.5dvh] w-full flex-col items-center justify-center p-4">
              <div className="text-center space-y-4">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground max-w-md">
                  You need to create an organization first before creating an event. Go back to step
                  1 or skip this step.
                </p>
                <Button onClick={props.onNext} variant="outline">
                  Skip this step
                </Button>
              </div>
            </div>
          ),
        isBlocking: false, // User can skip
        cta: (): ReactNode => null, // Hide default Next button - StepEvent has its own buttons
      },
      {
        title: 'Add event guest forms',
        description: [
          {
            icon: Users,
            title: 'Create participant and partner types for your event',
          },
          {
            icon: Building2,
            title: 'Get shareable registration links instantly',
          },
          {
            icon: Calendar,
            title: 'You can skip this step and configure later',
          },
        ],
        className: 'bg-green-100 dark:bg-green-950/40',
        component: (props: any) =>
          organizationId && eventId ? (
            <StepGuests
              {...props}
              organizationId={organizationId}
              eventId={eventId}
              onGuestsConfigured={(participantRoleIds, partnerTypeIds) => {
                updateOnboardingState({
                  participantRoleIds,
                  partnerTypeIds,
                })
              }}
            />
          ) : (
            <div className="flex min-h-[40.5dvh] w-full flex-col items-center justify-center p-4">
              <div className="text-center space-y-4">
                <Users className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground max-w-md">
                  You need to create an organization and event first. Go back to previous steps or
                  skip.
                </p>
                <Button onClick={props.onNext} variant="outline">
                  Skip this step
                </Button>
              </div>
            </div>
          ),
        isBlocking: false, // Not blocking - user can skip
        cta: (): ReactNode => null, // Hide default Next button - StepGuests has its own buttons
      },
      {
        title: 'Social post design',
        description: 'Choose how you want to create social media images for your guests',
        className: 'bg-pink-100 dark:bg-pink-950/40',
        component: (props: any) =>
          organizationId ? (
            <StepSocialPost
              {...props}
              organizationId={organizationId}
              onPreferenceSelected={(preference) => {
                updateOnboardingState({
                  socialPostOption: preference,
                })
              }}
              onComplete={handleComplete}
            />
          ) : (
            <div className="flex min-h-[40.5dvh] w-full flex-col items-center justify-center p-4">
              <div className="text-center space-y-4">
                <Palette className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground max-w-md">
                  You need to create an organization first. Go back to step 1 or complete the
                  onboarding.
                </p>
                <Button
                  onClick={() => {
                    handleComplete()
                    if (eventId) {
                      router.push(`/dash/events/${eventId}`)
                    } else {
                      router.push('/dash/events')
                    }
                  }}
                  variant="outline"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          ),
        isBlocking: false, // Not blocking - user can skip
        cta: (): ReactNode => null, // Hide default Next button - StepSocialPost has its own buttons
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ],
    [organizationId, organizationName, eventId, updateOnboardingState, handleComplete, router],
  )

  return <Onboarding2 steps={steps} currentStep={currentStep} onStepChange={setCurrentStep} />
}
