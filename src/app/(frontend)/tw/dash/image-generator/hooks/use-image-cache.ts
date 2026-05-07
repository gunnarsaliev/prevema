"use client"

import { useRef, useCallback } from "react"

interface ImageCacheEntry {
  image: HTMLImageElement
  src: string
  timestamp: number
}

const MAX_CACHE_SIZE = 50

export function useImageCache() {
  const cache = useRef<Map<string, ImageCacheEntry>>(new Map())

  const loadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      // Check cache first
      const cached = cache.current.get(src)
      if (cached && cached.image.complete && cached.image.naturalWidth > 0) {
        cached.timestamp = Date.now()
        resolve(cached.image)
        return
      }

      // Create image with better error handling
      const img = new Image()
      img.crossOrigin = "anonymous"

      const cleanup = () => {
        img.onload = null
        img.onerror = null
      }

      const handleLoad = () => {
        cleanup()

        // Validate image before caching
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
          reject(new Error(`Invalid image dimensions: ${src}`))
          return
        }

        // Add to cache with size limit
        cache.current.set(src, {
          image: img,
          src,
          timestamp: Date.now(),
        })

        // Efficient cache cleanup
        if (cache.current.size > MAX_CACHE_SIZE) {
          cleanupCache()
        }

        resolve(img)
      }

      const handleError = (error: any) => {
        cleanup()
        console.error(`Failed to load image: ${src}`, error)
        reject(new Error(`Failed to load image: ${src}`))
      }

      // Add timeout for loading
      const timeout = setTimeout(() => {
        cleanup()
        reject(new Error(`Image load timeout: ${src}`))
      }, 10000) // 10 second timeout

      img.onload = () => {
        clearTimeout(timeout)
        handleLoad()
      }

      img.onerror = (error) => {
        clearTimeout(timeout)
        handleError(error)
      }

      img.src = src
    })
  }, [])

  const getImage = useCallback((src: string): HTMLImageElement | null => {
    const cached = cache.current.get(src)
    if (cached && cached.image.complete && cached.image.naturalWidth > 0) {
      // Update timestamp for LRU
      cached.timestamp = Date.now()
      return cached.image
    }
    return null
  }, [])

  const preloadImage = useCallback(
    async (src: string): Promise<void> => {
      try {
        await loadImage(src)
      } catch (error) {
        console.warn(`Failed to preload image: ${src}`, error)
      }
    },
    [loadImage],
  )

  const clearCache = useCallback(() => {
    cache.current.clear()
  }, [])

  const getCacheSize = useCallback(() => {
    return cache.current.size
  }, [])

  const cleanupCache = useCallback(() => {
    const entries = Array.from(cache.current.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)

    // Remove oldest 25% of entries
    const toRemove = Math.floor(entries.length * 0.25)
    for (let i = 0; i < toRemove; i++) {
      cache.current.delete(entries[i][0])
    }
  }, [])

  return {
    loadImage,
    getImage,
    preloadImage,
    clearCache,
    getCacheSize,
  }
}
