'use client'

import { Button } from '@/components/ui/button'
import { Image as ImageIcon } from 'lucide-react'
import type { Template } from '@/components/canvas/types/canvas-element'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface BackgroundToolbarProps {
  selectedTemplate: Template
  onTemplateUpdate: (updates: Partial<Template>) => void
  onBackgroundImageUpload: () => void
}

// Quick color presets - inline display
const colorPresets = [
  '#ffffff',
  '#000000',
  '#e53e3e',
  '#dd6b20',
  '#d69e2e',
  '#38a169',
  '#3182ce',
  '#805ad5',
  '#d53f8c',
]

export default function BackgroundToolbar({
  selectedTemplate,
  onTemplateUpdate,
  onBackgroundImageUpload,
}: BackgroundToolbarProps) {
  const currentColor = selectedTemplate.backgroundImage.startsWith('#')
    ? selectedTemplate.backgroundImage
    : '#ffffff'

  const handleColorSelect = (color: string) => {
    onTemplateUpdate({ backgroundImage: color })
  }

  return (
    <div className="border-b border-border bg-background px-4 py-2">
      <div className="flex items-center gap-3">
        {/* Inline Color Swatches */}
        <div className="flex items-center gap-1.5">
          {colorPresets.map((color) => {
            const isSelected = currentColor === color
            return (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`w-7 h-7 rounded border-2 transition-all ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 scale-110'
                    : 'border-border hover:border-primary/50 hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            )
          })}
        </div>

        {/* Custom Color Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-7 h-7 rounded border-2 border-border hover:border-primary/50 transition-all relative overflow-hidden"
              title="Custom color"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" />
              <div className="absolute inset-[3px] bg-background rounded-sm" />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
                +
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-3">
              <p className="text-sm font-medium">Custom Color</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => handleColorSelect(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border border-border"
                />
                <input
                  type="text"
                  value={currentColor}
                  onChange={(e) => {
                    const value = e.target.value
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                      onTemplateUpdate({ backgroundImage: value })
                    }
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Divider */}
        <div className="w-px h-6 bg-border" />

        {/* Upload Background Image Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={onBackgroundImageUpload}
          className="h-8 gap-2 hover:bg-accent"
        >
          <ImageIcon className="w-4 h-4" />
          <span className="text-sm">Image</span>
        </Button>
      </div>
    </div>
  )
}
