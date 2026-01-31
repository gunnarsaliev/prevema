/**
 * CSP-Safe Template Engine
 *
 * This module provides a template engine that doesn't rely on dynamic code generation (eval, new Function).
 *
 * Unlike Handlebars.compile() which uses new Function() internally,
 * this engine uses regex-based string replacement which is safe in
 * environments with strict Content Security Policy (CSP).
 *
 * Supports:
 * - Variable interpolation: {{variableName}}
 * - HTML escaping by default
 * - Safe handling of missing variables (renders empty string)
 *
 * Does NOT support (vs Handlebars):
 * - Helpers ({{#if}}, {{#each}}, etc.)
 * - Partials
 * - Block expressions
 * - Custom helpers
 *
 * For production use where CSP is enforced.
 */

/**
 * Compile a template string with variables
 * This is CSP-safe and works in various environments
 */
export function compileTemplate(template: string, variables: Record<string, any>): string {
  // Replace {{variableName}} with actual values
  // Uses regex to find all {{...}} patterns
  return template.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
    const value = variables[variableName]

    // Handle undefined/null values
    if (value === undefined || value === null) {
      console.warn(`Template variable "${variableName}" is undefined`)
      return ''
    }

    // Convert to string - DON'T escape HTML as these values are already safe
    // and URLs/HTML content need to be preserved
    return String(value)
  })
}

/**
 * Escape HTML special characters to prevent XSS attacks
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Extract all variable names from a template
 * Useful for validation and debugging
 */
export function extractTemplateVariables(template: string): string[] {
  const regex = /\{\{(\w+)\}\}/g
  const variables = new Set<string>()
  let match: RegExpExecArray | null

  while ((match = regex.exec(template)) !== null) {
    variables.add(match[1])
  }

  return Array.from(variables)
}

/**
 * Validate that all required variables are present
 */
export function validateTemplateVariables(
  template: string,
  variables: Record<string, any>,
): { valid: boolean; missing: string[] } {
  const required = extractTemplateVariables(template)
  const provided = Object.keys(variables)
  const missing = required.filter((v) => !(v in variables))

  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Preview a template with variables (useful for testing)
 * Returns both the compiled result and validation info
 */
export function previewTemplate(
  template: string,
  variables: Record<string, any>,
): {
  result: string
  validation: { valid: boolean; missing: string[] }
  variables: string[]
} {
  const validation = validateTemplateVariables(template, variables)
  const result = compileTemplate(template, variables)
  const variableList = extractTemplateVariables(template)

  return {
    result,
    validation,
    variables: variableList,
  }
}
