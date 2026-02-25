/**
 * Alignment guides utility for canvas editor
 * Provides Canva-style center alignment detection with performance optimization
 */

export interface AlignmentState {
  showVertical: boolean
  showHorizontal: boolean
}

export interface ElementBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface CanvasDimensions {
  width: number
  height: number
}

/**
 * Calculates the center point of an element
 */
export function getElementCenter(element: ElementBounds): { x: number; y: number } {
  return {
    x: element.x + element.width / 2,
    y: element.y + element.height / 2,
  }
}

/**
 * Calculates the center point of the canvas
 */
export function getCanvasCenter(canvas: CanvasDimensions): { x: number; y: number } {
  return {
    x: canvas.width / 2,
    y: canvas.height / 2,
  }
}

/**
 * Determines if element center is aligned with canvas center
 * @param threshold Distance in pixels to trigger alignment (default: 5px)
 */
export function calculateAlignment(
  element: ElementBounds,
  canvas: CanvasDimensions,
  threshold: number = 5,
): AlignmentState {
  const elementCenter = getElementCenter(element)
  const canvasCenter = getCanvasCenter(canvas)

  const verticalDistance = Math.abs(elementCenter.x - canvasCenter.x)
  const horizontalDistance = Math.abs(elementCenter.y - canvasCenter.y)

  return {
    showVertical: verticalDistance <= threshold,
    showHorizontal: horizontalDistance <= threshold,
  }
}

/**
 * Checks if any alignment guides should be shown
 */
export function shouldShowGuides(alignment: AlignmentState): boolean {
  return alignment.showVertical || alignment.showHorizontal
}

/**
 * Draws alignment guide lines on the canvas
 */
export function drawAlignmentGuides(
  ctx: CanvasRenderingContext2D,
  canvas: CanvasDimensions,
  alignment: AlignmentState,
): void {
  if (!shouldShowGuides(alignment)) return

  const center = getCanvasCenter(canvas)

  ctx.save()
  ctx.strokeStyle = '#ec4899' // Pink/magenta color (Canva-style)
  ctx.lineWidth = 2
  ctx.setLineDash([8, 4]) // Dashed line pattern

  // Draw vertical center line (when horizontally centered)
  if (alignment.showVertical) {
    ctx.beginPath()
    ctx.moveTo(center.x, 0)
    ctx.lineTo(center.x, canvas.height)
    ctx.stroke()
  }

  // Draw horizontal center line (when vertically centered)
  if (alignment.showHorizontal) {
    ctx.beginPath()
    ctx.moveTo(0, center.y)
    ctx.lineTo(canvas.width, center.y)
    ctx.stroke()
  }

  ctx.restore()
}

/**
 * Snaps element position to canvas center if within threshold
 * @param element Current element bounds
 * @param canvas Canvas dimensions
 * @param threshold Snap threshold in pixels
 * @returns Updated element position (x, y) if snapping occurred
 */
export function snapToCenter(
  element: ElementBounds,
  canvas: CanvasDimensions,
  threshold: number = 5,
): { x: number; y: number } {
  const alignment = calculateAlignment(element, canvas, threshold)
  const canvasCenter = getCanvasCenter(canvas)

  let x = element.x
  let y = element.y

  // Snap horizontally (to vertical center line)
  if (alignment.showVertical) {
    x = canvasCenter.x - element.width / 2
  }

  // Snap vertically (to horizontal center line)
  if (alignment.showHorizontal) {
    y = canvasCenter.y - element.height / 2
  }

  return { x, y }
}
