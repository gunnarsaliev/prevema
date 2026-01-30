/**
 * Email validation utilities (client-safe, no Handlebars)
 * For Handlebars-specific validation, see emailValidation.server.ts
 */

/**
 * Validates Resend API key format
 * Valid format: starts with 're_' followed by alphanumeric characters
 */
export function validateResendApiKey(apiKey: string | null | undefined): {
  valid: boolean
  error?: string
} {
  if (!apiKey || apiKey.trim() === '') {
    return { valid: false, error: 'API key is required' }
  }

  // Resend API keys start with 're_'
  if (!apiKey.startsWith('re_')) {
    return { valid: false, error: 'Invalid API key format. Resend API keys must start with "re_"' }
  }

  // Check minimum length (re_ + at least 10 characters)
  if (apiKey.length < 13) {
    return { valid: false, error: 'API key is too short' }
  }

  // Check that it only contains valid characters (alphanumeric and underscores)
  const validPattern = /^re_[a-zA-Z0-9_]+$/
  if (!validPattern.test(apiKey)) {
    return {
      valid: false,
      error: 'API key contains invalid characters. Only alphanumeric and underscores allowed.',
    }
  }

  return { valid: true }
}

/**
 * Validates email address format
 */
export function validateEmailAddress(email: string | null | undefined): {
  valid: boolean
  error?: string
} {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email address is required' }
  }

  // Basic email validation regex
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email)) {
    return { valid: false, error: 'Invalid email address format' }
  }

  return { valid: true }
}

/**
 * Validates that required email config fields are provided when email config is active
 */
export function validateEmailConfig(config: {
  isActive?: boolean | null
  resendApiKey?: string | null
  senderName?: string | null
  fromEmail?: string | null
  replyToEmail?: string | null
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // If email config is not active, no validation needed
  if (!config.isActive) {
    return { valid: true, errors: [] }
  }

  // When active, API key and from email are required
  const apiKeyValidation = validateResendApiKey(config.resendApiKey)
  if (!apiKeyValidation.valid) {
    errors.push(`API Key: ${apiKeyValidation.error}`)
  }

  const fromEmailValidation = validateEmailAddress(config.fromEmail)
  if (!fromEmailValidation.valid) {
    errors.push(`From Email: ${fromEmailValidation.error}`)
  }

  // Sender name is recommended but not required
  if (!config.senderName || config.senderName.trim() === '') {
    errors.push('Sender Name: Recommended to provide a sender name')
  }

  // Reply-to email is optional, but if provided, must be valid
  if (config.replyToEmail && config.replyToEmail.trim() !== '') {
    const replyToValidation = validateEmailAddress(config.replyToEmail)
    if (!replyToValidation.valid) {
      errors.push(`Reply-To Email: ${replyToValidation.error}`)
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Test Resend API key by making a test request
 * Note: This is a placeholder - actual implementation would require Resend SDK
 */
export async function testResendApiKey(apiKey: string): Promise<{
  valid: boolean
  error?: string
}> {
  // First validate format
  const formatValidation = validateResendApiKey(apiKey)
  if (!formatValidation.valid) {
    return formatValidation
  }

  // In a real implementation, you would make a test API call to Resend
  // For now, we just validate the format
  return { valid: true }
}
