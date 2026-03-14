/**
 * Email Template Validation Utilities
 * Validates HTML email templates for email client compatibility
 */

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  line?: number
  suggestion?: string
}

export interface ValidationResult {
  isValid: boolean
  issues: ValidationIssue[]
  score: number // 0-100, how email-friendly the template is
}

/**
 * Validate email HTML template for email client compatibility
 *
 * @param html - HTML email content
 * @returns Validation result with issues and score
 */
export function validateEmailHTML(html: string): ValidationResult {
  if (!html || typeof html !== 'string') {
    return {
      isValid: false,
      issues: [{ type: 'error', message: 'Email content is required' }],
      score: 0,
    }
  }

  const issues: ValidationIssue[] = []
  let score = 100

  // Check for unsupported CSS
  const unsupportedCSSPatterns = [
    {
      pattern: /position\s*:\s*(absolute|fixed|sticky)/gi,
      message: 'Position properties (absolute, fixed, sticky) are not supported in email clients',
      penalty: 10,
    },
    {
      pattern: /display\s*:\s*(flex|grid)/gi,
      message: 'Flexbox and Grid are not widely supported in email clients',
      penalty: 15,
    },
    {
      pattern: /float\s*:/gi,
      message: 'Float property has inconsistent support - use tables instead',
      penalty: 5,
    },
    {
      pattern: /<style[\s>]/gi,
      message: 'Style tags are often stripped by email clients - use inline styles',
      penalty: 20,
    },
    {
      pattern: /background-image\s*:/gi,
      message: 'Background images have limited support - consider using <img> tags',
      penalty: 8,
    },
    {
      pattern: /@media/gi,
      message: 'Media queries require <style> tags which may be stripped',
      penalty: 5,
    },
  ]

  unsupportedCSSPatterns.forEach(({ pattern, message, penalty }) => {
    const matches = html.match(pattern)
    if (matches) {
      issues.push({
        type: 'warning',
        message: `${message} (found ${matches.length} occurrence${matches.length > 1 ? 's' : ''})`,
        suggestion: 'Use inline styles and table-based layouts for better compatibility',
      })
      score -= penalty
    }
  })

  // Check for missing inline styles
  if (html.includes('<p>') && !html.includes('<p style=')) {
    issues.push({
      type: 'warning',
      message: 'Paragraphs without inline styles detected',
      suggestion: 'Add inline styles to <p> tags for consistent rendering',
    })
    score -= 5
  }

  if (html.includes('<h1>') || html.includes('<h2>') || html.includes('<h3>')) {
    const hasStyledHeading = /<h[1-6][^>]*style=/gi.test(html)
    if (!hasStyledHeading) {
      issues.push({
        type: 'warning',
        message: 'Headings without inline styles detected',
        suggestion: 'Add inline styles to heading tags',
      })
      score -= 5
    }
  }

  // Check for table-based layout (recommended for emails)
  const hasTable = /<table/gi.test(html)
  if (!hasTable) {
    issues.push({
      type: 'info',
      message: 'No tables detected - consider using table-based layout for better email client support',
      suggestion: 'Wrap content in a table structure for maximum compatibility',
    })
    score -= 10
  }

  // Check width constraints
  const widthMatches = html.match(/width\s*[:=]\s*["']?(\d+)/gi)
  if (widthMatches) {
    widthMatches.forEach((match) => {
      const width = parseInt(match.match(/\d+/)?.[0] || '0')
      if (width > 640) {
        issues.push({
          type: 'warning',
          message: `Width ${width}px exceeds recommended 600-640px maximum`,
          suggestion: 'Keep email width at 600-640px for optimal display',
        })
        score -= 5
      }
    })
  }

  // Check for external resources
  const externalLinks = [
    { pattern: /src\s*=\s*["']https?:\/\//gi, type: 'images' },
    { pattern: /href\s*=\s*["']https?:\/\//gi, type: 'links' },
  ]

  externalLinks.forEach(({ pattern, type }) => {
    const matches = html.match(pattern)
    if (matches && matches.length > 5) {
      issues.push({
        type: 'info',
        message: `Multiple external ${type} detected (${matches.length})`,
        suggestion: `Consider hosting ${type} on a CDN for faster loading`,
      })
    }
  })

  // Check for font sizes
  const fontSizeMatches = html.match(/font-size\s*:\s*(\d+)px/gi)
  if (fontSizeMatches) {
    fontSizeMatches.forEach((match) => {
      const size = parseInt(match.match(/\d+/)?.[0] || '0')
      if (size < 14) {
        issues.push({
          type: 'warning',
          message: `Font size ${size}px is below recommended 14px minimum`,
          suggestion: 'Use minimum 14-16px for body text readability',
        })
        score -= 3
      }
    })
  }

  // Check for JavaScript (not allowed in emails)
  if (/<script/gi.test(html)) {
    issues.push({
      type: 'error',
      message: 'JavaScript is not supported and will be stripped by email clients',
      suggestion: 'Remove all <script> tags',
    })
    score -= 30
  }

  // Check for form elements (limited support)
  if (/<form/gi.test(html)) {
    issues.push({
      type: 'warning',
      message: 'Form elements have limited support in email clients',
      suggestion: 'Link to a web page with the form instead',
    })
    score -= 15
  }

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score))

  // Determine if valid based on having no errors
  const hasErrors = issues.some((issue) => issue.type === 'error')

  return {
    isValid: !hasErrors && score >= 50,
    issues,
    score,
  }
}

/**
 * Check if HTML has required inline CSS for email compatibility
 */
export function hasInlineCSS(html: string): boolean {
  return /style\s*=\s*["']/gi.test(html)
}

/**
 * Get email-friendliness score description
 */
export function getScoreDescription(score: number): string {
  if (score >= 90) return 'Excellent - Well optimized for email clients'
  if (score >= 75) return 'Good - Minor improvements recommended'
  if (score >= 50) return 'Fair - Several compatibility issues to address'
  return 'Poor - Major compatibility issues detected'
}

/**
 * Validate Handlebars variables syntax
 */
export function validateHandlebarsVariables(template: string): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // Check for malformed variables
  const malformed = template.match(/\{[^{}]*\{|[^{}]*\}[^{}]*\}/g)
  if (malformed) {
    issues.push({
      type: 'error',
      message: 'Malformed Handlebars syntax detected',
      suggestion: 'Use {{variableName}} format for variables',
    })
  }

  // Check for unclosed variables
  const openCount = (template.match(/\{\{/g) || []).length
  const closeCount = (template.match(/\}\}/g) || []).length
  if (openCount !== closeCount) {
    issues.push({
      type: 'error',
      message: `Unclosed Handlebars variables: ${openCount} opened, ${closeCount} closed`,
      suggestion: 'Ensure all {{variables}} are properly closed',
    })
  }

  return issues
}
