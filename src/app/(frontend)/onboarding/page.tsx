import type { Metadata } from 'next'
import { Onboarding2 } from '@/components/onboarding2'

export const metadata: Metadata = {
  title: 'Welcome to Prevema | Onboarding',
  description: 'Get started with Prevema event planning',
}

export default function OnboardingPage() {
  return <Onboarding2 />
}
