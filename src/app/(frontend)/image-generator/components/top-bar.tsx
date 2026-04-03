'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, Save, Undo, Redo, ChevronLeft } from 'lucide-react'

interface Template {
  id: string
  name: string
}

interface TopBarProps {
  templateName: string
  onTemplateNameChange?: (name: string) => void
  onSave: () => void
  onExport: () => void
  onUndo?: () => void
  onRedo?: () => void
  onBack?: () => void
  canUndo?: boolean
  canRedo?: boolean
  isSaving?: boolean
  isEditMode?: boolean
  templates?: Template[]
  selectedTemplateId?: string
  onTemplateChange?: (templateId: string) => void
}

export default function TopBar({
  templateName,
  onTemplateNameChange,
  onSave,
  onExport,
  onUndo,
  onRedo,
  onBack,
  canUndo = false,
  canRedo = false,
  isSaving = false,
  isEditMode = false,
  templates = [],
  selectedTemplateId,
  onTemplateChange,
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
    <div className="border-b border-border bg-background px-4 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Back Arrow + Template Name */}
        <div className="flex items-center gap-3 flex-1">
          {onBack && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onBack}
              className="h-9 w-9 p-0"
              title="Back to templates"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          {isEditing ? (
            <Input
              ref={inputRef}
              type="text"
              value={templateName}
              onChange={(e) => onTemplateNameChange?.(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="h-9 text-sm w-auto min-w-[200px]"
              placeholder="Enter template name..."
            />
          ) : (
            <h1
              onClick={() => setIsEditing(true)}
              className="text-lg font-semibold cursor-pointer hover:text-primary transition-colors"
              title="Click to edit"
            >
              {templateName || 'Untitled Template'}
            </h1>
          )}
        </div>

        {/* Center: Template Size Selector */}
        {templates.length > 0 && selectedTemplateId && onTemplateChange && (
          <div className="flex items-center">
            <select
              value={selectedTemplateId}
              onChange={(e) => onTemplateChange(e.target.value)}
              className="h-9 px-3 text-sm border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          {onUndo && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-9 w-9 p-0"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </Button>
          )}
          {onRedo && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-9 w-9 p-0"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </Button>
          )}

          {/* Divider */}
          {(onUndo || onRedo) && <div className="w-px h-6 bg-border" />}

          <Button
            size="sm"
            variant="outline"
            onClick={onExport}
            className="h-9 gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>

          <Button
            size="sm"
            variant="default"
            onClick={onSave}
            disabled={isSaving}
            className="h-9 gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : isEditMode ? 'Update' : 'Save'}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
