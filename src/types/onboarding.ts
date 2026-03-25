export interface OnboardingState {
  organizationId?: number
  organizationName?: string
  eventId?: number
  eventName?: string
  participantRoleIds: number[]
  partnerTypeIds: number[]
  emailTemplateId?: number
  socialPostOption: 'own' | 'create' | null
  currentStep: number
}

export interface OnboardingStepValidation {
  isValid: boolean
  canProceed: boolean
  errorMessage?: string
}

export const initialOnboardingState: OnboardingState = {
  participantRoleIds: [],
  partnerTypeIds: [],
  socialPostOption: null,
  currentStep: 0,
}

export interface OnboardingContextValue {
  state: OnboardingState
  updateState: (updates: Partial<OnboardingState>) => void
  resetState: () => void
}
