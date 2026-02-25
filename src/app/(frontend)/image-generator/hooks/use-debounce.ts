"use client"

import { useEffect } from "react"

import { useState } from "react"

import { useCallback, useRef } from "react"

/**
 * Custom hook for debouncing function calls
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the callback function
 */
export function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number): [T, () => void] {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const callbackRef = useRef(callback)

  // Update callback ref when callback changes
  callbackRef.current = callback

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    }) as T,
    [delay],
  )

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
  }, [])

  return [debouncedCallback, cancel]
}

/**
 * Hook for debouncing values
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook for debouncing state updates with immediate visual feedback
 * @param initialValue - Initial state value
 * @param onDebouncedChange - Callback for debounced changes
 * @param delay - Debounce delay in milliseconds
 * @returns [currentValue, setValue, debouncedValue, cancelDebounce]
 */
export function useDebouncedState<T>(
  initialValue: T,
  onDebouncedChange?: (value: T) => void,
  delay = 300,
): [T, (value: T) => void, T, () => void] {
  const [currentValue, setCurrentValue] = useState<T>(initialValue)
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const setValue = useCallback(
    (newValue: T) => {
      // Update current value immediately for UI responsiveness
      setCurrentValue(newValue)

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set debounced update
      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(newValue)
        onDebouncedChange?.(newValue)
      }, delay)
    },
    [delay, onDebouncedChange],
  )

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [currentValue, setValue, debouncedValue, cancel]
}
