'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  MenubarRadioGroup,
  MenubarRadioItem,
} from './components/ui/menubar'
import { Button } from '@/components/ui/button'
import CanvasEditor from './components/canvas-editor'
import LayersPanel from './components/layers-panel'
import FormattingToolbar from './components/formatting-toolbar'
import BackgroundToolbar from './components/background-toolbar'
import type { CanvasElement, Template } from '@/components/canvas/types/canvas-element'
import { IMAGE_VARIABLES, TEXT_VARIABLES } from '@/components/canvas/types/canvas-element'
import { restoreTemplateElements, type LoadedTemplate } from './utils/template-restoration'
import { useHistory } from './hooks/use-history'
import { useImageCache } from './hooks/use-image-cache'
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts'
import { Save } from 'lucide-react'
import Link from 'next/link'
import { useToast } from './hooks/use-toast'
import { Toaster } from './components/ui/toaster'

const templates: Template[] = [
  {
    id: 'linkedin-post',
    name: 'LinkedIn Post',
    backgroundImage: '#ffffff',
    width: 600,
    height: 600,
  },
  {
    id: 'facebook-post-square',
    name: 'Facebook Post Square',
    backgroundImage: '#ffffff',
    width: 540,
    height: 540,
  },
  {
    id: 'facebook-post-landscape',
    name: 'Facebook Post Landscape',
    backgroundImage: '#ffffff',
    width: 600,
    height: 315,
  },
  {
    id: 'instagram-post-square',
    name: 'Instagram Post Square',
    backgroundImage: '#ffffff',
    width: 540,
    height: 540,
  },
  {
    id: 'story',
    name: 'Instagram/Facebook/TikTok Story',
    backgroundImage: '#ffffff',
    width: 540,
    height: 960,
  },
]

