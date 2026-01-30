/**
 * Canvas initialization for server-side rendering
 * Call this once during application startup
 */

import { registerCustomFonts } from './canvasUtils'

let isInitialized = false

/**
 * Initialize canvas utilities for server-side rendering
 * This should be called once during application startup
 */
export function initializeCanvas(): void {
  if (isInitialized) {
    console.log('Canvas utilities already initialized')
    return
  }

  try {
    console.log('Initializing canvas utilities for server-side rendering...')

    // Register custom fonts
    registerCustomFonts()

    isInitialized = true
    console.log('Canvas utilities initialized successfully')
  } catch (error) {
    console.error('Failed to initialize canvas utilities:', error)
    console.warn('Canvas rendering will continue with system default fonts')
    // Don't throw - allow the application to continue with defaults
    isInitialized = true
  }
}

/**
 * Check if canvas utilities have been initialized
 */
export function isCanvasInitialized(): boolean {
  return isInitialized
}
