/**
 * Client-side canvas rendering utilities
 * Provides functions for creating and managing canvas contexts in the browser
 */

/**
 * Create a canvas with the specified dimensions
 */
export function createClientCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

/**
 * Get 2D rendering context from a canvas
 */
export function getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get 2D rendering context')
  }
  return ctx
}

/**
 * Load an image from a URL for client-side rendering
 */
export async function loadClientImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image from ${src}`))

    img.src = src
  })
}

/**
 * Load an image from a base64 data URL
 */
export async function loadImageFromDataURL(dataURL: string): Promise<HTMLImageElement> {
  return loadClientImage(dataURL)
}

/**
 * Convert canvas to PNG Blob
 */
export async function canvasToPNGBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to convert canvas to blob'))
      }
    }, 'image/png')
  })
}

/**
 * Convert canvas to JPEG Blob
 */
export async function canvasToJPEGBlob(
  canvas: HTMLCanvasElement,
  quality: number = 0.9,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to convert canvas to blob'))
        }
      },
      'image/jpeg',
      quality,
    )
  })
}

/**
 * Apply text styling to canvas context
 */
export function applyTextStyle(
  ctx: CanvasRenderingContext2D,
  options: {
    fontSize?: number
    fontFamily?: string
    fontWeight?: string
    fontStyle?: string
    fill?: string
  },
): void {
  const {
    fontSize = 16,
    fontFamily = 'Arial',
    fontWeight = 'normal',
    fontStyle = 'normal',
    fill = '#000000',
  } = options

  // Build font string: [style] [weight] [size] [family]
  const fontString = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.font = fontString
  ctx.fillStyle = fill
}

/**
 * Measure text dimensions
 */
export function measureText(
  ctx: CanvasRenderingContext2D,
  text: string,
  options: {
    fontSize?: number
    fontFamily?: string
    fontWeight?: string
    fontStyle?: string
  },
): { width: number; height: number } {
  applyTextStyle(ctx, options)
  const metrics = ctx.measureText(text)

  return {
    width: metrics.width,
    height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
  }
}

/**
 * Draw text with rotation support
 * Note: x, y represent the TOP-LEFT position of the text (not rotated)
 * Rotation is applied around the text's starting point
 * This matches how canvas editor renders text elements
 */
export function drawRotatedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  rotation: number = 0,
): void {
  ctx.save()

  // Set text alignment to match canvas editor defaults for regular text
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  // Rotate around the text starting point (x, y)
  ctx.translate(x, y)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.fillText(text, 0, 0)

  ctx.restore()
}

/**
 * Draw image with rotation and border radius support
 * Note: x, y represent the TOP-LEFT position of the image (not rotated)
 * Rotation is applied around the CENTER of the image to match canvas editor behavior
 */
export function drawRotatedImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number = 0,
  borderRadius: number = 0,
): void {
  ctx.save()

  // Calculate center point
  const centerX = x + width / 2
  const centerY = y + height / 2

  // Rotate around center (matches canvas editor)
  ctx.translate(centerX, centerY)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-centerX, -centerY)

  if (borderRadius > 0) {
    // Draw with rounded corners using clipping
    const radius = Math.min(borderRadius, width / 2, height / 2)

    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    ctx.clip()
  }

  ctx.drawImage(image, x, y, width, height)
  ctx.restore()
}

/**
 * Clear canvas
 */
export function clearCanvas(canvas: HTMLCanvasElement): void {
  const ctx = getCanvasContext(canvas)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

/**
 * Fill canvas with solid color
 */
export function fillCanvas(canvas: HTMLCanvasElement, color: string): void {
  const ctx = getCanvasContext(canvas)
  ctx.fillStyle = color
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}