export default function ImageTemplateGenerator() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Edit mode: Check if we're editing an existing template
  const templateId = searchParams.get('templateId')
  const [editMode] = useState<{
    mode: 'create' | 'edit';
    templateId?: string;
    templateName?: string;
    originalBackgroundImageId?: number;
    originalPreviewImageId?: number;
  }>(
    templateId ? { mode: 'edit', templateId } : { mode: 'create' }
  )

  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0])
  const imageInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)
  const { currentState, canUndo, canRedo, pushState, undo, redo, clearHistory } = useHistory(
    [],
    null,
  )
  const { loadImage, getImage } = useImageCache()
  const { toast } = useToast()

  // Separate current elements state for real-time updates during dragging
  const [currentElements, setCurrentElements] = useState<CanvasElement[]>([])
  const [currentSelectedElementId, setCurrentSelectedElementId] = useState<string | null>(null)

  // Save/Load template states
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [saveTemplateName, setSaveTemplateName] = useState('')
  const [saveUsageType, setSaveUsageType] = useState<'participant' | 'partner' | 'both'>(
    'participant',
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [savedTemplates, setSavedTemplates] = useState<any[]>([])

  // Add memoization for expensive operations:
  const selectedElement = useMemo(
    () => currentElements.find((el) => el.id === currentSelectedElementId) ?? null,
    [currentElements, currentSelectedElementId],
  )

  // Keyboard shortcuts handlers
  const handleUndo = useCallback(() => {
    console.log('Undo handler called, canUndo:', canUndo)
    if (canUndo) {
      const previousState = undo()
      if (previousState) {
        console.log('Undo successful, restoring state:', previousState)
        // State will be synced via useEffect
      }
    }
  }, [undo, canUndo])

  const handleRedo = useCallback(() => {
    console.log('Redo handler called, canRedo:', canRedo)
    if (canRedo) {
      const nextState = redo()
      if (nextState) {
        console.log('Redo successful, restoring state:', nextState)
        // State will be synced via useEffect
      }
    }
  }, [redo, canRedo])

  const handleDeleteSelected = useCallback(() => {
    console.log('Delete selected called, selectedId:', currentSelectedElementId)
    if (currentSelectedElementId) {
      deleteElement(currentSelectedElementId)
    }
  }, [currentSelectedElementId])

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onDelete: handleDeleteSelected,
    canUndo,
    canRedo,
    hasSelection: !!currentSelectedElementId,
  })

  // Optimize template change handler:
  const handleTemplateChange = useCallback(
    (templateId: string) => {
      const template = templates.find((t) => t.id === templateId)
      if (template && template.id !== selectedTemplate.id) {
        setSelectedTemplate(template)
        const newElements: CanvasElement[] = []
        setCurrentElements(newElements)
        setCurrentSelectedElementId(null)
        pushState(newElements, null)
      }
    },
    [selectedTemplate.id, pushState],
  )

  // Sync with history state - FIXED to properly handle undo/redo
  useEffect(() => {
    console.log('Syncing with history state:', currentState)

    // Only update if the state is actually different to avoid infinite loops
    const elementsChanged =
      currentElements.length !== currentState.elements.length ||
      currentElements.some((element, index) => {
        const historyElement = currentState.elements[index]
        return (
          !historyElement ||
          element.id !== historyElement.id ||
          element.x !== historyElement.x ||
          element.y !== historyElement.y ||
          element.width !== historyElement.width ||
          element.height !== historyElement.height ||
          element.rotation !== historyElement.rotation ||
          element.text !== historyElement.text ||
          element.visible !== historyElement.visible
        )
      })

    const selectionChanged = currentSelectedElementId !== currentState.selectedElementId

    if (elementsChanged || selectionChanged) {
      console.log('Updating current state from history')
      setCurrentElements(currentState.elements)
      setCurrentSelectedElementId(currentState.selectedElementId)
    }
  }, [currentState]) // Removed currentElements and currentSelectedElementId from deps to avoid loops

  // Restore images from cache when elements change
  useEffect(() => {
    const restoreImages = async () => {
      const elementsToRestore = currentElements.filter(
        (element) => element.type === 'image' && element.imageData && !element.image,
      )

      if (elementsToRestore.length === 0) return

      const updatedElements = await Promise.all(
        currentElements.map(async (element) => {
          if (element.type === 'image' && element.imageData && !element.image) {
            try {
              const cachedImage = getImage(element.imageData.src)
              if (cachedImage) {
                return { ...element, image: cachedImage }
              } else {
                const loadedImage = await loadImage(element.imageData.src)
                return { ...element, image: loadedImage }
              }
            } catch (error) {
              console.error('Failed to restore image:', error)
              return element
            }
          }
          return element
        }),
      )

      // Check if there are actual changes
      const hasChanges = updatedElements.some((element, index) => {
        const original = currentElements[index]
        return original && element.image !== original.image
      })

      if (hasChanges) {
        setCurrentElements(updatedElements)
      }
    }

    restoreImages()
  }, [currentElements, loadImage, getImage])

  // Optimize image upload with better error handling:
  const handleImageUpload = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File',
          description: 'Please select a valid image file.',
          variant: 'destructive',
        })
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast({
          title: 'File Too Large',
          description: 'Image file is too large. Please select a file smaller than 10MB.',
          variant: 'destructive',
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'

        img.onload = () => {
          try {
            const aspectRatio = img.width / img.height
            const defaultSize = 100
            const width = defaultSize
            const height = defaultSize / aspectRatio

            const newElement: CanvasElement = {
              id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'image',
              x: 50,
              y: 50,
              width: width,
              height: height,
              image: img,
              imageData: {
                src: e.target?.result as string,
                width: img.width,
                height: img.height,
              },
              draggable: true,
              visible: true,
              rotation: 0,
              aspectRatio: aspectRatio,
              originalWidth: img.width,
              originalHeight: img.height,
            }

            const newElements = [...currentElements, newElement]
            setCurrentElements(newElements)
            setCurrentSelectedElementId(null)
            pushState(newElements, null)
          } catch (error) {
            console.error('Error processing image:', error)
            toast({
              title: 'Processing Error',
              description: 'Failed to process image. Please try again.',
              variant: 'destructive',
            })
          }
        }

        img.onerror = () => {
          toast({
            title: 'Load Error',
            description: 'Failed to load image. Please try a different file.',
            variant: 'destructive',
          })
        }

        img.src = e.target?.result as string
      }

      reader.onerror = () => {
        toast({
          title: 'Read Error',
          description: 'Failed to read file. Please try again.',
          variant: 'destructive',
        })
      }

      reader.readAsDataURL(file)
    },
    [currentElements, pushState, toast],
  )

  const handleBackgroundUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        setSelectedTemplate((prev) => ({
          ...prev,
          backgroundImage: e.target?.result as string,
        }))
      }
      img.onerror = () => {
        toast({
          title: 'Load Error',
          description: 'Failed to load background image. Please try a different file.',
          variant: 'destructive',
        })
      }
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      toast({
        title: 'Read Error',
        description: 'Failed to read file. Please try again.',
        variant: 'destructive',
      })
    }
    reader.readAsDataURL(file)
  }

  const addTextElement = () => {
    const text = 'Your Name Here'
    const fontSize = 24
    const fontFamily = 'Arial'
    const fontWeight = 'normal'
    const fontStyle = 'normal'

    const newElement: CanvasElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 100,
      y: 100,
      text: text,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fontWeight: fontWeight,
      fontStyle: fontStyle,
      fill: '#000000',
      draggable: true,
      visible: true,
      rotation: 0,
      width: 200, // Fixed initial width
      height: 40, // Fixed initial height
    }
    const newElements = [...currentElements, newElement]
    setCurrentElements(newElements)
    setCurrentSelectedElementId(null)
    pushState(newElements, null)
  }

  const addTextVariable = (variableType: string, variableName: string) => {
    const fontSize = 16
    const fontFamily = 'Arial'
    const fontWeight = 'normal'
    const fontStyle = 'normal'

    const newElement: CanvasElement = {
      id: `text-variable-${Date.now()}`,
      type: 'text-variable',
      x: 100,
      y: 100,
      width: 200,
      height: 40,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fontWeight: fontWeight,
      fontStyle: fontStyle,
      fill: '#000000',
      draggable: true,
      visible: true,
      rotation: 0,
      variableType,
      variableName,
    }
    const newElements = [...currentElements, newElement]
    setCurrentElements(newElements)
    setCurrentSelectedElementId(null)
    pushState(newElements, null)
  }

  const addImageVariable = (variableType: string, variableName: string) => {
    const newElement: CanvasElement = {
      id: `image-variable-${Date.now()}`,
      type: 'image-variable',
      x: 50,
      y: 50,
      width: 150,
      height: 100,
      draggable: true,
      visible: true,
      rotation: 0,
      variableType,
      variableName,
      aspectRatio: 1.5, // Default aspect ratio for image variables
    }
    const newElements = [...currentElements, newElement]
    setCurrentElements(newElements)
    setCurrentSelectedElementId(null)
    pushState(newElements, null)
  }

  // Real-time element update (for dragging, resizing, etc.)
  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    const newElements = currentElements.map((el) => {
      if (el.id === id) {
        const updatedElement = { ...el, ...updates }

        // Maintain aspect ratio for images and image variables when resizing
        if (
          (el.type === 'image' || el.type === 'image-variable') &&
          el.aspectRatio &&
          (updates.width || updates.height)
        ) {
          if (updates.width && !updates.height) {
            updatedElement.height = updates.width / el.aspectRatio
          } else if (updates.height && !updates.width) {
            updatedElement.width = updates.height * el.aspectRatio
          }
        }

        return updatedElement
      }
      return el
    })

    // Always update current elements for real-time feedback
    setCurrentElements(newElements)

    // Only push to history for non-dragging operations
    if (updates.x === undefined && updates.y === undefined) {
      pushState(newElements, currentSelectedElementId)
    }
  }

  // Save state after drag/resize operations complete
  const handleElementDragEnd = (id: string, updates: Partial<CanvasElement>) => {
    const newElements = currentElements.map((el) => (el.id === id ? { ...el, ...updates } : el))
    setCurrentElements(newElements)
    pushState(newElements, currentSelectedElementId)
  }

  const deleteElement = useCallback(
    (id: string) => {
      console.log('Deleting element:', id)
      const newElements = currentElements.filter((el) => el.id !== id)
      setCurrentElements(newElements)
      setCurrentSelectedElementId(null)
      pushState(newElements, null)
    },
    [currentElements, pushState],
  )

  const resetCanvas = () => {
    setCurrentElements([])
    setCurrentSelectedElementId(null)
    clearHistory()
  }

  // Layer control functions
  const moveToFront = (id: string) => {
    const element = currentElements.find((el) => el.id === id)
    if (!element) return
    const filtered = currentElements.filter((el) => el.id !== id)
    const newElements = [...filtered, element]
    setCurrentElements(newElements)
    pushState(newElements, currentSelectedElementId)
  }

  const moveToBack = (id: string) => {
    const element = currentElements.find((el) => el.id === id)
    if (!element) return
    const filtered = currentElements.filter((el) => el.id !== id)
    const newElements = [element, ...filtered]
    setCurrentElements(newElements)
    pushState(newElements, currentSelectedElementId)
  }

  const moveForward = (id: string) => {
    const currentIndex = currentElements.findIndex((el) => el.id === id)
    if (currentIndex === -1 || currentIndex === currentElements.length - 1) return

    const newElements = [...currentElements]
    const element = newElements[currentIndex]
    newElements[currentIndex] = newElements[currentIndex + 1]
    newElements[currentIndex + 1] = element
    setCurrentElements(newElements)
    pushState(newElements, currentSelectedElementId)
  }

  const moveBackward = (id: string) => {
    const currentIndex = currentElements.findIndex((el) => el.id === id)
    if (currentIndex === -1 || currentIndex === 0) return

    const newElements = [...currentElements]
    const element = newElements[currentIndex]
    newElements[currentIndex] = newElements[currentIndex - 1]
    newElements[currentIndex - 1] = element
    setCurrentElements(newElements)
    pushState(newElements, currentSelectedElementId)
  }

  const toggleVisibility = (id: string) => {
    const newElements = currentElements.map((el) =>
      el.id === id ? { ...el, visible: el.visible !== false ? false : true } : el,
    )
    setCurrentElements(newElements)
    pushState(newElements, currentSelectedElementId)
  }

  const handleElementSelect = (id: string | null) => {
    setCurrentSelectedElementId(id)
    pushState(currentElements, id)
  }

  // Add performance monitoring for development
  const performanceMonitor = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Elements count:', currentElements.length)
      console.log('History size:', canUndo ? 'Available' : 'Empty')
    }
  }, [currentElements.length, canUndo])

  useEffect(() => {
    performanceMonitor()
  }, [performanceMonitor])

  // Load template if in edit mode
  useEffect(() => {
    if (editMode.mode === 'edit' && editMode.templateId) {
      const loadTemplate = async () => {
        try {
          const response = await fetch('/api/load-image-templates', {
            credentials: 'include',
          })

          if (!response.ok) {
            throw new Error('Failed to load templates')
          }

          const result = (await response.json()) as { templates: any[] }
          const template = result.templates?.find((t) => String(t.id) === editMode.templateId)

          if (template) {
            console.log('Loading template for editing:', template.name)

            // Store original IDs for relationships before loading
            editMode.templateName = template.name
            editMode.originalBackgroundImageId = template.backgroundImageId
            editMode.originalPreviewImageId = template.previewImageId

            await handleApplyTemplate(template)
          } else {
            toast({
              title: 'Template Not Found',
              description: 'The template you are trying to edit could not be found.',
              variant: 'destructive',
            })
            router.push('/dash/assets/image-templates')
          }
        } catch (error) {
          console.error('Failed to load template:', error)
          toast({
            title: 'Load Failed',
            description: 'Failed to load template for editing.',
            variant: 'destructive',
          })
        }
      }

      loadTemplate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode.mode, editMode.templateId])

  // Save template handler
  const handleSaveTemplate = async () => {
    // In edit mode, skip the dialog and save directly
    if (editMode.mode === 'edit') {
      await saveTemplateToServer()
      return
    }

    // In create mode, show dialog first
    if (!saveTemplateName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a template name',
        variant: 'destructive',
      })
      return
    }

    await saveTemplateToServer()
  }

  // Actual save logic extracted to a separate function
  const saveTemplateToServer = async () => {
    setIsSaving(true)

    // Deselect any selected element before taking screenshot
    const previousSelectedElementId = currentSelectedElementId
    setCurrentSelectedElementId(null)

    // Wait for the next frame to ensure the canvas has been redrawn without selection
    await new Promise((resolve) => setTimeout(resolve, 50))

    try {
      // Get canvas preview as base64 with compression - composite all layers
      const canvases = document.querySelectorAll<HTMLCanvasElement>('.relative.inline-block canvas')
      let previewBase64: string | undefined

      if (canvases.length === 3) {
        // Create a composite canvas from all layers (excluding interaction layer)
        const compositeCanvas = document.createElement('canvas')
        compositeCanvas.width = selectedTemplate.width
        compositeCanvas.height = selectedTemplate.height
        const compositeCtx = compositeCanvas.getContext('2d', { alpha: false })

        if (compositeCtx) {
          // Draw background and content layers
          compositeCtx.drawImage(canvases[0], 0, 0) // Background
          compositeCtx.drawImage(canvases[1], 0, 0) // Content

          // Create a smaller preview (max 800px width) to reduce payload size
          const maxWidth = 800
          const scale = Math.min(1, maxWidth / compositeCanvas.width)

          if (scale < 1) {
            // Create a temporary canvas for resizing
            const tempCanvas = document.createElement('canvas')
            tempCanvas.width = compositeCanvas.width * scale
            tempCanvas.height = compositeCanvas.height * scale
            const ctx = tempCanvas.getContext('2d')

            if (ctx) {
              ctx.drawImage(compositeCanvas, 0, 0, tempCanvas.width, tempCanvas.height)
              // Use JPEG with quality 0.8 for better compression
              previewBase64 = tempCanvas.toDataURL('image/jpeg', 0.8)
            }
          } else {
            // Use JPEG with quality 0.8 for better compression
            previewBase64 = compositeCanvas.toDataURL('image/jpeg', 0.8)
          }
        }
      }

      // Prepare template data
      const templateData: any = {
        name: editMode.mode === 'edit' ? editMode.templateName : saveTemplateName,
        usageType: saveUsageType,
        width: selectedTemplate.width,
        height: selectedTemplate.height,
        backgroundColor: '#ffffff',
        elements: currentElements,
      }

      // Handle backgroundImage based on mode
      if (editMode.mode === 'edit') {
        // In edit mode, only send backgroundImage if it's been changed (is base64)
        // Otherwise, keep the original ID
        if (selectedTemplate.backgroundImage.startsWith('data:')) {
          templateData.backgroundImage = selectedTemplate.backgroundImage
        } else if (editMode.originalBackgroundImageId) {
          templateData.backgroundImage = editMode.originalBackgroundImageId
        }
      } else {
        // In create mode, always send the backgroundImage
        templateData.organization = '' // Will be auto-populated from user session in API
        templateData.backgroundImage = selectedTemplate.backgroundImage
        templateData.previewImageBase64 = previewBase64
      }

      // Only add preview in edit mode if we have a new one
      if (editMode.mode === 'edit' && previewBase64) {
        templateData.previewImageBase64 = previewBase64
      } else if (editMode.mode === 'create') {
        templateData.previewImageBase64 = previewBase64
      }

      // Log template dimensions and element coordinates for debugging alignment
      console.log('📐 Template dimensions:', {
        mode: editMode.mode,
        width: selectedTemplate.width,
        height: selectedTemplate.height,
        elementCount: currentElements.length,
        elementSample: currentElements.slice(0, 2).map((el) => ({
          type: el.type,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
        })),
      })

      // Call appropriate API based on mode
      const apiUrl = editMode.mode === 'edit'
        ? `/api/image-templates/${editMode.templateId}`
        : '/api/save-image-template'
      const method = editMode.mode === 'edit' ? 'PATCH' : 'POST'

      console.log(`${editMode.mode === 'edit' ? 'Updating' : 'Saving'} template:`, {
        mode: editMode.mode,
        url: apiUrl,
        name: templateData.name,
        usageType: templateData.usageType,
        width: templateData.width,
        height: templateData.height,
        backgroundImage: typeof templateData.backgroundImage === 'string'
          ? templateData.backgroundImage.substring(0, 50) + '...'
          : templateData.backgroundImage,
        elementsCount: templateData.elements.length,
        elementTypes: templateData.elements.map((el) => ({
          type: el.type,
          id: el.id,
          variableName: el.variableName,
        })),
        hasPreview: !!previewBase64,
      })

      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(templateData),
      })

      if (!response.ok) {
        const error = (await response.json()) as { error?: string }
        throw new Error(error.error || `Failed to ${editMode.mode === 'edit' ? 'update' : 'save'} template`)
      }

      const result = (await response.json()) as { template: { name: string } }
      toast({
        title: 'Success',
        description: `Template "${result.template.name}" ${editMode.mode === 'edit' ? 'updated' : 'saved'} successfully!`,
      })

      // Reset form
      setSaveTemplateName('')
      setShowSaveDialog(false)

      // Redirect to image templates page
      router.push('/dash/assets/image-templates')
    } catch (error) {
      console.error('Save template error:', error)
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Failed to save template',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
      // Restore the previous selection after screenshot is taken
      setCurrentSelectedElementId(previousSelectedElementId)
    }
  }

  // Load templates handler
  const handleLoadTemplates = async () => {
    setIsLoading(true)
    setShowLoadDialog(true)
    try {
      const response = await fetch('/api/load-image-templates', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to load templates')
      }

      const result = (await response.json()) as { templates: any[] }
      setSavedTemplates(result.templates || [])
    } catch (error) {
      console.error('Load templates error:', error)
      toast({
        title: 'Load Failed',
        description: 'Failed to load templates',
        variant: 'destructive',
      })
      setShowLoadDialog(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Apply loaded template
  // Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2, 5.3, 5.4, 6.3, 6.4
  const handleApplyTemplate = async (template: LoadedTemplate) => {
    console.log('Loading template:', template.name)

    // 1. Restore canvas dimensions and background
    // Requirements: 5.1, 5.2, 5.3, 5.4
    setSelectedTemplate({
      id: `loaded-${template.id}`,
      name: template.name,
      // Use backgroundImage if present, otherwise use backgroundColor or empty string
      backgroundImage: template.backgroundImage || template.backgroundColor || '',
      width: template.width,
      height: template.height,
    })

    // 2. Restore elements using the template restoration utility
    // Requirements: 1.1, 1.2, 1.3, 1.4
    const { elements, errors } = await restoreTemplateElements(template.elements)

    // 3. Log any restoration errors to console
    // Requirements: 6.4 (partial - error logging)
    if (errors.length > 0) {
      console.warn('Some elements failed to restore:', errors)
    }

    // Log loaded template dimensions and element coordinates for debugging alignment
    console.log('📐 Loaded template dimensions:', {
      width: template.width,
      height: template.height,
      elementCount: elements.length,
      elementSample: elements.slice(0, 2).map((el) => ({
        type: el.type,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
      })),
    })

    // 4. Update state with restored elements
    setCurrentElements(elements)

    // 5. Deselect any previously selected element
    // Requirements: 6.4
    setCurrentSelectedElementId(null)

    // 6. Clear undo/redo history and set the loaded elements as the initial state
    // Requirements: 6.3
    // Pass the elements to clearHistory so it initializes with them instead of empty
    clearHistory(elements, null)

    // Close dialog
    setShowLoadDialog(false)
    toast({
      title: 'Success',
      description: `Template "${template.name}" loaded successfully!`,
    })
  }

  // Export image handler - composites all canvas layers
  const handleExportImage = () => {
    // Get all three canvas layers
    const canvases = document.querySelectorAll<HTMLCanvasElement>('.relative.inline-block canvas')

    if (canvases.length === 3) {
      // Create a composite canvas
      const compositeCanvas = document.createElement('canvas')
      compositeCanvas.width = selectedTemplate.width
      compositeCanvas.height = selectedTemplate.height
      const ctx = compositeCanvas.getContext('2d', { alpha: false })

      if (ctx) {
        // Draw each layer onto the composite canvas
        // Layer 0: Background
        ctx.drawImage(canvases[0], 0, 0)
        // Layer 1: Content (elements)
        ctx.drawImage(canvases[1], 0, 0)
        // Layer 2: Interaction (skip - we don't want selection handles in export)
        // ctx.drawImage(canvases[2], 0, 0)

        // Export the composite
        const link = document.createElement('a')
        link.download = `${selectedTemplate.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`
        link.href = compositeCanvas.toDataURL('image/png')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } else {
      // Fallback to old method if canvas structure changed
      const canvas = document.querySelector('canvas') as HTMLCanvasElement
      if (canvas) {
        const link = document.createElement('a')
        link.download = `${selectedTemplate.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`
        link.href = canvas.toDataURL('image/png')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}

      {/* Menubar */}
      <div className="border-b border-border px-4 py-1 flex items-center justify-between mt-4">
        <Menubar className="border-none bg-transparent flex-1">
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleExportImage}>
                Export Image <MenubarShortcut>⌘E</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={() => editMode.mode === 'edit' ? handleSaveTemplate() : setShowSaveDialog(true)}>
                {editMode.mode === 'edit' ? 'Save Changes' : 'Save as Template'} <MenubarShortcut>⌘S</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handleLoadTemplates}>
                Load Template <MenubarShortcut>⌘O</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={resetCanvas}>
                New Canvas <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={resetCanvas}>Reset Canvas</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleUndo} disabled={!canUndo}>
                Undo <MenubarShortcut>⌘Z</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handleRedo} disabled={!canRedo}>
                Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>Insert</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => imageInputRef.current?.click()}>Upload Image</MenubarItem>
              <MenubarItem onClick={addTextElement}>Add Text</MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Image Variables</MenubarSubTrigger>
                <MenubarSubContent>
                  {IMAGE_VARIABLES.map((variable) => (
                    <MenubarItem
                      key={variable.id}
                      onClick={() => addImageVariable(variable.id, variable.displayName)}
                    >
                      {variable.name}
                    </MenubarItem>
                  ))}
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSub>
                <MenubarSubTrigger>Text Variables</MenubarSubTrigger>
                <MenubarSubContent>
                  {TEXT_VARIABLES.map((variable) => (
                    <MenubarItem
                      key={variable.id}
                      onClick={() => addTextVariable(variable.id, variable.displayName)}
                    >
                      {variable.name}
                    </MenubarItem>
                  ))}
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>Variables</MenubarTrigger>
            <MenubarContent>
              <MenubarSub>
                <MenubarSubTrigger>Image Variables</MenubarSubTrigger>
                <MenubarSubContent>
                  {IMAGE_VARIABLES.map((variable) => (
                    <MenubarItem
                      key={variable.id}
                      onClick={() => addImageVariable(variable.id, variable.displayName)}
                    >
                      {variable.name}
                    </MenubarItem>
                  ))}
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSub>
                <MenubarSubTrigger>Text Variables</MenubarSubTrigger>
                <MenubarSubContent>
                  {TEXT_VARIABLES.map((variable) => (
                    <MenubarItem
                      key={variable.id}
                      onClick={() => addTextVariable(variable.id, variable.displayName)}
                    >
                      {variable.name}
                    </MenubarItem>
                  ))}
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>Template</MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup value={selectedTemplate.id} onValueChange={handleTemplateChange}>
                {templates.map((template) => (
                  <MenubarRadioItem key={template.id} value={template.id}>
                    {template.name}
                  </MenubarRadioItem>
                ))}
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>

        {/* Quick Action Buttons */}
        <div className="flex gap-2">
          {editMode.mode === 'edit' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dash/assets/image-templates')}
              className="mb-1"
            >
              Cancel
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => editMode.mode === 'edit' ? handleSaveTemplate() : setShowSaveDialog(true)}
            className="gap-2 mb-1"
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">{editMode.mode === 'edit' ? 'Save Changes' : 'Save'}</span>
          </Button>
        </div>
      </div>

      {/* Background Toolbar */}
      <BackgroundToolbar
        selectedTemplate={selectedTemplate}
        onTemplateUpdate={(updates) =>
          setSelectedTemplate((prev) => ({
            ...prev,
            ...updates,
          }))
        }
        onBackgroundImageUpload={() => backgroundInputRef.current?.click()}
      />

      {/* Formatting Toolbar */}
      <FormattingToolbar
        selectedElement={selectedElement}
        onElementUpdate={updateElement}
        onDeleteElement={deleteElement}
      />

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImageUpload(file)
        }}
      />
      <input
        ref={backgroundInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleBackgroundUpload(file)
        }}
      />

      {/* Main Content */}
      <div className="p-4">
        <div className="max-w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Canvas Area - Now takes up more space */}
            <div className="lg:col-span-4">
              <Card>
                <CardContent className="p-6">
                  <CanvasEditor
                    selectedTemplate={selectedTemplate}
                    elements={currentElements}
                    selectedElementId={currentSelectedElementId}
                    onElementSelect={handleElementSelect}
                    onElementUpdate={updateElement}
                    onElementDragEnd={handleElementDragEnd}
                    onReset={resetCanvas}
                    onMoveToFront={moveToFront}
                    onMoveToBack={moveToBack}
                    onMoveForward={moveForward}
                    onMoveBackward={moveBackward}
                    onToggleVisibility={toggleVisibility}
                    onDeleteElement={deleteElement}
                  />

                  {/* Template name and dimensions */}
                  <div className="text-center mt-4 mb-2">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{selectedTemplate.name}</span>
                      <span className="text-muted-foreground mx-2">•</span>
                      <span className="text-xs text-muted-foreground">
                        {selectedTemplate.width * 2} × {selectedTemplate.height * 2} px
                      </span>
                    </p>
                  </div>

                  {/* Keyboard shortcuts info with improved undo/redo status */}
                  <div className="text-center text-xs text-muted-foreground mt-4">
                    <div>
                      Keyboard shortcuts: Ctrl+Z (Undo) • Ctrl+Y (Redo) • Delete (Remove selected)
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-1">
                      <span
                        className={
                          canUndo
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-muted-foreground/50'
                        }
                      >
                        Undo: {canUndo ? 'Available' : 'Not available'}
                      </span>
                      <span
                        className={
                          canRedo
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-muted-foreground/50'
                        }
                      >
                        Redo: {canRedo ? 'Available' : 'Not available'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Layers Panel - Moved to the right */}
            <div className="lg:col-span-1 space-y-4">
              <Link href={'/dash'}>
                <Button variant="outline" size="sm" className="w-full mb-4">
                  Go to dashboard
                </Button>
              </Link>
              <LayersPanel
                elements={currentElements}
                selectedElementId={currentSelectedElementId}
                onElementSelect={handleElementSelect}
                onMoveToFront={moveToFront}
                onMoveToBack={moveToBack}
                onMoveForward={moveForward}
                onMoveBackward={moveBackward}
                onToggleVisibility={toggleVisibility}
                onDeleteElement={deleteElement}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Template Dialog */}
      {showSaveDialog && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => setShowSaveDialog(false)}
        >
          <div
            className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-foreground">Save Template</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Template Name
                </label>
                <input
                  type="text"
                  value={saveTemplateName}
                  onChange={(e) => setSaveTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., Business Card - Blue Theme"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Usage Type</label>
                <select
                  value={saveUsageType}
                  onChange={(e) => setSaveUsageType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="participant">Participants</option>
                  <option value="partner">Partners</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Template'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Load Template Dialog */}
      {showLoadDialog && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => setShowLoadDialog(false)}
        >
          <div
            className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-foreground">Load Template</h3>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
            ) : savedTemplates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No saved templates found. Create one by clicking "Save as Template"!
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {savedTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-border bg-card rounded-lg p-3 hover:border-primary hover:shadow-md cursor-pointer transition-all duration-200"
                    onClick={() => handleApplyTemplate(template)}
                  >
                    {template.previewImage && (
                      <img
                        src={template.previewImage}
                        alt={template.name}
                        className="w-full h-32 object-cover rounded mb-2 border border-border"
                      />
                    )}
                    <h4 className="font-medium text-sm text-foreground">{template.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {template.width}x{template.height} • {template.usageType}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setShowLoadDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}
