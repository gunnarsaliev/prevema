'use client'

import type React from 'react'
import { useState, useRef, useEffect, useCallback, memo } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import type { CanvasElement, Template } from '@/components/canvas/types/canvas-element'
import { useDebounce } from '../hooks/use-debounce'
import type { AlignmentState } from '../utils/alignment-guides'

interface CanvasEditorProps {
  selectedTemplate: Template
  elements: CanvasElement[]
  selectedElementId: string | null
  onElementSelect: (id: string | null) => void
  onElementUpdate: (id: string, updates: Partial<CanvasElement>) => void
  onElementDragEnd: (id: string, updates: Partial<CanvasElement>) => void
  onReset: () => void
  onMoveToFront: (id: string) => void
  onMoveToBack: (id: string) => void
  onMoveForward: (id: string) => void
  onMoveBackward: (id: string) => void
  onToggleVisibility: (id: string) => void
  onDeleteElement: (id: string) => void
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | 'rotate' | null

const CanvasEditor: React.FC<CanvasEditorProps> = memo(function CanvasEditor({
  selectedTemplate,
  elements,
  selectedElementId,
  onElementSelect,
  onElementUpdate,
  onElementDragEnd,
  onReset,
  onMoveToFront,
  onMoveToBack,
  onMoveForward,
  onMoveBackward,
  onToggleVisibility,
  onDeleteElement,
}: CanvasEditorProps) {
  // Multi-layer canvas architecture for better performance
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null) // Static background layer
  const contentCanvasRef = useRef<HTMLCanvasElement>(null) // Element content layer
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null) // Selection handles and guides layer
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null)
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 })
  const [initialElementState, setInitialElementState] = useState<CanvasElement | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [contextMenuElementId, setContextMenuElementId] = useState<string | null>(null)
  const [isEditingText, setIsEditingText] = useState(false)
  const [editingElementId, setEditingElementId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [textInputPosition, setTextInputPosition] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [lastClickTime, setLastClickTime] = useState(0)
  const [lastClickElement, setLastClickElement] = useState<string | null>(null)
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const lastMouseMoveTime = useRef(0)

  // Alignment guides state
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentState>({
    showVertical: false,
    showHorizontal: false,
  })

  // Lazy-loaded alignment guide functions
  const alignmentUtilsRef = useRef<typeof import('../utils/alignment-guides') | null>(null)

  // Note: We no longer use debounced history updates during drag/resize
  // Instead, we only push to history on mouse up (handleMouseUp)
  // This prevents intermediate stale states from being pushed to history
  const cancelHistoryUpdate = () => {
    // No-op function for compatibility
  }

  // Debounced canvas redraw for performance optimization
  const [debouncedRedraw, cancelRedraw] = useDebounce(
    () => {
      drawCanvas()
    },
    16, // ~60fps for smooth visual updates
  )

  // Track pending updates for debounced history
  const pendingUpdatesRef = useRef<Map<string, Partial<CanvasElement>>>(new Map())

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load background image when template changes
  useEffect(() => {
    if (!isClient) return

    // Check if backgroundImage is a color, gradient, or an image URL
    if (selectedTemplate.backgroundImage.startsWith('#') || selectedTemplate.backgroundImage.startsWith('linear-gradient')) {
      // It's a color or gradient, not an image
      setBackgroundImage(null)
    } else {
      // It's an image URL (base64 or remote URL)
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        setBackgroundImage(img)
      }
      img.onerror = () => {
        console.error('Failed to load background image')
        setBackgroundImage(null)
      }
      img.src = selectedTemplate.backgroundImage
    }
  }, [selectedTemplate.backgroundImage, isClient])

  // Helper function to validate and get image element
  const getValidImage = useCallback((element: CanvasElement): HTMLImageElement | null => {
    if (
      element.image &&
      element.image instanceof HTMLImageElement &&
      element.image.complete &&
      element.image.naturalWidth > 0
    ) {
      return element.image
    }
    return null
  }, [])

  // Helper function to draw background with object-cover behavior
  const drawBackgroundCover = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      img: HTMLImageElement,
      canvasWidth: number,
      canvasHeight: number,
    ) => {
      const imgAspect = img.width / img.height
      const canvasAspect = canvasWidth / canvasHeight

      let drawWidth, drawHeight, offsetX, offsetY

      if (imgAspect > canvasAspect) {
        // Image is wider than canvas
        drawHeight = canvasHeight
        drawWidth = drawHeight * imgAspect
        offsetX = (canvasWidth - drawWidth) / 2
        offsetY = 0
      } else {
        // Image is taller than canvas
        drawWidth = canvasWidth
        drawHeight = drawWidth / imgAspect
        offsetX = 0
        offsetY = (canvasHeight - drawHeight) / 2
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
    },
    [],
  )

  // Helper function to parse and draw gradient backgrounds
  const drawGradientBackground = useCallback(
    (ctx: CanvasRenderingContext2D, gradientString: string, width: number, height: number) => {
      // Parse linear-gradient string
      const match = gradientString.match(/linear-gradient\(([^)]+)\)/)
      if (!match) return false

      const parts = match[1].split(',').map(s => s.trim())
      const angle = parts[0].includes('deg') ? parseInt(parts[0]) : 135

      // Convert angle to radians and calculate gradient line
      const angleRad = (angle - 90) * (Math.PI / 180)
      const x1 = width / 2 - Math.cos(angleRad) * width / 2
      const y1 = height / 2 - Math.sin(angleRad) * height / 2
      const x2 = width / 2 + Math.cos(angleRad) * width / 2
      const y2 = height / 2 + Math.sin(angleRad) * height / 2

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2)

      // Parse color stops
      for (let i = 1; i < parts.length; i++) {
        const part = parts[i].trim()
        const colorMatch = part.match(/(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\([^)]+\))\s*(\d+%)?/)
        if (colorMatch) {
          const color = colorMatch[1]
          const position = colorMatch[2] ? parseInt(colorMatch[2]) / 100 : i / (parts.length - 1)
          gradient.addColorStop(position, color)
        }
      }

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      return true
    },
    [],
  )

  // Helper function to draw rotated element
  const drawRotatedElement = useCallback(
    (ctx: CanvasRenderingContext2D, element: CanvasElement, drawFn: () => void) => {
      const centerX = element.x + (element.width || 0) / 2
      const centerY = element.y + (element.height || 0) / 2
      const rotation = ((element.rotation || 0) * Math.PI) / 180

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(rotation)
      ctx.translate(-centerX, -centerY)
      drawFn()
      ctx.restore()
    },
    [],
  )

  // Helper function to draw dotted rectangle for variables (improved styling)
  const drawDottedRectangle = useCallback(
    (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
      const x = element.x
      const y = element.y
      const width = element.width || 150
      const height = element.height || 50

      // Draw background with subtle gradient for better visibility
      const gradient = ctx.createLinearGradient(x, y, x, y + height)
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.08)') // Light blue tint
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.12)')
      ctx.fillStyle = gradient
      ctx.fillRect(x, y, width, height)

      // Draw double dotted border for better visibility
      // Outer border (lighter)
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 3])
      ctx.strokeRect(x - 1, y - 1, width + 2, height + 2)

      // Inner border (darker)
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 4])
      ctx.strokeRect(x, y, width, height)
      ctx.setLineDash([])

      // Add a small "VAR" badge in top-left corner for clarity
      const badgePadding = 4
      const badgeHeight = 16
      ctx.fillStyle = 'rgba(59, 130, 246, 0.9)'
      ctx.fillRect(x, y, 32, badgeHeight)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText('VAR', x + badgePadding, y + 3)

      // Draw variable name text with responsive font size
      ctx.fillStyle = element.fill || '#1e40af' // Darker blue for better readability
      const fontWeight = element.fontWeight || 'bold' // Make variables bold by default
      const fontStyle = element.fontStyle || 'normal'

      // Calculate responsive font size based on element dimensions
      const minFontSize = 10
      const maxFontSize = 24
      const baseFontSize = element.fontSize || 14

      // Scale font size based on element size - more responsive scaling
      const widthScale = width / 150 // 150 is default width
      const heightScale = height / 50 // 50 is default height
      const scale = Math.min(widthScale, heightScale) // Use smaller scale to ensure text fits

      let fontSize = Math.max(minFontSize, Math.min(maxFontSize, baseFontSize * scale))

      // Additional constraint: ensure text fits within height
      fontSize = Math.min(fontSize, height * 0.35) // Use 35% of height max

      const fontFamily = element.fontFamily || 'Arial'

      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const displayText = element.variableName || '{{VARIABLE}}'

      // Check if text fits, if not, try to wrap or truncate
      const textMetrics = ctx.measureText(displayText)
      const textWidth = textMetrics.width

      if (textWidth > width - 10) {
        // 10px padding
        // Try to wrap text or use smaller font
        const words = displayText.split(' ')
        if (words.length > 1) {
          // Multi-word: try to wrap
          const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ')
          const line2 = words.slice(Math.ceil(words.length / 2)).join(' ')

          const lineHeight = fontSize * 1.2
          ctx.fillText(line1, x + width / 2, y + height / 2 - lineHeight / 2)
          ctx.fillText(line2, x + width / 2, y + height / 2 + lineHeight / 2)
        } else {
          // Single word: truncate with ellipsis
          let truncatedText = displayText
          while (
            ctx.measureText(truncatedText + '...').width > width - 10 &&
            truncatedText.length > 1
          ) {
            truncatedText = truncatedText.slice(0, -1)
          }
          ctx.fillText(
            truncatedText + (truncatedText !== displayText ? '...' : ''),
            x + width / 2,
            y + height / 2,
          )
        }
      } else {
        // Text fits normally
        ctx.fillText(displayText, x + width / 2, y + height / 2)
      }
    },
    [],
  )

  // Helper function to draw image with optional border radius
  const drawImageWithRadius = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      image: HTMLImageElement,
      x: number,
      y: number,
      width: number,
      height: number,
      borderRadius: number = 0,
    ) => {
      if (borderRadius > 0) {
        // Draw with rounded corners using clipping
        ctx.save()
        ctx.beginPath()
        const radius = Math.min(borderRadius, width / 2, height / 2)
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
        ctx.drawImage(image, x, y, width, height)
        ctx.restore()
      } else {
        // Draw normally without clipping
        ctx.drawImage(image, x, y, width, height)
      }
    },
    [],
  )

  // Helper function to draw image placeholder
  const drawImagePlaceholder = useCallback(
    (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
      const x = element.x
      const y = element.y
      const width = element.width || 100
      const height = element.height || 100

      // Draw placeholder background
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(x, y, width, height)

      // Draw border
      ctx.strokeStyle = '#d1d5db'
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, width, height)

      // Draw loading text
      ctx.fillStyle = '#9ca3af'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Loading...', x + width / 2, y + height / 2)
    },
    [],
  )

  // Helper function to get resize handles
  const getResizeHandles = useCallback((element: CanvasElement) => {
    const handles = []
    const size = 8
    const x = element.x
    const y = element.y
    const w = element.width || 0
    const h = element.height || 0

    // Corner handles
    handles.push({ type: 'nw', x: x - size / 2, y: y - size / 2, width: size, height: size })
    handles.push({ type: 'ne', x: x + w - size / 2, y: y - size / 2, width: size, height: size })
    handles.push({ type: 'sw', x: x - size / 2, y: y + h - size / 2, width: size, height: size })
    handles.push({
      type: 'se',
      x: x + w - size / 2,
      y: y + h - size / 2,
      width: size,
      height: size,
    })

    // Edge handles
    handles.push({ type: 'n', x: x + w / 2 - size / 2, y: y - size / 2, width: size, height: size })
    handles.push({
      type: 's',
      x: x + w / 2 - size / 2,
      y: y + h - size / 2,
      width: size,
      height: size,
    })
    handles.push({
      type: 'e',
      x: x + w - size / 2,
      y: y + h / 2 - size / 2,
      width: size,
      height: size,
    })
    handles.push({ type: 'w', x: x - size / 2, y: y + h / 2 - size / 2, width: size, height: size })

    // Rotation handle
    handles.push({
      type: 'rotate',
      x: x + w / 2 - size / 2,
      y: y - 20 - size / 2,
      width: size,
      height: size,
    })

    return handles
  }, [])

  // Helper function to measure text dimensions
  const measureText = useCallback(
    (text: string, fontSize: number, fontFamily: string, fontWeight: string, fontStyle: string) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return { width: 0, height: fontSize }

      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
      const metrics = ctx.measureText(text)
      const width = metrics.width
      const height = fontSize * 1.2 // Approximate line height

      return { width, height }
    },
    [],
  )

  // Helper function to update text element dimensions
  const updateTextDimensions = useCallback(
    (element: CanvasElement) => {
      if (element.type !== 'text' && element.type !== 'text-variable') return element

      const text = element.text || element.variableName || ''
      if (!text) return element

      const { width, height } = measureText(
        text,
        element.fontSize || 24,
        element.fontFamily || 'Arial',
        element.fontWeight || 'normal',
        element.fontStyle || 'normal',
      )

      return {
        ...element,
        width: Math.max(width + 4, 20), // Add small padding and minimum width
        height: Math.max(height, 20), // Minimum height
      }
    },
    [measureText],
  )

  // Optimized text wrapping function
  const wrapText = useCallback(
    (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
      const words = text.split(' ')
      const lines: string[] = []
      let currentLine = ''

      for (const word of words) {
        const testLine = currentLine + word + ' '
        const metrics = ctx.measureText(testLine)

        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine.trim())
          currentLine = word + ' '
        } else {
          currentLine = testLine
        }
      }

      if (currentLine) {
        lines.push(currentLine.trim())
      }

      return lines
    },
    [],
  )

  // Optimized text drawing function
  const drawTextElement = useCallback(
    (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
      ctx.fillStyle = element.fill || '#000000'
      const fontWeight = element.fontWeight || 'normal'
      const fontStyle = element.fontStyle || 'normal'
      const fontSize = element.fontSize || 24
      const fontFamily = element.fontFamily || 'Arial'

      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'

      const text = element.text || ''
      const maxWidth = (element.width || 200) - 4
      const lineHeight = fontSize * 1.2

      // Optimized text wrapping
      const lines = wrapText(ctx, text, maxWidth)
      let y = element.y + 2

      for (const line of lines) {
        if (y + lineHeight > element.y + (element.height || 40)) break
        ctx.fillText(line, element.x + 2, y)
        y += lineHeight
      }
    },
    [wrapText],
  )

  // Helper function to draw shapes
  const drawShape = useCallback(
    (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
      const x = element.x
      const y = element.y
      const width = element.width || 100
      const height = element.height || 100
      const fillColor = element.fill || '#3b82f6'
      const strokeColor = element.stroke || '#1e40af'
      const strokeWidth = element.strokeWidth || 2

      ctx.fillStyle = fillColor
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth

      switch (element.shapeType) {
        case 'square':
          ctx.fillRect(x, y, width, height)
          ctx.strokeRect(x, y, width, height)
          break

        case 'circle':
          ctx.beginPath()
          const centerX = x + width / 2
          const centerY = y + height / 2
          const radius = Math.min(width, height) / 2
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
          break

        case 'triangle':
          ctx.beginPath()
          ctx.moveTo(x + width / 2, y) // Top point
          ctx.lineTo(x + width, y + height) // Bottom right
          ctx.lineTo(x, y + height) // Bottom left
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
          break

        case 'star':
          ctx.beginPath()
          const cx = x + width / 2
          const cy = y + height / 2
          const outerRadius = Math.min(width, height) / 2
          const innerRadius = outerRadius * 0.4
          const points = 5

          for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            const angle = (Math.PI * i) / points - Math.PI / 2
            const px = cx + Math.cos(angle) * radius
            const py = cy + Math.sin(angle) * radius

            if (i === 0) {
              ctx.moveTo(px, py)
            } else {
              ctx.lineTo(px, py)
            }
          }

          ctx.closePath()
          ctx.fill()
          ctx.stroke()
          break
      }
    },
    [],
  )

  // Optimized selection handles drawing
  const drawSelectionHandles = useCallback(
    (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
      // Only draw selection border for non-variable elements or when they're selected
      // For variable elements, we don't want double dotted lines
      if (element.type !== 'image-variable' && element.type !== 'text-variable') {
        // Selection border for regular elements
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.strokeRect(
          element.x - 2,
          element.y - 2,
          (element.width || 0) + 4,
          (element.height || 0) + 4,
        )
        ctx.setLineDash([])
      } else {
        // For variable elements, just draw a subtle highlight border
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 2
        ctx.setLineDash([])
        ctx.strokeRect(
          element.x - 1,
          element.y - 1,
          (element.width || 0) + 2,
          (element.height || 0) + 2,
        )
      }

      // Resize handles (always show these)
      const handles = getResizeHandles(element)
      handles.forEach((handle) => {
        ctx.fillStyle = handle.type === 'rotate' ? '#ef4444' : '#3b82f6'
        ctx.fillRect(handle.x, handle.y, handle.width, handle.height)
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1
        ctx.strokeRect(handle.x, handle.y, handle.width, handle.height)
      })

      // Rotation line
      const centerX = element.x + (element.width || 0) / 2
      const rotateHandleY = element.y - 20
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 1
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(centerX, element.y)
      ctx.lineTo(centerX, rotateHandleY)
      ctx.stroke()
    },
    [getResizeHandles],
  )

  // Draw alignment guides (Canva-style center lines)
  const drawAlignmentGuidesOnCanvas = useCallback(
    (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
      if (!alignmentUtilsRef.current) return

      alignmentUtilsRef.current.drawAlignmentGuides(
        ctx,
        { width: canvasWidth, height: canvasHeight },
        alignmentGuides,
      )
    },
    [alignmentGuides],
  )

  // Draw background layer (static - only redraws when background changes)
  const drawBackgroundLayer = useCallback(() => {
    const canvas = backgroundCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false }) // Performance optimization
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background with object-cover behavior
    if (backgroundImage) {
      drawBackgroundCover(ctx, backgroundImage, canvas.width, canvas.height)
    } else if (selectedTemplate.backgroundImage.startsWith('linear-gradient')) {
      // Draw gradient background
      drawGradientBackground(ctx, selectedTemplate.backgroundImage, canvas.width, canvas.height)
    } else {
      // Draw solid color background
      ctx.fillStyle = selectedTemplate.backgroundImage.startsWith('#')
        ? selectedTemplate.backgroundImage
        : '#f3f4f6'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }, [backgroundImage, selectedTemplate.backgroundImage, drawBackgroundCover, drawGradientBackground])

  // Draw content layer (elements)
  const drawContentLayer = useCallback(() => {
    const canvas = contentCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw elements
    elements.forEach((element) => {
      // Skip hidden elements early
      if (element.visible === false) return

      // Use switch for better performance than multiple if-else
      switch (element.type) {
        case 'image':
          const validImage = getValidImage(element)
          if (validImage) {
            drawRotatedElement(ctx, element, () => {
              drawImageWithRadius(
                ctx,
                validImage,
                element.x,
                element.y,
                element.width || 100,
                element.height || 100,
                element.borderRadius || 0,
              )
            })
          } else {
            drawRotatedElement(ctx, element, () => {
              drawImagePlaceholder(ctx, element)
            })
          }
          break

        case 'text':
          drawRotatedElement(ctx, element, () => {
            drawTextElement(ctx, element)
          })
          break

        case 'image-variable':
        case 'text-variable':
          drawRotatedElement(ctx, element, () => {
            drawDottedRectangle(ctx, element)
          })
          break

        case 'shape':
          drawRotatedElement(ctx, element, () => {
            drawShape(ctx, element)
          })
          break
      }
    })
  }, [
    elements,
    drawRotatedElement,
    drawImageWithRadius,
    drawImagePlaceholder,
    drawDottedRectangle,
    getValidImage,
    drawTextElement,
    drawShape,
  ])

  // Draw interaction layer (selection handles and alignment guides)
  const drawInteractionLayer = useCallback(() => {
    const canvas = interactionCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw alignment guides (when dragging or resizing)
    if (isDragging || isResizing) {
      drawAlignmentGuidesOnCanvas(ctx, canvas.width, canvas.height)
    }

    // Draw selection only for selected element
    if (selectedElementId && !isDragging && !isResizing && !isRotating) {
      const selectedElement = elements.find((el) => el.id === selectedElementId)
      if (selectedElement) {
        drawSelectionHandles(ctx, selectedElement)
      }
    }
  }, [
    isDragging,
    isResizing,
    isRotating,
    selectedElementId,
    elements,
    drawAlignmentGuidesOnCanvas,
    drawSelectionHandles,
  ])

  // Main draw function that coordinates all layers
  const drawCanvas = useCallback(() => {
    drawBackgroundLayer()
    drawContentLayer()
    drawInteractionLayer()
  }, [drawBackgroundLayer, drawContentLayer, drawInteractionLayer])

  // Optimized layer-specific redraws for better performance

  // Redraw background layer only when background changes
  useEffect(() => {
    drawBackgroundLayer()
  }, [drawBackgroundLayer])

  // Redraw content layer when elements change
  useEffect(() => {
    drawContentLayer()
  }, [drawContentLayer])

  // Redraw interaction layer when selection or interaction state changes
  useEffect(() => {
    drawInteractionLayer()
  }, [drawInteractionLayer])

  // Get element at position
  const getElementAtPosition = useCallback(
    (x: number, y: number): CanvasElement | null => {
      // Check elements in reverse order (top to bottom)
      for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i]

        // Skip hidden elements
        if (element.visible === false) continue

        if (
          x >= element.x &&
          x <= element.x + (element.width || 100) &&
          y >= element.y &&
          y <= element.y + (element.height || 100)
        ) {
          return element
        }
      }
      return null
    },
    [elements],
  )

  // Get resize handle at position
  const getResizeHandleAtPosition = useCallback(
    (x: number, y: number, element: CanvasElement): ResizeHandle => {
      const handles = getResizeHandles(element)
      for (const handle of handles) {
        if (
          x >= handle.x &&
          x <= handle.x + handle.width &&
          y >= handle.y &&
          y <= handle.y + handle.height
        ) {
          return handle.type as ResizeHandle
        }
      }
      return null
    },
    [getResizeHandles],
  )

  // Update the handleMouseDown function
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = interactionCanvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const currentTime = Date.now()

      setInitialMousePos({ x, y })

      // Cancel any pending debounced updates when starting new interaction
      cancelHistoryUpdate()

      // Check for double-click on text elements
      const clickedElement = getElementAtPosition(x, y)
      if (clickedElement && clickedElement.type === 'text') {
        // Only allow editing regular text elements
        const isDoubleClick =
          currentTime - lastClickTime < 500 && lastClickElement === clickedElement.id

        if (isDoubleClick) {
          e.preventDefault()
          e.stopPropagation()

          // Enter text editing mode
          setIsEditingText(true)
          setEditingElementId(clickedElement.id)
          setEditingText(clickedElement.text || '')

          // Calculate input position relative to the viewport
          const canvasRect = canvas.getBoundingClientRect()

          setTextInputPosition({
            x: canvasRect.left + clickedElement.x,
            y: canvasRect.top + clickedElement.y,
            width: Math.max(clickedElement.width || 150, 100),
            height: Math.max(clickedElement.height || 30, 25),
          })

          setLastClickTime(0) // Reset to prevent triple-click issues
          return
        }
      }

      setLastClickTime(currentTime)
      setLastClickElement(clickedElement?.id || null)

      // Rest of existing logic...
      // Check if clicking on selected element's handles
      if (selectedElementId) {
        const selectedElement = elements.find((el) => el.id === selectedElementId)
        if (selectedElement) {
          const handle = getResizeHandleAtPosition(x, y, selectedElement)
          if (handle) {
            if (handle === 'rotate') {
              setIsRotating(true)
            } else {
              setIsResizing(true)
              setResizeHandle(handle)
            }
            setInitialElementState({ ...selectedElement })
            return
          }
        }
      }

      // Check for element selection
      if (clickedElement) {
        console.log('🖱️ Starting drag on element:', {
          id: clickedElement.id,
          type: clickedElement.type,
          initialPosition: { x: clickedElement.x, y: clickedElement.y },
          dimensions: { width: clickedElement.width, height: clickedElement.height },
        })
        setInitialElementState({ ...clickedElement })
        onElementSelect(clickedElement.id)
        setIsDragging(true)
        setDragOffset({
          x: x - clickedElement.x,
          y: y - clickedElement.y,
        })
      } else {
        onElementSelect(null)
      }
    },
    [
      getElementAtPosition,
      getResizeHandleAtPosition,
      selectedElementId,
      elements,
      lastClickTime,
      lastClickElement,
      onElementSelect,
      cancelHistoryUpdate,
    ],
  )

  // Handle right-click context menu
  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      const canvas = interactionCanvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Check if right-clicking on an element
      const clickedElement = getElementAtPosition(x, y)
      if (clickedElement) {
        setContextMenuElementId(clickedElement.id)
        onElementSelect(clickedElement.id)
      } else {
        setContextMenuElementId(null)
      }
    },
    [getElementAtPosition, onElementSelect],
  )

  // Lazy load alignment utilities on first drag/resize
  const loadAlignmentUtils = useCallback(async () => {
    if (!alignmentUtilsRef.current) {
      alignmentUtilsRef.current = await import('../utils/alignment-guides')
    }
    return alignmentUtilsRef.current
  }, [])

  // Calculate and update alignment guides
  const updateAlignmentGuides = useCallback(
    async (element: CanvasElement) => {
      const canvas = contentCanvasRef.current // Use content canvas for dimensions
      if (!canvas) return

      const utils = await loadAlignmentUtils()
      const alignment = utils.calculateAlignment(
        {
          x: element.x,
          y: element.y,
          width: element.width || 0,
          height: element.height || 0,
        },
        { width: canvas.width, height: canvas.height },
        5, // 5px threshold
      )

      // Only update state if alignment changed (prevent unnecessary re-renders)
      setAlignmentGuides((prev) => {
        if (prev.showVertical !== alignment.showVertical || prev.showHorizontal !== alignment.showHorizontal) {
          return alignment
        }
        return prev
      })
    },
    [loadAlignmentUtils],
  )

  // Optimized handleMouseMove function with debounced history updates
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = interactionCanvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Throttle mouse move events for better performance
      if (Date.now() - lastMouseMoveTime.current < 16) return // ~60fps
      lastMouseMoveTime.current = Date.now()

      if (isRotating && selectedElementId && initialElementState) {
        const element = elements.find((el) => el.id === selectedElementId)
        if (element) {
          const centerX = element.x + (element.width || 0) / 2
          const centerY = element.y + (element.height || 0) / 2
          const angle = (Math.atan2(y - centerY, x - centerX) * 180) / Math.PI + 90
          const updates = { rotation: Math.round(angle) }

          // Update immediately for visual feedback
          onElementUpdate(selectedElementId, updates)

          // Store pending update for mouse up
          pendingUpdatesRef.current.set(selectedElementId, {
            ...pendingUpdatesRef.current.get(selectedElementId),
            ...updates,
          })
        }
      } else if (isResizing && selectedElementId && initialElementState && resizeHandle) {
        // Calculate resize updates inline to avoid dependency issues
        const deltaX = x - initialMousePos.x
        const deltaY = y - initialMousePos.y
        const element = initialElementState
        const updates: Partial<CanvasElement> = {}
        const isTextElement = element.type === 'text' || element.type === 'text-variable'

        // Define size constraints
        const MIN_WIDTH = 30
        const MIN_HEIGHT = 30
        const MAX_WIDTH = 2000
        const MAX_HEIGHT = 2000

        // Store original font size if text element (for scaling)
        const originalFontSize = element.fontSize || 24
        const originalWidth = element.width || 200
        const originalHeight = element.height || 40

        switch (resizeHandle) {
          case 'se':
            updates.width = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, (element.width || 0) + deltaX))
            if (element.aspectRatio && !isTextElement) {
              updates.height = Math.min(MAX_HEIGHT, updates.width / element.aspectRatio)
            } else {
              updates.height = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, (element.height || 0) + deltaY))
            }
            break
          case 'sw':
            const newWidthSW = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, (element.width || 0) - deltaX))
            updates.width = newWidthSW
            // Only update x if width actually changed (prevents disappearing)
            if (newWidthSW > MIN_WIDTH) {
              updates.x = element.x + ((element.width || 0) - newWidthSW)
            }
            if (element.aspectRatio && !isTextElement) {
              updates.height = Math.min(MAX_HEIGHT, updates.width / element.aspectRatio)
            } else {
              updates.height = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, (element.height || 0) + deltaY))
            }
            break
          case 'ne':
            updates.width = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, (element.width || 0) + deltaX))
            const newHeightNE = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, (element.height || 0) - deltaY))
            updates.height = newHeightNE
            // Only update y if height actually changed (prevents disappearing)
            if (newHeightNE > MIN_HEIGHT) {
              updates.y = element.y + ((element.height || 0) - newHeightNE)
            }
            if (element.aspectRatio && !isTextElement) {
              updates.height = Math.min(MAX_HEIGHT, updates.width / element.aspectRatio)
              updates.y = element.y + (element.height || 0) - updates.height
            }
            break
          case 'nw':
            const newWidthNW = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, (element.width || 0) - deltaX))
            const newHeightNW = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, (element.height || 0) - deltaY))
            updates.width = newWidthNW
            updates.height = newHeightNW
            // Only update position if size actually changed (prevents disappearing)
            if (newWidthNW > MIN_WIDTH) {
              updates.x = element.x + ((element.width || 0) - newWidthNW)
            }
            if (newHeightNW > MIN_HEIGHT) {
              updates.y = element.y + ((element.height || 0) - newHeightNW)
            }
            if (element.aspectRatio && !isTextElement) {
              updates.height = Math.min(MAX_HEIGHT, updates.width / element.aspectRatio)
              updates.y = element.y + (element.height || 0) - updates.height
            }
            break
          case 'e':
            updates.width = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, (element.width || 0) + deltaX))
            if (element.aspectRatio && !isTextElement) {
              updates.height = Math.min(MAX_HEIGHT, updates.width / element.aspectRatio)
            }
            break
          case 'w':
            const newWidthW = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, (element.width || 0) - deltaX))
            updates.width = newWidthW
            // Only update x if width actually changed (prevents disappearing)
            if (newWidthW > MIN_WIDTH) {
              updates.x = element.x + ((element.width || 0) - newWidthW)
            }
            if (element.aspectRatio && !isTextElement) {
              updates.height = Math.min(MAX_HEIGHT, updates.width / element.aspectRatio)
            }
            break
          case 'n':
            const newHeightN = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, (element.height || 0) - deltaY))
            updates.height = newHeightN
            // Only update y if height actually changed (prevents disappearing)
            if (newHeightN > MIN_HEIGHT) {
              updates.y = element.y + ((element.height || 0) - newHeightN)
            }
            break
          case 's':
            updates.height = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, (element.height || 0) + deltaY))
            break
        }

        // Scale font size for text elements based on resize
        if (isTextElement && updates.width && updates.height) {
          const widthScale = updates.width / originalWidth
          const heightScale = updates.height / originalHeight
          // Use average of both scales for more natural resizing
          const scale = (widthScale + heightScale) / 2
          updates.fontSize = Math.max(8, Math.min(72, Math.round(originalFontSize * scale)))
        }

        // Validate updates before applying - crucial to prevent disappearing elements
        const hasValidUpdates =
          (updates.width === undefined || (updates.width >= MIN_WIDTH && updates.width <= MAX_WIDTH)) &&
          (updates.height === undefined || (updates.height >= MIN_HEIGHT && updates.height <= MAX_HEIGHT)) &&
          (updates.x === undefined || (!isNaN(updates.x) && isFinite(updates.x))) &&
          (updates.y === undefined || (!isNaN(updates.y) && isFinite(updates.y)))

        if (!hasValidUpdates) {
          console.error('❌ Invalid resize updates detected - blocking update:', {
            updates,
            validations: {
              width: updates.width === undefined || (updates.width >= MIN_WIDTH && updates.width <= MAX_WIDTH),
              height: updates.height === undefined || (updates.height >= MIN_HEIGHT && updates.height <= MAX_HEIGHT),
              x: updates.x === undefined || (!isNaN(updates.x) && isFinite(updates.x)),
              y: updates.y === undefined || (!isNaN(updates.y) && isFinite(updates.y)),
            }
          })
          return
        }

        // Ensure we have all required properties for a valid element state
        if (updates.width !== undefined && updates.width < MIN_WIDTH) {
          updates.width = MIN_WIDTH
        }
        if (updates.height !== undefined && updates.height < MIN_HEIGHT) {
          updates.height = MIN_HEIGHT
        }

        console.log('✅ Valid resize updates:', {
          elementId: selectedElementId,
          handle: resizeHandle,
          updates,
        })

        // Update immediately for visual feedback
        onElementUpdate(selectedElementId, updates)

        // Update alignment guides for current position/size during resize
        const updatedElement = { ...element, ...updates }
        updateAlignmentGuides(updatedElement)

        // Store pending update for mouse up
        pendingUpdatesRef.current.set(selectedElementId, {
          ...pendingUpdatesRef.current.get(selectedElementId),
          ...updates,
        })
      } else if (isDragging && selectedElementId) {
        const element = elements.find((el) => el.id === selectedElementId)
        if (!element) {
          console.error('❌ Drag error: Element not found in elements array:', {
            selectedElementId,
            elementsCount: elements.length,
            elementIds: elements.map((el) => el.id),
          })
          return
        }

        const updates = {
          x: x - dragOffset.x,
          y: y - dragOffset.y,
        }

        console.log('🔄 Dragging element:', {
          id: selectedElementId,
          oldPosition: { x: element.x, y: element.y },
          newPosition: updates,
          mousePos: { x, y },
          dragOffset,
        })

        // Update immediately for visual feedback
        onElementUpdate(selectedElementId, updates)

        // Update alignment guides for current position
        const updatedElement = { ...element, ...updates }
        updateAlignmentGuides(updatedElement)

        // Store pending update for mouse up
        pendingUpdatesRef.current.set(selectedElementId, {
          ...pendingUpdatesRef.current.get(selectedElementId),
          ...updates,
        })
      }

      // Update cursor efficiently
      if (selectedElementId && !isDragging && !isResizing && !isRotating) {
        const selectedElement = elements.find((el) => el.id === selectedElementId)
        if (selectedElement) {
          const handle = getResizeHandleAtPosition(x, y, selectedElement)
          if (handle) {
            const cursors: Record<string, string> = {
              nw: 'nw-resize',
              ne: 'ne-resize',
              sw: 'sw-resize',
              se: 'se-resize',
              n: 'n-resize',
              s: 's-resize',
              e: 'e-resize',
              w: 'w-resize',
              rotate: 'grab',
            }
            canvas.style.cursor = cursors[handle] || 'default'
          } else {
            canvas.style.cursor = 'move'
          }
        } else {
          canvas.style.cursor = 'default'
        }
      }
    },
    [
      isRotating,
      isResizing,
      isDragging,
      selectedElementId,
      initialElementState,
      resizeHandle,
      initialMousePos,
      dragOffset,
      onElementUpdate,
      elements,
      getResizeHandleAtPosition,
      updateAlignmentGuides,
    ],
  )

  const handleMouseUp = useCallback(() => {
    // Cancel any pending debounced updates and execute immediately on mouse up
    if (selectedElementId && pendingUpdatesRef.current.has(selectedElementId)) {
      cancelHistoryUpdate()
      const pendingUpdates = pendingUpdatesRef.current.get(selectedElementId)
      if (pendingUpdates && initialElementState) {
        console.log('=== Mouse Up - Saving Element to History ===')
        console.log('Element ID:', selectedElementId)
        console.log('Pending updates:', pendingUpdates)

        // Find the current element in the elements array
        const element = elements.find((el) => el.id === selectedElementId)

        console.log('Current element from array:', element)
        console.log('Initial element state:', initialElementState)

        if (element) {
          // Element found - merge with pending updates
          const finalElement = {
            ...element,
            ...pendingUpdates,
          }
          console.log('Final element to save:', finalElement)
          onElementDragEnd(selectedElementId, finalElement)
        } else if (initialElementState) {
          // Element not found - use initial state as fallback to prevent disappearance
          console.warn('⚠️ Element not found in current elements array, using initial state as fallback')
          const finalElement = {
            ...initialElementState,
            ...pendingUpdates,
          }
          console.log('Fallback element to save:', finalElement)
          onElementDragEnd(selectedElementId, finalElement)
        } else {
          console.error('❌ Cannot save element - both current and initial state are missing!')
        }
      }
      pendingUpdatesRef.current.delete(selectedElementId)
    }

    // Clear alignment guides when interaction ends
    setAlignmentGuides({ showVertical: false, showHorizontal: false })

    setIsDragging(false)
    setIsResizing(false)
    setIsRotating(false)
    setResizeHandle(null)
    setInitialElementState(null)

    const canvas = interactionCanvasRef.current
    if (canvas) {
      canvas.style.cursor = 'default'
    }
  }, [selectedElementId, initialElementState, elements, onElementDragEnd, cancelHistoryUpdate])

  // Touch event handlers for mobile/tablet support (after mouse handlers)
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (e.touches.length === 1) {
        // Single touch - treat as mouse down
        const touch = e.touches[0]

        // Create a synthetic mouse event
        const syntheticEvent = {
          clientX: touch.clientX,
          clientY: touch.clientY,
          preventDefault: () => e.preventDefault(),
          stopPropagation: () => e.stopPropagation(),
        } as React.MouseEvent<HTMLCanvasElement>

        handleMouseDown(syntheticEvent)
      }
      // Prevent default to avoid scrolling while editing
      e.preventDefault()
    },
    [handleMouseDown],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (e.touches.length === 1) {
        // Single touch - treat as mouse move
        const touch = e.touches[0]

        // Create a synthetic mouse event
        const syntheticEvent = {
          clientX: touch.clientX,
          clientY: touch.clientY,
          preventDefault: () => e.preventDefault(),
          stopPropagation: () => e.stopPropagation(),
        } as React.MouseEvent<HTMLCanvasElement>

        handleMouseMove(syntheticEvent)
      }
      // Prevent default to avoid scrolling while editing
      e.preventDefault()
    },
    [handleMouseMove],
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      // Treat as mouse up
      handleMouseUp()
      // Prevent default to avoid ghost clicks
      e.preventDefault()
    },
    [handleMouseUp],
  )

  const handleTextEditComplete = useCallback(() => {
    if (editingElementId && editingText !== undefined) {
      onElementUpdate(editingElementId, {
        text: editingText,
      })
    }

    setIsEditingText(false)
    setEditingElementId(null)
    setEditingText('')
  }, [editingElementId, editingText, onElementUpdate])

  const handleTextEditCancel = useCallback(() => {
    setIsEditingText(false)
    setEditingElementId(null)
    setEditingText('')
  }, [])

  const handleTextInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation()

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleTextEditComplete()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleTextEditCancel()
      }
    },
    [handleTextEditComplete, handleTextEditCancel],
  )

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      cancelHistoryUpdate()
      cancelRedraw()
    }
  }, [cancelHistoryUpdate, cancelRedraw])

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading canvas...</p>
        </div>
      </div>
    )
  }

  const contextMenuElement = contextMenuElementId
    ? elements.find((el) => el.id === contextMenuElementId)
    : null

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="border-4 border-border/30 rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-900 ring-1 ring-black/5">
          <ContextMenu>
            <ContextMenuTrigger>
              {/* Multi-layer canvas stack for optimal performance */}
              <div className="relative inline-block">
                {/* Layer 1: Background (static) */}
                <canvas
                  ref={backgroundCanvasRef}
                  width={selectedTemplate.width}
                  height={selectedTemplate.height}
                  className="absolute top-0 left-0"
                  style={{ pointerEvents: 'none' }}
                />
                {/* Layer 2: Content (elements) */}
                <canvas
                  ref={contentCanvasRef}
                  width={selectedTemplate.width}
                  height={selectedTemplate.height}
                  className="absolute top-0 left-0"
                  style={{ pointerEvents: 'none' }}
                />
                {/* Layer 3: Interaction (selection handles, guides) */}
                <canvas
                  ref={interactionCanvasRef}
                  width={selectedTemplate.width}
                  height={selectedTemplate.height}
                  className="cursor-pointer relative"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onContextMenu={handleContextMenu}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                  style={{ touchAction: 'none' }}
                />
              </div>
            </ContextMenuTrigger>
            {contextMenuElement && (
              <ContextMenuContent className="w-48">
                <ContextMenuItem
                  onClick={() => {
                    if (contextMenuElement) {
                      onMoveToFront(contextMenuElement.id)
                    }
                    setContextMenuElementId(null)
                  }}
                >
                  Bring to Front
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    if (contextMenuElement) {
                      onMoveToBack(contextMenuElement.id)
                    }
                    setContextMenuElementId(null)
                  }}
                >
                  Send to Back
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    if (contextMenuElement) {
                      onMoveForward(contextMenuElement.id)
                    }
                    setContextMenuElementId(null)
                  }}
                  disabled={
                    !contextMenuElement ||
                    elements.findIndex((el) => el.id === contextMenuElement.id) ===
                      elements.length - 1
                  }
                >
                  Move Up
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    if (contextMenuElement) {
                      onMoveBackward(contextMenuElement.id)
                    }
                    setContextMenuElementId(null)
                  }}
                  disabled={
                    !contextMenuElement ||
                    elements.findIndex((el) => el.id === contextMenuElement.id) === 0
                  }
                >
                  Move Down
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onClick={() => {
                    if (contextMenuElement) {
                      onToggleVisibility(contextMenuElement.id)
                    }
                    setContextMenuElementId(null)
                  }}
                >
                  {contextMenuElement?.visible === false ? 'Show' : 'Hide'}
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    if (contextMenuElement) {
                      onDeleteElement(contextMenuElement.id)
                    }
                    setContextMenuElementId(null)
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            )}
          </ContextMenu>
        </div>
      </div>

      {/* Text Editing Overlay */}
      {isEditingText && editingElementId && (
        <div
          style={{
            position: 'fixed',
            left: textInputPosition.x,
            top: textInputPosition.y,
            width: textInputPosition.width,
            minHeight: textInputPosition.height,
            zIndex: 1000,
            pointerEvents: 'auto',
          }}
        >
          <input
            type="text"
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            onKeyDown={handleTextInputKeyDown}
            onBlur={handleTextEditComplete}
            autoFocus
            className="w-full h-full px-2 py-1 border-2 border-primary rounded bg-background/95"
            style={{
              fontSize: (() => {
                const element = elements.find((el) => el.id === editingElementId)
                return `${element?.fontSize || 24}px`
              })(),
              fontFamily: (() => {
                const element = elements.find((el) => el.id === editingElementId)
                return element?.fontFamily || 'Arial'
              })(),
              fontWeight: (() => {
                const element = elements.find((el) => el.id === editingElementId)
                return element?.fontWeight || 'normal'
              })(),
              fontStyle: (() => {
                const element = elements.find((el) => el.id === editingElementId)
                return element?.fontStyle || 'normal'
              })(),
              color: (() => {
                const element = elements.find((el) => el.id === editingElementId)
                return element?.fill || '#000000'
              })(),
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {selectedElementId && (
        <div className="text-center text-sm text-muted-foreground">
          <div className="mb-2">
            Selected:{' '}
            {(() => {
              const element = elements.find((el) => el.id === selectedElementId)
              if (!element) return 'Unknown'
              switch (element.type) {
                case 'text':
                  return 'Text Element'
                case 'image':
                  return 'Image Element'
                case 'text-variable':
                  return `Text Variable: ${element.variableName}`
                case 'image-variable':
                  return `Image Variable: ${element.variableName}`
                case 'shape':
                  return `Shape: ${element.shapeType?.charAt(0).toUpperCase()}${element.shapeType?.slice(1)}`
                default:
                  return 'Element'
              }
            })()}
          </div>
          <div className="text-xs text-muted-foreground/80 mb-2">
            Layer: {elements.findIndex((el) => el.id === selectedElementId) + 1} of{' '}
            {elements.length}
          </div>
          <div className="text-xs">
            <div>• Drag to move • Drag corners to resize • Drag red handle to rotate</div>
            <div>• Right-click for more options</div>
            <div className="text-primary">
              • History updates debounced to 1 second for performance
            </div>
            {(() => {
              const element = elements.find((el) => el.id === selectedElementId)
              if (element?.type === 'text') {
                return <div>• Double-click to edit text</div>
              }
              return null
            })()}
          </div>
        </div>
      )}
    </div>
  )
})

export default CanvasEditor
