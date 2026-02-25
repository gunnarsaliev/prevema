"use client"

import { useEffect } from "react"

interface KeyboardShortcutsProps {
  onUndo: () => void
  onRedo: () => void
  onDelete: () => void
  canUndo: boolean
  canRedo: boolean
  hasSelection: boolean
}

export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onDelete,
  canUndo,
  canRedo,
  hasSelection,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if we're in an input field or textarea
      const target = event.target as HTMLElement
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true" ||
        target.isContentEditable

      // Don't trigger shortcuts when typing in input fields
      if (isInputField) {
        return
      }

      const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const ctrlKey = isMac ? event.metaKey : event.ctrlKey

      // Prevent default browser behavior for our shortcuts
      if (ctrlKey && (event.key === "z" || event.key === "y")) {
        event.preventDefault()
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        // Only prevent default if we have a selection to avoid interfering with normal text editing
        if (hasSelection) {
          event.preventDefault()
        }
      }

      // Ctrl/Cmd + Z: Undo
      if (ctrlKey && event.key.toLowerCase() === "z" && !event.shiftKey) {
        if (canUndo) {
          console.log("Undo triggered")
          onUndo()
        }
        return
      }

      // Ctrl/Cmd + Y: Redo (or Ctrl/Cmd + Shift + Z on Mac)
      if (
        (ctrlKey && event.key.toLowerCase() === "y") ||
        (ctrlKey && event.shiftKey && event.key.toLowerCase() === "z")
      ) {
        if (canRedo) {
          console.log("Redo triggered")
          onRedo()
        }
        return
      }

      // Delete or Backspace key: Delete selected element
      if ((event.key === "Delete" || event.key === "Backspace") && hasSelection) {
        console.log("Delete triggered")
        onDelete()
        return
      }
    }

    // Add event listener to document
    document.addEventListener("keydown", handleKeyDown)

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onUndo, onRedo, onDelete, canUndo, canRedo, hasSelection])
}
