'use client'

import React from 'react'

export interface MinimalShellProps {
  children?: React.ReactNode
}

export function MinimalShell({ children }: MinimalShellProps) {
  return (
    <div className="h-screen flex">
      <div className="w-64 bg-gray-100 p-4">
        <h2>Sidebar</h2>
      </div>
      <div className="flex-1 p-4">
        {children || <p>Main content area</p>}
      </div>
    </div>
  )
}
