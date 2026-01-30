/**
 * Server-side canvas rendering utilities
 * Provides functions for creating and managing canvas contexts on the server
 */

import type { Canvas, CanvasRenderingContext2D, Image } from 'canvas'
import path from 'path'
import { fileURLToPath } from 'url'

// Dynamic import for canvas to avoid bundling issues with Cloudflare Workers
let canvasModule: typeof import('canvas') | null = null

async function getCanvas() {
  if (!canvasModule) {
    canvasModule = await import('canvas')
  }
  return canvasModule
}

/**
 * Create a canvas with the specified dimensions
 */
export async function createServerCanvas(width: number, height: number): Promise<Canvas> {
  const canvas = await getCanvas()
  return canvas.createCanvas(width, height)
}

/**
 * Get 2D rendering context from a canvas
 */
export function getCanvasContext(canvas: Canvas): CanvasRenderingContext2D {
  return canvas.getContext('2d')
}

/**
 * Load an image from a URL or file path for server-side rendering
 */
export async function loadServerImage(src: string): Promise<Image> {
  try {
    const canvas = await getCanvas()
    return await canvas.loadImage(src)
  } catch (error) {
    console.error(`Failed to load image from ${src}:`, error)
    throw new Error(
      `Failed to load image: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * Load an image from a base64 data URL
 */
export async function loadImageFromDataURL(dataURL: string): Promise<Image> {
  try {
    const canvas = await getCanvas()
    return await canvas.loadImage(dataURL)
  } catch (error) {
    console.error('Failed to load image from data URL:', error)
    throw new Error(
      `Failed to load image from data URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * Load an image from a buffer
 */
export async function loadImageFromBuffer(buffer: Buffer): Promise<Image> {
  try {
    const canvas = await getCanvas()
    return await canvas.loadImage(buffer)
  } catch (error) {
    console.error('Failed to load image from buffer:', error)
    throw new Error(
      `Failed to load image from buffer: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * Convert canvas to PNG buffer
 */
export function canvasToPNGBuffer(canvas: Canvas): Buffer {
  return canvas.toBuffer('image/png')
}

/**
 * Convert canvas to JPEG buffer
 */
export function canvasToJPEGBuffer(canvas: Canvas, quality: number = 0.9): Buffer {
  return canvas.toBuffer('image/jpeg', { quality })
}

/**
 * Register custom fonts for server-side text rendering
 * This should be called once during application initialization
 */
export async function registerCustomFonts(): Promise<void> {
  try {
    const canvas = await getCanvas()
    // Get the directory name in ES modules
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    // Register common web fonts
    // Note: Font files should be placed in public/fonts directory
    const fontsDir = path.join(process.cwd(), 'public', 'fonts')

    // Register Arial (if available)
    try {
      canvas.registerFont(path.join(fontsDir, 'Arial.ttf'), { family: 'Arial' })
    } catch (error) {
      console.warn('Arial font not found, using system default')
    }

    // Register Arial Bold
    try {
      canvas.registerFont(path.join(fontsDir, 'Arial-Bold.ttf'), {
        family: 'Arial',
        weight: 'bold',
      })
    } catch (error) {
      console.warn('Arial Bold font not found, using system default')
    }

    // Register Arial Italic
    try {
      canvas.registerFont(path.join(fontsDir, 'Arial-Italic.ttf'), {
        family: 'Arial',
        style: 'italic',
      })
    } catch (error) {
      console.warn('Arial Italic font not found, using system default')
    }

    // Register Helvetica (if available)
    try {
      canvas.registerFont(path.join(fontsDir, 'Helvetica.ttf'), { family: 'Helvetica' })
    } catch (error) {
      console.warn('Helvetica font not found, using system default')
    }

    // Register Times New Roman (if available)
    try {
      canvas.registerFont(path.join(fontsDir, 'TimesNewRoman.ttf'), { family: 'Times New Roman' })
    } catch (error) {
      console.warn('Times New Roman font not found, using system default')
    }

    console.log('Custom fonts registration completed')
  } catch (error) {
    console.error('Error registering custom fonts:', error)
    console.warn('Continuing with system default fonts')
  }
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
  image: Image,
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
export function clearCanvas(canvas: Canvas): void {
  const ctx = getCanvasContext(canvas)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

/**
 * Fill canvas with solid color
 */
export function fillCanvas(canvas: Canvas, color: string): void {
  const ctx = getCanvasContext(canvas)
  ctx.fillStyle = color
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}
