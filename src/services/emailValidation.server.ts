import * as Handlebars from 'handlebars'

/**
 * Server-only email validation utilities that require Handlebars
 * This file should NOT be imported in Payload config files
 */

/**
 * Validates Handlebars template syntax
 */
export function validateHandlebarsTemplate(template: string): {
  valid: boolean
  error?: string
} {
  try {
    // Try to compile the template
    Handlebars.compile(template)
    return { valid: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown template error'
    return { valid: false, error: `Invalid Handlebars syntax: ${errorMessage}` }
  }
}

/**
 * Extract variables used in a Handlebars template
 */
export function extractHandlebarsVariables(template: string): string[] {
  const variables = new Set<string>()

  // Match {{variableName}} patterns
  const variablePattern = /\{\{([^{}]+)\}\}/g
  let match

  while ((match = variablePattern.exec(template)) !== null) {
    const variable = match[1].trim()

    // Skip Handlebars helpers and special syntax
    if (
      !variable.startsWith('#') &&
      !variable.startsWith('/') &&
      !variable.startsWith('!') &&
      !variable.includes(' ')
    ) {
      variables.add(variable)
    }
  }

  return Array.from(variables)
}

/**
 * Validate that template variables are defined
 */
export function validateTemplateVariables(
  template: string,
  availableVariables: string[],
): { valid: boolean; undefinedVariables: string[] } {
  const usedVariables = extractHandlebarsVariables(template)
  const undefinedVariables = usedVariables.filter((v) => !availableVariables.includes(v))

  return {
    valid: undefinedVariables.length === 0,
    undefinedVariables,
  }
}
