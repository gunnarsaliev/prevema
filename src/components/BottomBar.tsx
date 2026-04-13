'use client'

import { Badge } from '@/components/ui/badge'
import { Zap, LayoutTemplate, Variable } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BottomBarProps {
  /** Template name used for the email */
  templateName?: string | null
  /** Trigger event that sent the email */
  triggerEvent?: string | null
  /** Variables used in the email template (JSON string or object) */
  variables?: string | Record<string, unknown> | null
  /** Additional CSS classes */
  className?: string
}

/**
 * A reusable bottom bar component that displays metadata
 * including template name, trigger event, and variables.
 */
export function BottomBar({ templateName, triggerEvent, variables, className }: BottomBarProps) {
  // Parse variables if it's a string
  const parsedVariables = (() => {
    if (!variables) return null
    if (typeof variables === 'object') return variables
    try {
      return JSON.parse(variables)
    } catch {
      return null
    }
  })()

  // Get non-empty variable entries
  const variableEntries = parsedVariables
    ? Object.entries(parsedVariables).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    : []

  // Don't render if there's nothing to show
  if (!templateName && !triggerEvent && variableEntries.length === 0) {
    return null
  }

  return (
    <div className={cn('flex-shrink-0 border-t bg-muted/30 px-6 py-3', className)}>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {templateName && (
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Template:</span>
            <span className="font-medium">{templateName}</span>
          </div>
        )}
        {triggerEvent && (
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Trigger:</span>
            <Badge variant="outline" className="font-normal">
              {triggerEvent}
            </Badge>
          </div>
        )}
        {variableEntries.length > 0 && (
          <div className="flex items-center gap-2">
            <Variable className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Variables:</span>
            <div className="flex flex-wrap gap-1">
              {variableEntries.slice(0, 5).map(([key, value]) => (
                <Badge key={key} variant="secondary" className="font-normal text-xs">
                  {key}: {String(value).slice(0, 20)}
                  {String(value).length > 20 ? '...' : ''}
                </Badge>
              ))}
              {variableEntries.length > 5 && (
                <Badge variant="secondary" className="font-normal text-xs">
                  +{variableEntries.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
