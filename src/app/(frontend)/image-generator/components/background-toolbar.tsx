'use client'

import { Button } from '@/components/ui/button'
import { Upload, Palette } from 'lucide-react'
import type { Template } from '@/components/canvas/types/canvas-element'
import { useState } from 'react'
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

// Quick color presets inspired by modern design tools
const colorPresets = [
  { name: 'White', value: '#ffffff' },
  { name: 'Light Gray', value: '#f3f4f6' },
  { name: 'Sky Blue', value: '#e0f2fe' },
  { name: 'Mint', value: '#d1fae5' },
  { name: 'Lavender', value: '#ede9fe' },
  { name: 'Peach', value: '#ffedd5' },
  { name: 'Pink', value: '#fce7f3' },
  { name: 'Dark', value: '#1f2937' },
]

// Gradient presets
const gradientPresets = [
  { name: 'Sunset', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)' },
  { name: 'Green', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { name: 'Warm', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Cool', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Teal', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
]

export default function BackgroundToolbar({
  selectedTemplate,
  onTemplateUpdate,
  onBackgroundImageUpload,
}: BackgroundToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)

  const handleGradientSelect = (gradient: string) => {
    onTemplateUpdate({ backgroundImage: gradient })
    setShowColorPicker(false)
  }

  const handleColorSelect = (color: string) => {
    onTemplateUpdate({ backgroundImage: color })
    setShowColorPicker(false)
  }

  return (
    <div className="border-b border-border bg-gradient-to-r from-card to-card/95 px-2 sm:px-4 py-2.5 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Label */}
        <span className="text-sm font-semibold text-foreground whitespace-nowrap">Background:</span>

        {/* Modern Color Palette Picker */}
        <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" className="h-9 gap-2 shadow-sm hover:shadow-md transition-shadow">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Color Palette</span>
              <span className="sm:hidden">Colors</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              {/* Solid Colors */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Solid Colors</p>
                <div className="grid grid-cols-4 gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      className="group relative h-12 rounded-lg border-2 border-border hover:border-primary transition-all hover:scale-105 shadow-sm"
                      style={{ backgroundColor: preset.value }}
                      onClick={() => handleColorSelect(preset.value)}
                      title={preset.name}
                    >
                      {selectedTemplate.backgroundImage === preset.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-primary border-2 border-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gradients */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Gradients</p>
                <div className="grid grid-cols-2 gap-2">
                  {gradientPresets.map((preset) => (
                    <button
                      key={preset.name}
                      className="h-14 rounded-lg border-2 border-border hover:border-primary transition-all hover:scale-105 shadow-sm relative"
                      style={{ background: preset.value }}
                      onClick={() => handleGradientSelect(preset.value)}
                      title={preset.name}
                    >
                      {selectedTemplate.backgroundImage === preset.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-white border-2 border-primary shadow-lg" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Picker */}
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Custom Color</p>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={
                      selectedTemplate.backgroundImage.startsWith('#')
                        ? selectedTemplate.backgroundImage
                        : '#ffffff'
                    }
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-border"
                  />
                  <input
                    type="text"
                    value={
                      selectedTemplate.backgroundImage.startsWith('#')
                        ? selectedTemplate.backgroundImage
                        : '#ffffff'
                    }
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
            </div>
          </PopoverContent>
        </Popover>

        {/* Upload Background Image Button */}
        <Button size="sm" variant="outline" onClick={onBackgroundImageUpload} className="h-9 gap-2 shadow-sm hover:shadow-md transition-shadow">
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload Image</span>
          <span className="sm:hidden">Image</span>
        </Button>

        {/* Current Background Indicator */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground hidden lg:inline">Current:</span>
          <div
            className="w-10 h-9 rounded-md border-2 border-border shadow-sm"
            style={
              selectedTemplate.backgroundImage.startsWith('#') || selectedTemplate.backgroundImage.startsWith('linear-gradient')
                ? { background: selectedTemplate.backgroundImage }
                : {
                    backgroundImage: `url(${selectedTemplate.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
            }
          />
        </div>

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
            className="h-9 text-xs"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
