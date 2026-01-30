/**
 * Converts Lexical editor JSON to HTML string
 * This is a simplified converter for email templates
 * It handles the basic Lexical structure and converts it to HTML
 */

interface LexicalNode {
  type: string
  version?: number
  [key: string]: any
}

interface LexicalSerializedNode extends LexicalNode {
  children?: LexicalSerializedNode[]
  text?: string
  format?: number
  tag?: string
  direction?: string
  indent?: number
  url?: string
}

/**
 * Convert Lexical JSON to HTML string
 * Also handles legacy plain text/HTML strings for backward compatibility
 */
export function lexicalToHtml(lexicalJSON: any): string {
  // Handle null/undefined
  if (!lexicalJSON) {
    return ''
  }

  // Handle legacy plain string format (backward compatibility)
  if (typeof lexicalJSON === 'string') {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(lexicalJSON)
      if (parsed.root && parsed.root.children) {
        return processChildren(parsed.root.children)
      }
      // If it parses but doesn't have the Lexical structure, treat as plain text
      return lexicalJSON
    } catch {
      // Not JSON - treat as legacy plain HTML/text string
      return lexicalJSON
    }
  }

  // Handle Lexical JSON object format
  if (typeof lexicalJSON === 'object') {
    if (!lexicalJSON.root || !lexicalJSON.root.children) {
      return ''
    }
    return processChildren(lexicalJSON.root.children)
  }

  return ''
}

function processChildren(children: LexicalSerializedNode[]): string {
  if (!children || !Array.isArray(children)) {
    return ''
  }

  return children.map(node => processNode(node)).join('')
}

function processNode(node: LexicalSerializedNode): string {
  const { type } = node

  switch (type) {
    case 'paragraph':
      return `<p>${processChildren(node.children || [])}</p>`

    case 'heading':
      const tag = node.tag || 'h1'
      return `<${tag}>${processChildren(node.children || [])}</${tag}>`

    case 'text':
      return processTextNode(node)

    case 'link':
      const url = node.url || '#'
      return `<a href="${url}">${processChildren(node.children || [])}</a>`

    case 'linebreak':
      return '<br>'

    case 'horizontalrule':
      return '<hr>'

    case 'list':
      const listTag = node.listType === 'number' ? 'ol' : 'ul'
      return `<${listTag}>${processChildren(node.children || [])}</${listTag}>`

    case 'listitem':
      return `<li>${processChildren(node.children || [])}</li>`

    case 'quote':
      return `<blockquote>${processChildren(node.children || [])}</blockquote>`

    case 'code':
      return `<pre><code>${processChildren(node.children || [])}</code></pre>`

    case 'block':
      // Handle custom blocks - for email templates we'll just process their content
      return processChildren(node.children || [])

    default:
      // Unknown node type - try to process children if they exist
      if (node.children) {
        return processChildren(node.children)
      }
      return ''
  }
}

function processTextNode(node: LexicalSerializedNode): string {
  let text = node.text || ''

  // Handle text formatting using format bitmask
  // Format is a bitmask: 1=bold, 2=italic, 4=strikethrough, 8=underline, etc.
  const format = node.format || 0

  if (format & 1) { // Bold
    text = `<strong>${text}</strong>`
  }
  if (format & 2) { // Italic
    text = `<em>${text}</em>`
  }
  if (format & 8) { // Underline
    text = `<u>${text}</u>`
  }
  if (format & 4) { // Strikethrough
    text = `<s>${text}</s>`
  }
  if (format & 16) { // Code
    text = `<code>${text}</code>`
  }

  return text
}

/**
 * Extract plain text from Lexical JSON (useful for previews)
 */
export function lexicalToPlainText(lexicalJSON: any): string {
  const html = lexicalToHtml(lexicalJSON)
  // Simple HTML to plain text conversion
  return html
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim()
}
