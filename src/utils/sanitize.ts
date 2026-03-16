import DOMPurify from 'isomorphic-dompurify'
import type { Config } from 'dompurify'

/**
 * Sanitize HTML to prevent XSS attacks
 * Uses DOMPurify to clean HTML while allowing safe tags and attributes
 *
 * @param dirty - Untrusted HTML string
 * @param options - Optional DOMPurify configuration
 * @returns Sanitized HTML string safe for rendering
 *
 * @example
 * ```ts
 * const clean = sanitizeHTML('<p>Hello</p><script>alert("xss")</script>')
 * // Returns: '<p>Hello</p>'
 * ```
 */
export function sanitizeHTML(
  dirty: string,
  options?: {
    /** Allow specific tags beyond defaults */
    allowedTags?: string[]
    /** Allow specific attributes beyond defaults */
    allowedAttributes?: string[]
    /** Strict mode - only allow very basic HTML */
    strict?: boolean
  },
): string {
  if (!dirty || typeof dirty !== 'string') {
    return ''
  }

  // Configure DOMPurify for email-safe HTML
  const config: Config = {
    // Allow common HTML tags used in emails
    ALLOWED_TAGS: options?.strict
      ? ['p', 'br', 'strong', 'em', 'u']
      : [
          'p',
          'br',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'strong',
          'em',
          'u',
          'a',
          'ul',
          'ol',
          'li',
          'blockquote',
          'table',
          'thead',
          'tbody',
          'tr',
          'th',
          'td',
          'img',
          'span',
          'div',
          'hr',
          ...(options?.allowedTags || []),
        ],

    // Allow safe attributes
    ALLOWED_ATTR: [
      'href',
      'title',
      'alt',
      'src',
      'style', // Needed for inline CSS in emails
      'class',
      'id',
      'width',
      'height',
      'align',
      'valign',
      'border',
      'cellpadding',
      'cellspacing',
      'bgcolor',
      ...(options?.allowedAttributes || []),
    ],

    // Only allow safe URL schemes
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,

    // Keep relative URLs (for testing)
    ALLOW_DATA_ATTR: false,

    // Return trusted HTML
    RETURN_TRUSTED_TYPE: false,

    // Don't allow unknown protocols
    FORCE_BODY: false,
  }

  return DOMPurify.sanitize(dirty, config)
}

/**
 * Sanitize email content specifically for email templates
 * More permissive than general HTML sanitization to support email-specific HTML
 *
 * @param html - HTML email content
 * @returns Sanitized HTML safe for email templates
 */
export function sanitizeEmailHTML(html: string): string {
  return sanitizeHTML(html, {
    allowedTags: [
      // Additional email-specific tags
      'center',
      'font',
      'b',
      'i',
    ],
    allowedAttributes: [
      // Email-specific attributes
      'color',
      'face',
      'size',
      'background',
    ],
  })
}

/**
 * Sanitize text content - strips all HTML tags
 * Useful for displaying plain text safely
 *
 * @param text - Text that may contain HTML
 * @returns Plain text with HTML stripped
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
}
