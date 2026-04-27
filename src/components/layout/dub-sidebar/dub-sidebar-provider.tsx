'use client'

import * as React from 'react'
import type { SidebarContextValue } from './types'

const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export function useDubSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useDubSidebar must be used within a DubSidebarProvider')
  }
  return context
}

interface DubSidebarProviderProps {
  defaultOpen?: boolean
  disableKeyboard?: boolean
  children: React.ReactNode
}

export function DubSidebarProvider({
  defaultOpen = true,
  disableKeyboard = false,
  children,
}: DubSidebarProviderProps) {
  const [isPanelOpen, setIsPanelOpen] = React.useState(defaultOpen)

  const setPanelOpen = React.useCallback((open: boolean) => {
    setIsPanelOpen(open)
  }, [])

  const togglePanel = React.useCallback(() => {
    setPanelOpen(!isPanelOpen)
  }, [isPanelOpen, setPanelOpen])

  // Keyboard shortcut (Cmd+B / Ctrl+B)
  React.useEffect(() => {
    if (disableKeyboard) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        togglePanel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePanel, disableKeyboard])

  const panelState = isPanelOpen ? 'expanded' : 'collapsed'

  const value = React.useMemo<SidebarContextValue>(
    () => ({
      isPanelOpen,
      setPanelOpen,
      togglePanel,
      panelState,
    }),
    [isPanelOpen, setPanelOpen, togglePanel, panelState],
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}
