import React from 'react'

export interface TestProps {
  children?: React.ReactNode
}

export function TestComponent({ children }: TestProps) {
  return <div>{children || 'Default content'}</div>
}
