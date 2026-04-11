'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft } from 'lucide-react'

interface TopBarProps {
  // Left side - Title
  title: string
  titleEditable?: boolean
  onTitleChange?: (value: string) => void
  description?: string
  titlePlaceholder?: string

  // Back button
  backHref?: string
  onBack?: () => void
  backTitle?: string

  // Center content (optional slot)
  centerContent?: ReactNode

  // Right actions (generic slot)
  actions?: ReactNode
}

export function TopBar({
  title,
  titleEditable = false,
  onTitleChange,
  description,
  titlePlaceholder = 'Enter title...',
  backHref,
  onBack,
  backTitle = 'Go back',
  centerContent,
  actions,
}: TopBarProps) {
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleBlur = () => {
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  return (
    <div className="border-b border-border px-6 py-3">
      <div className="flex items-center justify-between gap-6">
        {/* Left: Back Button + Title + Description */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {(backHref || onBack) && (
            <Button
              size="sm"
              variant="ghost"
              {...(backHref ? { asChild: true } : { onClick: onBack })}
              className="h-9 w-9 p-0 flex-shrink-0 hover:bg-accent"
              title={backTitle}
            >
              {backHref ? (
                <Link href={backHref}>
                  <ChevronLeft className="w-5 h-5" />
                </Link>
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </Button>
          )}

          {titleEditable && isEditing ? (
            <Input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => onTitleChange?.(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="h-9 text-base font-medium w-auto min-w-[200px] max-w-[400px]"
              placeholder={titlePlaceholder}
            />
          ) : (
            <div className="min-w-0">
              <h1
                onClick={titleEditable ? () => setIsEditing(true) : undefined}
                className={`text-base font-medium truncate ${
                  titleEditable ? 'cursor-pointer hover:text-primary transition-colors' : ''
                } ${!title && titleEditable ? 'text-muted-foreground' : 'text-foreground'}`}
                title={titleEditable ? 'Click to edit' : undefined}
              >
                {title || (titleEditable ? 'Untitled Template' : '')}
              </h1>
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
              )}
            </div>
          )}
        </div>

        {/* Center: Optional Content */}
        {centerContent && <div className="flex items-center flex-shrink-0">{centerContent}</div>}

        {/* Right: Action Buttons */}
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
