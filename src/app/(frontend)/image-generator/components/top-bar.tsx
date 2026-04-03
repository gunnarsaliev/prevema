'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, Save, Undo, Redo } from 'lucide-react'

interface TopBarProps {
  templateName: string
  onTemplateNameChange?: (name: string) => void
  onSave: () => void
  onExport: () => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  isSaving?: boolean
  isEditMode?: boolean
}

export default function TopBar({
  templateName,
  onTemplateNameChange,
  onSave,
  onExport,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  isSaving = false,
  isEditMode = false,
}: TopBarProps) {
  return (
    <div className="border-b border-border bg-background px-4 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Template Name - Always editable */}
        <div className="flex items-center gap-3 flex-1">
          <Input
            type="text"
            value={templateName}
            onChange={(e) => onTemplateNameChange?.(e.target.value)}
            className="max-w-sm h-9 text-sm"
            placeholder="Enter template name..."
          />
        </div>

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
