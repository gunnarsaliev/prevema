/**
 * Template Restoration Utility
 *
 * Handles the restoration of image templates including all element types,
 * styles, and properties. Compatible with Cloudflare Workers edge deployment.
 */

import type { CanvasElement } from '@/components/canvas/types/canvas-element'

/**
 * Result of a template restoration operation
 */
export interface RestorationResult {
  elements: CanvasElement[]
  errors: RestorationError[]
}

/**
 * Error that occurred during element restoration
 */
export interface RestorationError {
  elementId: string
  elementType: string
  error: string
}

/**
 * Loaded template structure from the API
 */
export interface LoadedTemplate {
  id: string
  name: string
  usageType: 'participant' | 'partner' | 'both'
  width: number
  height: number
  backgroundImage?: string
  backgroundColor?: string
  elements: CanvasElement[] | string
  previewImage?: string
  createdAt: string
  updatedAt: string
}

/**
 * Default values for canvas elements by type
 * Used to fill in missing properties during restoration
 */
export const ELEMENT_DEFAULTS = {
  common: {
    x: 0,
    y: 0,
    draggable: true,
    visible: true,
    rotation: 0,
  },
  text: {
    width: 200,
    height: 40,
    fontSize: 16,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    fontStyle: 'normal',
    fill: '#000000',
    text: '',
  },
  'text-variable': {
    width: 200,
    height: 40,
    fontSize: 16,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    fontStyle: 'normal',
    fill: '#666666',
  },
  'image-variable': {
    width: 150,
    height: 100,
    aspectRatio: 1.5,
  },
  image: {
    width: 100,
    height: 100,
    aspectRatio: 1,
  },
} as const

type ElementType = keyof Omit<typeof ELEMENT_DEFAULTS, 'common'>

/**
 * Parses elements from either a JSON string or array format
 * Returns empty array on parse failure with error logging
 *
 * @param rawElements - Elements as JSON string or array
 * @returns Parsed array of partial canvas elements
 *
 * Requirements: 6.1
 */
export function parseElements(rawElements: unknown): Partial<CanvasElement>[] {
  // Handle null/undefined
  if (rawElements === null || rawElements === undefined) {
    return []
  }

  // If already an array, return it
  if (Array.isArray(rawElements)) {
    return rawElements
  }

  // If string, try to parse as JSON
  if (typeof rawElements === 'string') {
    try {
      const parsed = JSON.parse(rawElements)
      if (Array.isArray(parsed)) {
        return parsed
      }
      console.error('Parsed elements is not an array:', typeof parsed)
      return []
    } catch (error) {
      console.error('Failed to parse elements JSON:', error)
      return []
    }
  }

  // Check if it's an object (might be a single element or wrapped)
  if (typeof rawElements === 'object') {
    // If it has numeric keys, it might be an array-like object
    const keys = Object.keys(rawElements as object)
    if (keys.length > 0 && keys.every((k) => !isNaN(Number(k)))) {
      return Object.values(rawElements as object)
    }
  }

  // Unknown type
  console.error('Elements has unexpected type:', typeof rawElements)
  return []
}

/**
 * Applies default values to an element, filling in missing properties
 * Preserves existing values, only fills undefined properties
 *
 * @param element - Partial element to apply defaults to
 * @param type - Element type for type-specific defaults
 * @returns Element with defaults applied
 *
 * Requirements: 6.2
 */
