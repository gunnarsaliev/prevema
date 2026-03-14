import React from 'react'
import parse, { HTMLReactParserOptions, Element, domToReact } from 'html-react-parser'
import { sanitizeEmailHTML } from '@/utils/sanitize'

interface SafeHTMLProps {
  /** HTML content to render (will be sanitized) */
  html: string
  /** Additional CSS classes */
  className?: string
  /** Fallback content if HTML is empty */
  fallback?: React.ReactNode
}

/**
 * SafeHTML Component
 *
 * Safely renders HTML content by:
 * 1. Sanitizing HTML with DOMPurify
 * 2. Parsing to React elements (no dangerouslySetInnerHTML)
 *
 * This eliminates XSS vulnerabilities while allowing HTML rendering
 *
 * @example
 * ```tsx
 * <SafeHTML
 *   html="<p>Hello <strong>World</strong></p>"
 *   className="prose"
 * />
 * ```
 */
export function SafeHTML({ html, className, fallback }: SafeHTMLProps) {
  if (!html || html.trim() === '') {
    return <>{fallback || null}</>
  }

  // Step 1: Sanitize HTML to remove malicious content
  const sanitized = sanitizeEmailHTML(html)

  // Step 2: Parse HTML to React elements
  // This avoids dangerouslySetInnerHTML entirely
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      // Additional safety: filter out any remaining scripts or iframes
      if (domNode instanceof Element) {
        if (domNode.name === 'script' || domNode.name === 'iframe') {
          return <></>
        }

        // Ensure target="_blank" links have rel="noopener noreferrer"
        if (domNode.name === 'a') {
          const { attribs, children } = domNode
          if (attribs?.target === '_blank') {
            return (
              <a
                {...attribs}
                rel="noopener noreferrer"
                target="_blank"
              >
                {domToReact(children as any, options)}
              </a>
            )
          }
        }
      }
    },
  }

  try {
    const reactElements = parse(sanitized, options)

    return (
      <div className={className}>
        {reactElements}
      </div>
    )
  } catch (error) {
    console.error('Error parsing HTML:', error)
    return <>{fallback || <p className="text-destructive">Error rendering content</p>}</>
  }
}

/**
 * SafeEmailPreview Component
 *
 * Specialized component for previewing email templates
 * Includes email-specific styling and fallbacks
 */
export function SafeEmailPreview({ html, className }: { html: string; className?: string }) {
  return (
    <SafeHTML
      html={html}
      className={className}
      fallback={
        <p className="text-muted-foreground italic">No content to preview</p>
      }
    />
  )
}
