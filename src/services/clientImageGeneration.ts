import type { Participant, ImageTemplate, Media } from '@/payload-types'
import {
  createClientCanvas,
  getCanvasContext,
  canvasToPNGBlob,
  fillCanvas,
  loadClientImage,
  applyTextStyle,
  drawRotatedText,
  drawRotatedImage,
} from '@/utils/clientCanvasUtils'
import { VARIABLE_FIELD_MAPPING } from './variableMapping'

/**
 * Canvas element structure from the image generator
 */
interface CanvasElement {
  id: string
  type: 'image' | 'text' | 'image-variable' | 'text-variable'
  x: number
  y: number
  width?: number
  height?: number
  text?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  fill?: string
  imageData?: {
    src: string
    width: number
    height: number
  }
  draggable: boolean
  visible?: boolean
  rotation?: number
  aspectRatio?: number
  variableName?: string
  variableType?: string
  borderRadius?: number
}

/**
 * Result of generating a single image
 */
export interface GeneratedImage {
  participantId: string
  participantName: string
  blob: Blob
  fileName: string
  success: boolean
  error?: string
}

/**
 * Progress callback for tracking generation progress
 */
export type ProgressCallback = (current: number, total: number) => void

/**
 * Service for generating personalized images from templates on the client side
 */
export class ClientImageGenerationService {
  /**
   * Generate images for multiple participants
   * @param participants - Array of participant objects
   * @param template - Image template to use
   * @param onProgress - Optional callback to track progress
   * @returns Array of generated image results
   */
  async generateImages(
    participants: Participant[],
    template: ImageTemplate,
    onProgress?: ProgressCallback,
  ): Promise<GeneratedImage[]> {
    // Process participants in parallel with concurrency limit of 5
    const concurrencyLimit = 5
    const results: GeneratedImage[] = []
    let completedCount = 0

    for (let i = 0; i < participants.length; i += concurrencyLimit) {
      const batch = participants.slice(i, i + concurrencyLimit)

      const batchResults = await Promise.allSettled(
        batch.map(async (participant) => {
          try {
            const blob = await this.generateSingleImage(participant, template)
            const fileName = this.generateFileName(participant, template)

            return {
              participantId: String(participant.id),
              participantName: participant.name,
              blob,
              fileName,
              success: true,
            } as GeneratedImage
          } catch (error) {
            return {
              participantId: String(participant.id),
              participantName: participant.name,
              blob: new Blob(),
              fileName: '',
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            } as GeneratedImage
          }
        }),
      )

      // Extract results from Promise.allSettled
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value)
          completedCount++

          // Call progress callback if provided
          if (onProgress) {
            onProgress(completedCount, participants.length)
          }
        } else {
          // This shouldn't happen since we catch errors above, but handle it anyway
          results.push({
            participantId: 'unknown',
            participantName: 'unknown',
            blob: new Blob(),
            fileName: '',
            success: false,
            error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
          })
          completedCount++

          if (onProgress) {
            onProgress(completedCount, participants.length)
          }
        }
      }
    }

    return results
  }

  /**
   * Generate a single image for one participant
   * @param participant - Participant object
   * @param template - Image template to use
   * @returns PNG blob of the generated image
   */
  async generateSingleImage(participant: Participant, template: ImageTemplate): Promise<Blob> {
    try {
      return await this.renderCanvas(participant, template)
    } catch (error) {
      console.error(`Error generating image for participant ${participant.id}:`, error)
      throw new Error(
        `Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Render canvas with participant data
   * @param participant - Participant object
   * @param template - Image template to use
   * @returns PNG blob of the rendered canvas
   */
  private async renderCanvas(participant: Participant, template: ImageTemplate): Promise<Blob> {
    // Create canvas with template dimensions
    const canvas = createClientCanvas(template.width, template.height)
    const ctx = getCanvasContext(canvas)

    // Render background
    await this.renderBackground(canvas, template)

    // Parse elements from template
    const elements = this.parseElements(template.elements)

    // Render elements in order (z-index ordering)
    for (const element of elements) {
      if (element.visible === false) {
        continue
      }

      await this.renderElement(ctx, element, participant)
    }

    // Convert to PNG blob
    return canvasToPNGBlob(canvas)
  }

  /**
   * Render background image or color
   * @param canvas - Canvas to render on
   * @param template - Image template with background settings
   */
  private async renderBackground(
    canvas: HTMLCanvasElement,
    template: ImageTemplate,
  ): Promise<void> {
    const ctx = getCanvasContext(canvas)

    // Check if there's a background image
    if (template.backgroundImage) {
      try {
        const backgroundImageUrl = this.getMediaUrl(template.backgroundImage)

        if (backgroundImageUrl) {
          const image = await loadClientImage(backgroundImageUrl)

          // Apply object-cover behavior (match frontend canvas editor)
          const imgAspect = image.width / image.height
          const canvasAspect = template.width / template.height

          let drawWidth: number
          let drawHeight: number
          let offsetX: number
          let offsetY: number

          if (imgAspect > canvasAspect) {
            // Image is wider than canvas - fit height, crop width
            drawHeight = template.height
            drawWidth = drawHeight * imgAspect
            offsetX = (template.width - drawWidth) / 2
            offsetY = 0
          } else {
            // Image is taller than canvas - fit width, crop height
            drawWidth = template.width
            drawHeight = drawWidth / imgAspect
            offsetX = 0
            offsetY = (template.height - drawHeight) / 2
          }

          ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)
          return
        }
      } catch (error) {
        console.error('Error loading background image:', error)
        // Fall through to background color
      }
    }

    // Use background color if no image or image failed to load
    if (template.backgroundColor) {
      fillCanvas(canvas, template.backgroundColor)
    } else {
      // Default to white background
      fillCanvas(canvas, '#ffffff')
    }
  }

  /**
   * Render a single element on the canvas
   * @param ctx - Canvas rendering context
   * @param element - Canvas element to render
   * @param participant - Participant data for variable substitution
   */
  private async renderElement(
    ctx: CanvasRenderingContext2D,
    element: CanvasElement,
    participant: Participant,
  ): Promise<void> {
    switch (element.type) {
      case 'text':
        this.renderTextElement(ctx, element)
        break
      case 'text-variable':
        await this.renderTextVariableElement(ctx, element, participant)
        break
      case 'image':
        await this.renderImageElement(ctx, element)
        break
      case 'image-variable':
        await this.renderImageVariableElement(ctx, element, participant)
        break
    }
  }

  /**
   * Render a static text element
   * @param ctx - Canvas rendering context
   * @param element - Text element to render
   */
  private renderTextElement(ctx: CanvasRenderingContext2D, element: CanvasElement): void {
    if (!element.text) return

    // Apply text styling
    applyTextStyle(ctx, {
      fontSize: element.fontSize,
      fontFamily: element.fontFamily,
      fontWeight: element.fontWeight,
      fontStyle: element.fontStyle,
      fill: element.fill,
    })

    // Draw text with rotation
    drawRotatedText(ctx, element.text, element.x, element.y, element.rotation || 0)
  }

  /**
   * Render a text variable element with participant data
   * @param ctx - Canvas rendering context
   * @param element - Text variable element to render
   * @param participant - Participant data
   */
  private async renderTextVariableElement(
    ctx: CanvasRenderingContext2D,
    element: CanvasElement,
    participant: Participant,
  ): Promise<void> {
    if (!element.variableType) return

    // Get participant field value
    const value = this.getFieldValue(element.variableType, participant)

    // Apply text styling
    applyTextStyle(ctx, {
      fontSize: element.fontSize,
      fontFamily: element.fontFamily,
      fontWeight: element.fontWeight,
      fontStyle: element.fontStyle,
      fill: element.fill,
    })

    // Text variables are centered in the canvas editor, so we need to match that behavior
    // Calculate center position of the element box
    const centerX = element.x + (element.width || 200) / 2
    const centerY = element.y + (element.height || 40) / 2

    // Save context to restore after alignment changes
    ctx.save()

    // Set text alignment to center (matches canvas editor)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Draw text centered with rotation
    if (element.rotation) {
      ctx.translate(centerX, centerY)
      ctx.rotate((element.rotation * Math.PI) / 180)
      ctx.fillText(value, 0, 0)
    } else {
      ctx.fillText(value, centerX, centerY)
    }

    ctx.restore()
  }

  /**
   * Render a static image element
   * @param ctx - Canvas rendering context
   * @param element - Image element to render
   */
  private async renderImageElement(
    ctx: CanvasRenderingContext2D,
    element: CanvasElement,
  ): Promise<void> {
    if (!element.imageData?.src) return

    try {
      // Convert relative URLs to absolute URLs
      let imageUrl = element.imageData.src
      if (imageUrl.startsWith('/')) {
        const baseUrl = window.location.origin
        imageUrl = `${baseUrl}${imageUrl}`
      }

      const image = await loadClientImage(imageUrl)

      const width = element.width || element.imageData.width
      const height = element.height || element.imageData.height

      // Draw image with rotation and border radius
      drawRotatedImage(
        ctx,
        image,
        element.x,
        element.y,
        width,
        height,
        element.rotation || 0,
        element.borderRadius || 0,
      )
    } catch (error) {
      console.error(`Error loading image from ${element.imageData.src}:`, error)
      // Skip this element if image fails to load
    }
  }

  /**
   * Render an image variable element with participant data
   * @param ctx - Canvas rendering context
   * @param element - Image variable element to render
   * @param participant - Participant data
   */
  private async renderImageVariableElement(
    ctx: CanvasRenderingContext2D,
    element: CanvasElement,
    participant: Participant,
  ): Promise<void> {
    if (!element.variableType) return

    // Get participant image URL
    const imageUrl = await this.getImageUrl(element.variableType, participant)

    if (!imageUrl) {
      // Skip if no image URL available
      return
    }

    try {
      const image = await loadClientImage(imageUrl)

      // Use the element's specified dimensions (matches the placeholder box in editor)
      const targetWidth = element.width || 150
      const targetHeight = element.height || 100

      // Apply object-contain behavior: show entire image within bounds
      const imgAspect = image.width / image.height
      const targetAspect = targetWidth / targetHeight

      let drawWidth: number
      let drawHeight: number
      let offsetX: number
      let offsetY: number

      if (imgAspect > targetAspect) {
        // Image is wider - fit to width, add padding top/bottom
        drawWidth = targetWidth
        drawHeight = targetWidth / imgAspect
        offsetX = element.x
        offsetY = element.y + (targetHeight - drawHeight) / 2
      } else {
        // Image is taller - fit to height, add padding left/right
        drawWidth = targetHeight * imgAspect
        drawHeight = targetHeight
        offsetX = element.x + (targetWidth - drawWidth) / 2
        offsetY = element.y
      }

      // Draw the image centered within the element bounds
      ctx.save()

      // Handle rotation if specified
      if (element.rotation) {
        const centerX = element.x + targetWidth / 2
        const centerY = element.y + targetHeight / 2
        ctx.translate(centerX, centerY)
        ctx.rotate((element.rotation * Math.PI) / 180)
        ctx.translate(-centerX, -centerY)
      }

      // Apply border radius clipping if specified
      if (element.borderRadius && element.borderRadius > 0) {
        const radius = Math.min(element.borderRadius, targetWidth / 2, targetHeight / 2)
        ctx.beginPath()
        ctx.moveTo(element.x + radius, element.y)
        ctx.lineTo(element.x + targetWidth - radius, element.y)
        ctx.quadraticCurveTo(element.x + targetWidth, element.y, element.x + targetWidth, element.y + radius)
        ctx.lineTo(element.x + targetWidth, element.y + targetHeight - radius)
        ctx.quadraticCurveTo(element.x + targetWidth, element.y + targetHeight, element.x + targetWidth - radius, element.y + targetHeight)
        ctx.lineTo(element.x + radius, element.y + targetHeight)
        ctx.quadraticCurveTo(element.x, element.y + targetHeight, element.x, element.y + targetHeight - radius)
        ctx.lineTo(element.x, element.y + radius)
        ctx.quadraticCurveTo(element.x, element.y, element.x + radius, element.y)
        ctx.closePath()
        ctx.clip()
      }

      // Draw the entire image, scaled to fit within bounds
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)

      ctx.restore()
    } catch (error) {
      console.error(`Error loading participant image from ${imageUrl}:`, error)
      // Skip this element if image fails to load
    }
  }

  /**
   * Get participant field value by variable type for text variables
   * @param variableType - The variable type (e.g., "NAME", "EMAIL")
   * @param participant - The participant object
   * @returns The field value as a string, or empty string if not found
   */
  private getFieldValue(variableType: string, participant: Participant): string {
    const fieldName = VARIABLE_FIELD_MAPPING[variableType]

    if (!fieldName) {
      return ''
    }

    const value = participant[fieldName as keyof Participant]

    // Handle null/undefined values
    if (value === null || value === undefined) {
      return ''
    }

    // Convert to string
    return String(value)
  }

  /**
   * Get participant image URL by variable type for image variables
   * Converts relative URLs to absolute URLs for client-side image loading
   * @param variableType - The variable type (e.g., "PROFILE_IMAGE", "COMPANY_LOGO")
   * @param participant - The participant object
   * @returns The absolute image URL as a string, or null if not found
   */
  private async getImageUrl(
    variableType: string,
    participant: Participant,
  ): Promise<string | null> {
    const fieldName = VARIABLE_FIELD_MAPPING[variableType]

    if (!fieldName) {
      return null
    }

    const value = participant[fieldName as keyof Participant]

    // Handle null/undefined values
    if (value === null || value === undefined) {
      return null
    }

    let url: string | null = null

    // If it's a Media object, extract the URL
    if (typeof value === 'object' && 'url' in value) {
      const media = value as Media
      url = media.url || null
    }
    // If it's already a string (direct URL), use it
    else if (typeof value === 'string') {
      url = value
    }

    // Convert relative URLs to absolute URLs
    if (url && url.startsWith('/')) {
      const baseUrl = window.location.origin
      return `${baseUrl}${url}`
    }

    return url
  }

  /**
   * Parse elements from template JSON
   * @param elements - Elements from template (can be various types)
   * @returns Array of canvas elements
   */
  private parseElements(
    elements: string | number | boolean | null | { [k: string]: unknown } | unknown[],
  ): CanvasElement[] {
    if (Array.isArray(elements)) {
      return elements as CanvasElement[]
    }

    if (typeof elements === 'string') {
      try {
        const parsed = JSON.parse(elements)
        if (Array.isArray(parsed)) {
          return parsed as CanvasElement[]
        }
      } catch (error) {
        console.error('Error parsing elements JSON:', error)
      }
    }

    return []
  }

  /**
   * Get URL from Media object or string
   * Converts relative URLs to absolute URLs for client-side image loading
   * @param media - Media object, string URL, or number (ID)
   * @returns Absolute URL string or null
   */
  private getMediaUrl(media: number | null | Media | string): string | null {
    if (!media) return null

    let url: string | null = null

    // Handle Media object
    if (typeof media === 'object' && 'url' in media) {
      url = media.url || null
    }
    // Handle string URL (from API response)
    else if (typeof media === 'string') {
      url = media
    }

    if (!url) return null

    // If URL is relative, convert to absolute URL
    if (url.startsWith('/')) {
      const baseUrl = window.location.origin
      return `${baseUrl}${url}`
    }

    return url
  }

  /**
   * Generate filename for a participant's image
   * @param participant - Participant object
   * @param template - Image template
   * @returns Filename string
   */
  private generateFileName(participant: Participant, template: ImageTemplate): string {
    const timestamp = Date.now()
    const sanitizedParticipantName = this.sanitizeFilename(participant.name)
    const sanitizedTemplateName = this.sanitizeFilename(template.name)

    return `${sanitizedParticipantName}-${sanitizedTemplateName}-${timestamp}.png`
  }

  /**
   * Sanitize a string for use in filenames
   * @param name - String to sanitize
   * @returns Sanitized string
   */
  private sanitizeFilename(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9-_]/g, '-') // Replace special chars with dash
      .replace(/-+/g, '-') // Replace multiple dashes with single dash
      .replace(/^-|-$/g, '') // Remove leading/trailing dashes
      .toLowerCase()
  }
}