export function applyDefaults(element: Partial<CanvasElement>, type: ElementType): CanvasElement {
  const commonDefaults = ELEMENT_DEFAULTS.common
  const typeDefaults = ELEMENT_DEFAULTS[type] || {}

  // Start with common defaults
  const result: CanvasElement = {
    id: element.id || `restored-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    type: type,
    x: element.x ?? commonDefaults.x,
    y: element.y ?? commonDefaults.y,
    draggable: element.draggable ?? commonDefaults.draggable,
    visible: element.visible ?? commonDefaults.visible,
    rotation: element.rotation ?? commonDefaults.rotation,
  }

  // Apply type-specific defaults
  for (const [key, defaultValue] of Object.entries(typeDefaults)) {
    const elementValue = element[key as keyof CanvasElement]
    if (elementValue === undefined) {
      ;(result as unknown as Record<string, unknown>)[key] = defaultValue
    } else {
      ;(result as unknown as Record<string, unknown>)[key] = elementValue
    }
  }

  // Copy over any additional properties from the original element
  // that aren't covered by defaults
  for (const [key, value] of Object.entries(element)) {
    if (!(key in result) && value !== undefined) {
      ;(result as unknown as Record<string, unknown>)[key] = value
    }
  }

  return result
}

/**
 * Restores a text element with all text-specific properties
 * Applies defaults for any missing properties
 *
 * @param element - Partial text element to restore
 * @returns Fully restored text element
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */
export function restoreTextElement(element: Partial<CanvasElement>): CanvasElement {
  const restored = applyDefaults(element, 'text')

  // Ensure all text-specific properties are present
  restored.text = element.text ?? ELEMENT_DEFAULTS.text.text
  restored.fontSize = element.fontSize ?? ELEMENT_DEFAULTS.text.fontSize
  restored.fontFamily = element.fontFamily ?? ELEMENT_DEFAULTS.text.fontFamily
  restored.fontWeight = element.fontWeight ?? ELEMENT_DEFAULTS.text.fontWeight
  restored.fontStyle = element.fontStyle ?? ELEMENT_DEFAULTS.text.fontStyle
  restored.fill = element.fill ?? ELEMENT_DEFAULTS.text.fill

  return restored
}

/**
 * Restores a text-variable element with variable and text styling properties
 * Applies defaults for any missing properties
 *
 * @param element - Partial text-variable element to restore
 * @returns Fully restored text-variable element
 *
 * Requirements: 3.1, 3.2
 */
export function restoreTextVariableElement(element: Partial<CanvasElement>): CanvasElement {
  const restored = applyDefaults(element, 'text-variable')

  // Restore variable-specific properties
  restored.variableType = element.variableType
  restored.variableName = element.variableName

  // Restore text styling properties
  restored.fontSize = element.fontSize ?? ELEMENT_DEFAULTS['text-variable'].fontSize
  restored.fontFamily = element.fontFamily ?? ELEMENT_DEFAULTS['text-variable'].fontFamily
  restored.fontWeight = element.fontWeight ?? ELEMENT_DEFAULTS['text-variable'].fontWeight
  restored.fontStyle = element.fontStyle ?? ELEMENT_DEFAULTS['text-variable'].fontStyle
  restored.fill = element.fill ?? ELEMENT_DEFAULTS['text-variable'].fill

  return restored
}

/**
 * Restores an image-variable element with variable and dimension properties
 * Applies defaults for any missing properties
 *
 * @param element - Partial image-variable element to restore
 * @returns Fully restored image-variable element
 *
 * Requirements: 3.3, 3.4, 3.5
 */
export function restoreImageVariableElement(element: Partial<CanvasElement>): CanvasElement {
  const restored = applyDefaults(element, 'image-variable')

  // Restore variable-specific properties
  restored.variableType = element.variableType
  restored.variableName = element.variableName

  // Restore dimension properties
  restored.aspectRatio = element.aspectRatio ?? ELEMENT_DEFAULTS['image-variable'].aspectRatio

  return restored
}

/**
 * Loads an HTMLImageElement from a source URL
 * Handles CORS with crossOrigin attribute for cross-origin images
 *
 * @param src - Image source URL
 * @returns Promise resolving to loaded HTMLImageElement
 *
 * Requirements: 7.3, 7.5
 */
export function loadImageFromSrc(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous' // Handle CORS for cross-origin images
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

/**
 * Restores an image element with all image-specific properties
 * Loads the HTMLImageElement from imageData.src using browser Image constructor
 * Handles CORS with crossOrigin attribute
 *
 * @param element - Partial image element to restore
 * @returns Promise resolving to fully restored image element
 *
 * Requirements: 4.1, 4.2, 4.3, 7.3, 7.5
 */
export async function restoreImageElement(element: Partial<CanvasElement>): Promise<CanvasElement> {
  const restored = applyDefaults(element, 'image')

  // Restore imageData if present
  if (element.imageData) {
    restored.imageData = {
      src: element.imageData.src,
      width: element.imageData.width,
      height: element.imageData.height,
    }

    // Load HTMLImageElement from imageData.src
    try {
      const img = await loadImageFromSrc(element.imageData.src)
      restored.image = img
    } catch (error) {
      // Image loading failed - element will be created without image property
      // The error will be handled by the caller
      console.error(`Failed to load image for element ${element.id}:`, error)
      throw error
    }
  }

  // Restore dimension properties
  restored.aspectRatio = element.aspectRatio ?? ELEMENT_DEFAULTS.image.aspectRatio
  restored.originalWidth = element.originalWidth
  restored.originalHeight = element.originalHeight

  return restored
}

/**
 * Main restoration function that restores all template elements
 * Handles JSON string/array parsing, routes to type-specific restoration,
 * collects errors, and preserves element array order for z-order
 *
 * @param rawElements - Elements as JSON string or array
 * @returns Promise resolving to RestorationResult with elements and errors
 *
 * Requirements: 1.5, 4.4
 */
export async function restoreTemplateElements(rawElements: unknown): Promise<RestorationResult> {
  const errors: RestorationError[] = []
  const elements: CanvasElement[] = []

  // Parse elements from JSON string or array
  const parsedElements = parseElements(rawElements)

  // Process each element in order to preserve z-order (array index)
  for (const element of parsedElements) {
    // Skip elements without a valid type
    if (!element.type) {
      const elementId = element.id || 'unknown'
      console.warn('Element missing type, skipping:', element)
      errors.push({
        elementId,
        elementType: 'unknown',
        error: 'Element is missing required type property',
      })
      continue
    }

    try {
      let restoredElement: CanvasElement

      // Route to type-specific restoration function
      switch (element.type) {
        case 'text':
          restoredElement = restoreTextElement(element)
          break

        case 'text-variable':
          restoredElement = restoreTextVariableElement(element)
          break

        case 'image-variable':
          restoredElement = restoreImageVariableElement(element)
          break

        case 'image':
          try {
            restoredElement = await restoreImageElement(element)
          } catch (imageError) {
            // Image loading failed - create element without image property
            // and add loadError flag per Requirements 4.4
            restoredElement = applyDefaults(element, 'image')
            restoredElement.imageData = element.imageData
            restoredElement.aspectRatio = element.aspectRatio ?? ELEMENT_DEFAULTS.image.aspectRatio
            restoredElement.originalWidth = element.originalWidth
            restoredElement.originalHeight = element.originalHeight
            restoredElement.loadError = true

            errors.push({
              elementId: element.id || 'unknown',
              elementType: 'image',
              error:
                imageError instanceof Error
                  ? imageError.message
                  : 'Failed to load image from imageData.src',
            })
          }
          break

        default:
          // Unrecognized element type - skip and log error
          console.warn('Unrecognized element type, skipping:', element.type, element)
          errors.push({
            elementId: element.id || 'unknown',
            elementType: String(element.type),
            error: `Unrecognized element type: ${element.type}`,
          })
          continue
      }

      elements.push(restoredElement)
    } catch (error) {
      // Unexpected error during restoration
      console.error('Unexpected error restoring element:', element, error)
      errors.push({
        elementId: element.id || 'unknown',
        elementType: element.type || 'unknown',
        error: error instanceof Error ? error.message : 'Unexpected restoration error',
      })
    }
  }

  return { elements, errors }
}
