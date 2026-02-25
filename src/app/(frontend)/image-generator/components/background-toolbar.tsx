'use client'

import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import type { Template } from '@/components/canvas/types/canvas-element'

interface BackgroundToolbarProps {
  selectedTemplate: Template
  onTemplateUpdate: (updates: Partial<Template>) => void
  onBackgroundImageUpload: () => void
}

export default function BackgroundToolbar({
  selectedTemplate,
  onTemplateUpdate,
  onBackgroundImageUpload,
}: BackgroundToolbarProps) {
  return (
    <div className="border-b border-border bg-card px-2 sm:px-4 py-2">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Label */}
        <span className="text-sm font-medium text-foreground whitespace-nowrap">Background:</span>

        {/* Color Picker */}
        <div className="flex items-center gap-2">
          <label htmlFor="bg-color" className="text-xs text-muted-foreground whitespace-nowrap">
            Color:
          </label>
          <input
            id="bg-color"
            type="color"
            value={
              selectedTemplate.backgroundImage.startsWith('#')
                ? selectedTemplate.backgroundImage
                : '#ffffff'
            }
            onChange={(e) =>
              onTemplateUpdate({
                backgroundImage: e.target.value,
              })
            }
            className="w-10 h-8 p-0 border rounded cursor-pointer"
            title="Background Color"
          />
        </div>

        {/* Upload Background Image Button */}
        <Button size="sm" variant="outline" onClick={onBackgroundImageUpload} className="h-8 gap-1">
          <Upload className="w-3 h-3" />
          <span className="hidden sm:inline">Upload Image</span>
          <span className="sm:hidden">Image</span>
        </Button>

        {/* Clear Background Button */}
        {!selectedTemplate.backgroundImage.startsWith('#') && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              onTemplateUpdate({
                backgroundImage: '#ffffff',
              })
            }
            className="h-8 text-xs"
          >
            Clear Image
          </Button>
        )}
      </div>
    </div>
  )
}
