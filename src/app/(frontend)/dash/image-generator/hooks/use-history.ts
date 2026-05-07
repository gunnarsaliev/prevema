'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { CanvasElement } from '@/components/canvas/types/canvas-element'

interface HistoryState {
  elements: CanvasElement[]
  selectedElementId: string | null
}

interface UseHistoryReturn {
  currentState: HistoryState
  canUndo: boolean
  canRedo: boolean
  pushState: (elements: CanvasElement[], selectedElementId: string | null) => void
  undo: () => HistoryState | null
  redo: () => HistoryState | null
  clearHistory: (initialElements?: CanvasElement[], initialSelectedId?: string | null) => void
}

const MAX_HISTORY_SIZE = 50

// Helper function to safely clone elements, excluding HTMLImageElement objects
const cloneElements = (elements: CanvasElement[]): CanvasElement[] => {
  return elements.map((element) => {
    // Create a shallow clone first
    const cloned = { ...element }

    // Handle image data more efficiently
    if (element.image && element.image instanceof HTMLImageElement) {
      // Store only essential image metadata
      cloned.imageData = {
        src: element.image.src,
        width: element.image.naturalWidth,
        height: element.image.naturalHeight,
      }
      // Remove the actual HTMLImageElement to prevent memory leaks
      delete cloned.image
    }

    return cloned
  })
}

export function useHistory(
  initialElements: CanvasElement[] = [],
  initialSelectedId: string | null = null,
): UseHistoryReturn {
  const [history, setHistory] = useState<HistoryState[]>([
    { elements: cloneElements(initialElements), selectedElementId: initialSelectedId },
  ])
  const [currentIndex, setCurrentIndex] = useState(0)
  const lastPushTime = useRef<number>(0)
  const debounceTimeout = useRef<NodeJS.Timeout | undefined>(undefined)
  const pendingState = useRef<HistoryState | null>(null)

  const currentState = history[currentIndex] || { elements: [], selectedElementId: null }
  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  const actuallyPushState = useCallback(
    (newState: HistoryState) => {
      setHistory((prevHistory) => {
        setCurrentIndex((prevIndex) => {
          // Remove any future history if we're not at the end (this happens when we make changes after undoing)
          const newHistory = prevHistory.slice(0, prevIndex + 1)

          // Add the new state
          newHistory.push(newState)

          // Limit history size
          if (newHistory.length > MAX_HISTORY_SIZE) {
            newHistory.shift()
            // Return the adjusted index (one less because we removed the first item)
            return newHistory.length - 1
          }

          // Return the new index (pointing to the newly added state)
          return newHistory.length - 1
        })

        // Update history with the new state
        const updatedHistory = prevHistory.slice(0, currentIndex + 1)
        updatedHistory.push(newState)

        if (updatedHistory.length > MAX_HISTORY_SIZE) {
          updatedHistory.shift()
        }

        return updatedHistory
      })
    },
    [currentIndex],
  )

  const pushState = useCallback(
    (elements: CanvasElement[], selectedElementId: string | null) => {
      const now = Date.now()
      const newState = { elements: cloneElements(elements), selectedElementId }

      // Check if the new state is actually different from the current state
      const currentElements = currentState.elements
      const hasElementChanges =
        elements.length !== currentElements.length ||
        elements.some((element, index) => {
          const currentElement = currentElements[index]
          if (!currentElement || element.id !== currentElement.id) return true

          // Check for meaningful changes
          return (
            element.x !== currentElement.x ||
            element.y !== currentElement.y ||
            element.width !== currentElement.width ||
            element.height !== currentElement.height ||
            element.rotation !== currentElement.rotation ||
            element.text !== currentElement.text ||
            element.visible !== currentElement.visible ||
            element.fontSize !== currentElement.fontSize ||
            element.fontFamily !== currentElement.fontFamily ||
            element.fontWeight !== currentElement.fontWeight ||
            element.fontStyle !== currentElement.fontStyle ||
            element.fill !== currentElement.fill
          )
        })

      const hasSelectionChange = selectedElementId !== currentState.selectedElementId

      // Don't push if nothing meaningful changed
      if (!hasElementChanges && !hasSelectionChange) {
        return
      }

      // More aggressive debouncing for better performance
      if (now - lastPushTime.current < 200) {
        // Store the latest state but don't push yet
        pendingState.current = newState

        // Clear existing timeout and set new one
        if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current)
        }

        debounceTimeout.current = setTimeout(() => {
          if (pendingState.current) {
            actuallyPushState(pendingState.current)
            pendingState.current = null
          }
        }, 200)

        return
      }

      actuallyPushState(newState)
      lastPushTime.current = now
    },
    [actuallyPushState, currentState],
  )

  const undo = useCallback((): HistoryState | null => {
    console.log(
      'Undo called - currentIndex:',
      currentIndex,
      'canUndo:',
      canUndo,
      'history length:',
      history.length,
    )

    if (!canUndo) {
      console.log('Cannot undo - at beginning of history')
      return null
    }

    const newIndex = currentIndex - 1
    console.log('Undo: Moving to index:', newIndex)

    setCurrentIndex(newIndex)
    const newState = history[newIndex]

    console.log('Undo returning state:', newState)
    return newState
  }, [canUndo, currentIndex, history])

  const redo = useCallback((): HistoryState | null => {
    console.log(
      'Redo called - currentIndex:',
      currentIndex,
      'canRedo:',
      canRedo,
      'history length:',
      history.length,
    )

    if (!canRedo) {
      console.log('Cannot redo - at end of history')
      return null
    }

    const newIndex = currentIndex + 1
    console.log('Redo: Moving to index:', newIndex)

    setCurrentIndex(newIndex)
    const newState = history[newIndex]

    console.log('Redo returning state:', newState)
    return newState
  }, [canRedo, currentIndex, history])

  const clearHistory = useCallback(
    (initialElements?: CanvasElement[], initialSelectedId?: string | null) => {
      console.log('Clearing history with initial elements:', initialElements?.length || 0)
      const initialState = {
        elements: initialElements ? cloneElements(initialElements) : [],
        selectedElementId: initialSelectedId ?? null,
      }
      setHistory([initialState])
      setCurrentIndex(0)

      // Clear any pending states
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
      pendingState.current = null
    },
    [],
  )

  // Debug logging
  useEffect(() => {
    console.log('History state changed:', {
      currentIndex,
      historyLength: history.length,
      canUndo,
      canRedo,
      currentState: currentState.elements.length + ' elements',
      historyStates: history.map((state, index) => ({
        index,
        elements: state.elements.length,
        selected: state.selectedElementId,
        isCurrent: index === currentIndex,
      })),
    })
  }, [currentIndex, history.length, canUndo, canRedo, currentState, history])

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [])

  return {
    currentState,
    canUndo,
    canRedo,
    pushState,
    undo,
    redo,
    clearHistory,
  }
}
