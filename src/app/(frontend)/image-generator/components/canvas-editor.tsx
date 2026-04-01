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

  // Debounced history update - configurable delay (default 1000ms as requested)
  const [debouncedHistoryUpdate, cancelHistoryUpdate] = useDebounce(
    (elementId: string, updates: Partial<CanvasElement>) => {
      console.log('Debounced history update triggered for element:', elementId)
      onElementDragEnd(elementId, { ...elements.find((el) => el.id === elementId), ...updates })
    },
    1000, // 1 second as requested
  )

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

    // Check if backgroundImage is a color (starts with #) or an image URL
    if (selectedTemplate.backgroundImage.startsWith('#')) {
      // It's a color, not an image
      setBackgroundImage(null)
    } else {
      // It's an image URL
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        setBackgroundImage(img)
      }
      img.onerror = () => {
        console.error('Failed to load background image')
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
    } else {
      // Draw solid color background
      ctx.fillStyle = selectedTemplate.backgroundImage.startsWith('#')
        ? selectedTemplate.backgroundImage
        : '#f3f4f6'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }, [backgroundImage, selectedTemplate.backgroundImage, drawBackgroundCover])

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

          // Store pending update for debounced history
          pendingUpdatesRef.current.set(selectedElementId, {
            ...pendingUpdatesRef.current.get(selectedElementId),
            ...updates,
          })

          // Trigger debounced history update
          debouncedHistoryUpdate(selectedElementId, updates)
        }
      } else if (isResizing && selectedElementId && initialElementState && resizeHandle) {
        // Calculate resize updates inline to avoid dependency issues
        const deltaX = x - initialMousePos.x
        const deltaY = y - initialMousePos.y
        const element = initialElementState
        const updates: Partial<CanvasElement> = {}
        const isTextElement = element.type === 'text' || element.type === 'text-variable'

        switch (resizeHandle) {
          case 'se':
            updates.width = Math.max(20, (element.width || 0) + deltaX)
            if (element.aspectRatio && !isTextElement) {
              updates.height = updates.width / element.aspectRatio
            } else {
              updates.height = Math.max(20, (element.height || 0) + deltaY)
            }
            break
          case 'sw':
            updates.width = Math.max(20, (element.width || 0) - deltaX)
            updates.x = element.x + deltaX
            if (element.aspectRatio && !isTextElement) {
              updates.height = updates.width / element.aspectRatio
            } else {
              updates.height = Math.max(20, (element.height || 0) + deltaY)
            }
            break
          case 'ne':
            updates.width = Math.max(20, (element.width || 0) + deltaX)
            updates.y = element.y + deltaY
            if (element.aspectRatio && !isTextElement) {
              updates.height = updates.width / element.aspectRatio
              updates.y = element.y + (element.height || 0) - updates.height
            } else {
              updates.height = Math.max(20, (element.height || 0) - deltaY)
            }
            break
          case 'nw':
            updates.width = Math.max(20, (element.width || 0) - deltaX)
            updates.x = element.x + deltaX
            if (element.aspectRatio && !isTextElement) {
              updates.height = updates.width / element.aspectRatio
              updates.y = element.y + (element.height || 0) - updates.height
            } else {
              updates.height = Math.max(20, (element.height || 0) - deltaY)
              updates.y = element.y + deltaY
            }
            break
          case 'e':
            updates.width = Math.max(20, (element.width || 0) + deltaX)
            if (element.aspectRatio && !isTextElement) {
              updates.height = updates.width / element.aspectRatio
            }
            break
          case 'w':
            updates.width = Math.max(20, (element.width || 0) - deltaX)
            updates.x = element.x + deltaX
            if (element.aspectRatio && !isTextElement) {
              updates.height = updates.width / element.aspectRatio
            }
            break
          case 'n':
            updates.height = Math.max(20, (element.height || 0) - deltaY)
            updates.y = element.y + deltaY
            break
          case 's':
            updates.height = Math.max(20, (element.height || 0) + deltaY)
            break
        }

        // Update immediately for visual feedback
        onElementUpdate(selectedElementId, updates)

        // Update alignment guides for current position/size during resize
        const updatedElement = { ...element, ...updates }
        updateAlignmentGuides(updatedElement)

        // Store pending update for debounced history
        pendingUpdatesRef.current.set(selectedElementId, {
          ...pendingUpdatesRef.current.get(selectedElementId),
          ...updates,
        })

        // Trigger debounced history update
        debouncedHistoryUpdate(selectedElementId, updates)
      } else if (isDragging && selectedElementId) {
        const element = elements.find((el) => el.id === selectedElementId)
        if (!element) return

        const updates = {
          x: x - dragOffset.x,
          y: y - dragOffset.y,
        }

        // Update immediately for visual feedback
        onElementUpdate(selectedElementId, updates)

        // Update alignment guides for current position
        const updatedElement = { ...element, ...updates }
        updateAlignmentGuides(updatedElement)

        // Store pending update for debounced history
        pendingUpdatesRef.current.set(selectedElementId, {
          ...pendingUpdatesRef.current.get(selectedElementId),
          ...updates,
        })

        // Trigger debounced history update
        debouncedHistoryUpdate(selectedElementId, updates)
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
      debouncedHistoryUpdate,
      updateAlignmentGuides,
    ],
  )

  const handleMouseUp = useCallback(() => {
    // Cancel any pending debounced updates and execute immediately on mouse up
    if (selectedElementId && pendingUpdatesRef.current.has(selectedElementId)) {
      cancelHistoryUpdate()
      const pendingUpdates = pendingUpdatesRef.current.get(selectedElementId)
      if (pendingUpdates && initialElementState) {
        console.log('Immediate history update on mouse up for element:', selectedElementId)
        onElementDragEnd(selectedElementId, {
          ...elements.find((el) => el.id === selectedElementId),
          ...pendingUpdates,
        })
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
        <div className="border border-border rounded-lg overflow-hidden shadow-lg bg-card">
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
