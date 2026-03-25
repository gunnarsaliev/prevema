'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Calendar, Users, Mail, Palette } from 'lucide-react'
import { Onboarding2 } from '@/components/onboarding2'
import { StepWelcome } from './steps/StepWelcome'
import { StepOrganization } from './steps/StepOrganization'
import { StepEvent } from './steps/StepEvent'
import { StepGuests } from './steps/StepGuests'
import { StepEmailTemplate } from './steps/StepEmailTemplate'
import { StepSocialPost } from './steps/StepSocialPost'
import { type OnboardingState, initialOnboardingState } from '@/types/onboarding'
import { Button } from '@/components/ui/button'

export const OnboardingFlow = () => {
  const router = useRouter()
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(initialOnboardingState)

  const updateOnboardingState = (updates: Partial<OnboardingState>) => {
    setOnboardingState((prev) => ({ ...prev, ...updates }))
  }

  // Define step configurations
  const steps = [
    {
      title: 'Prepare your event in few easy steps',
      description: 'You can do it now or skip and get back to it later',
      className: 'bg-indigo-100 dark:bg-indigo-950/40',
      component: (props: any) => <StepWelcome {...props} />,
      isBlocking: false,
      cta: () => null,
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
      cta: () => null, // Hide default Next button - StepOrganization has its own buttons
    },
    {
      title: 'Create your event',
      description: onboardingState.organizationName
        ? `Let's create your first event for ${onboardingState.organizationName} (or skip for now)`
        : 'Define the basics of your event (or skip and do it later)',
      className: 'bg-purple-100 dark:bg-purple-950/40',
      component: (props: any) =>
        onboardingState.organizationId ? (
          <StepEvent
            {...props}
            organizationId={onboardingState.organizationId}
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
                You need to create an organization first before creating an event. Go back to step 1
                or skip this step.
              </p>
              <Button onClick={props.onNext} variant="outline">
                Skip this step
              </Button>
            </div>
          </div>
        ),
      isBlocking: false, // User can skip
      cta: () => null, // Hide default Next button - StepEvent has its own buttons
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
        onboardingState.organizationId && onboardingState.eventId ? (
          <StepGuests
            {...props}
            organizationId={onboardingState.organizationId}
            eventId={onboardingState.eventId}
            onGuestsConfigured={(participantTypeIds, partnerTypeIds) => {
              updateOnboardingState({
                participantTypeIds,
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
      cta: () => null, // Hide default Next button - StepGuests has its own buttons
    },
    {
      title: 'Create email template',
      description: onboardingState.eventName
        ? `Set up a welcome email for ${onboardingState.eventName} attendees`
        : 'Set up automated email communication',
      className: 'bg-orange-100 dark:bg-orange-950/40',
      component: (props: any) =>
        onboardingState.organizationId ? (
          <StepEmailTemplate
            {...props}
            organizationId={onboardingState.organizationId}
            eventName={onboardingState.eventName}
            onTemplateCreated={(id, name) => {
              updateOnboardingState({
                emailTemplateId: id,
              })
            }}
          />
        ) : (
          <div className="flex min-h-[40.5dvh] w-full flex-col items-center justify-center p-4">
            <div className="text-center space-y-4">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground max-w-md">
                You need to create an organization first. Go back to step 1 or skip this step.
              </p>
              <Button onClick={props.onNext} variant="outline">
                Skip this step
              </Button>
            </div>
          </div>
        ),
      isBlocking: false, // Not blocking - user can skip
      cta: () => null, // Hide default Next button - StepEmailTemplate has its own buttons
    },
    {
      title: 'Social post design',
      description: 'Choose how you want to create social media images for your guests',
      className: 'bg-pink-100 dark:bg-pink-950/40',
      component: (props: any) =>
        onboardingState.organizationId ? (
          <StepSocialPost
            {...props}
            organizationId={onboardingState.organizationId}
            onPreferenceSelected={(preference) => {
              updateOnboardingState({
                socialPostOption: preference,
              })
            }}
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
                  if (onboardingState.eventId) {
                    router.push(`/dash/events/${onboardingState.eventId}`)
                  } else {
                    router.push('/dash/events')
                  }
                }}
                variant="outline"
              >
                Complete Setup
              </Button>
            </div>
          </div>
        ),
      isBlocking: false, // Not blocking - user can skip
      cta: () => null, // Hide default Next button - StepSocialPost has its own buttons
    },
  ]

  return <Onboarding2 steps={steps} />
}
