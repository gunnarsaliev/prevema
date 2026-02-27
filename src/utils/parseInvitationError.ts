/**
 * Parse invitation acceptance errors into user-friendly messages
 * Logs technical details for debugging while showing clean messages to users
 *
 * This function traverses the error cause chain to find the root error (e.g., database error)
 * and uses that to determine the appropriate user-friendly message, while preserving
 * the full error chain in technicalDetails for debugging.
 */
export function parseInvitationError(error: unknown): {
  userMessage: string
  technicalDetails: string
} {
  if (!(error instanceof Error)) {
    return {
      userMessage: 'An unexpected error occurred. Please try again or contact support.',
      technicalDetails: String(error),
    }
  }

  // Check if there's a cause (original error) in the error chain
  let rootError = error
  let errorChain = `${error.message}\n${error.stack || ''}`

  // Traverse the error cause chain to get the original error
  if (error.cause && error.cause instanceof Error) {
    rootError = error.cause
    errorChain += `\n\nCaused by: ${rootError.message}\n${rootError.stack || ''}`

    // Keep going deeper if there are more causes
    let currentError = rootError
    while (currentError.cause && currentError.cause instanceof Error) {
      currentError = currentError.cause
      errorChain += `\n\nCaused by: ${currentError.message}\n${currentError.stack || ''}`
    }
  }

  const errorMessage = rootError.message.toLowerCase()
  const technicalDetails = errorChain

  // Check for common database constraint violations
  if (errorMessage.includes('unique constraint') || errorMessage.includes('duplicate')) {
    return {
      userMessage:
        'You are already a member of this organization. Please log in with your existing account.',
      technicalDetails,
    }
  }

  // Check for foreign key violations (organization doesn't exist, etc.)
  if (errorMessage.includes('foreign key') || errorMessage.includes('violates')) {
    return {
      userMessage:
        'The organization associated with this invitation no longer exists. Please contact the person who invited you.',
      technicalDetails,
    }
  }

  // Check for seat limit errors
  if (
    errorMessage.includes('seat') ||
    errorMessage.includes('subscription') ||
    errorMessage.includes('limit')
  ) {
    return {
      userMessage:
        'This organization has reached its member limit. Please contact the organization administrator to upgrade their subscription.',
      technicalDetails,
    }
  }

  // Check for permission/access errors
  if (errorMessage.includes('permission') || errorMessage.includes('access denied')) {
    return {
      userMessage:
        'Unable to add you to the organization due to permission restrictions. Please contact support.',
      technicalDetails,
    }
  }

  // Check for database connection errors
  if (
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('econnrefused')
  ) {
    return {
      userMessage:
        'We are experiencing technical difficulties. Please try again in a few moments.',
      technicalDetails,
    }
  }

  // Check for not null constraint violations
  if (errorMessage.includes('not null') || errorMessage.includes('null value')) {
    return {
      userMessage:
        'Unable to complete registration due to missing required information. Please contact support.',
      technicalDetails,
    }
  }

  // Generic database query failures
  if (errorMessage.includes('failed query') || errorMessage.includes('insert into')) {
    return {
      userMessage:
        'Unable to add you to the organization. This may be due to a technical issue. Please try again or contact the organization administrator.',
      technicalDetails,
    }
  }

  // If it's one of our custom error messages, use it directly
  if (
    errorMessage.includes('invitation') ||
    errorMessage.includes('expired') ||
    errorMessage.includes('email') ||
    errorMessage.includes('organization')
  ) {
    // These are already user-friendly messages from our validation
    return {
      userMessage: error.message,
      technicalDetails,
    }
  }

  // Default fallback
  return {
    userMessage:
      'Unable to complete your invitation acceptance. Please contact the organization administrator or try again later.',
    technicalDetails,
  }
}
