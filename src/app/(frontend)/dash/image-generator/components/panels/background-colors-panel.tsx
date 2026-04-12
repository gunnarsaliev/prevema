'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Image as ImageIcon } from 'lucide-react'
import type { Template } from '@/components/canvas/types/canvas-element'

interface BackgroundColorsPanelProps {
  selectedTemplate: Template
  onTemplateUpdate: (updates: Partial<Template>) => void
  onBackgroundImageUpload?: () => void
}

// Color palettes
const colorPalettes = {
  gradients: [
    { name: 'White', colors: ['#FFFFFF', '#FFFFFF'] },
    { name: 'Dark to Light', colors: ['#2C3E50', '#BDC3C7'] },
    { name: 'Gray Scale', colors: ['#7F8C8D', '#ECF0F1'] },
    { name: 'Light Green', colors: ['#A8E6CF', '#A8E6CF'] },
    { name: 'Olive', colors: ['#9B8B3C', '#9B8B3C'] },
    { name: 'Orange Gradient', colors: ['#F4A261', '#E76F51'] },
    { name: 'Dark Blue', colors: ['#264653', '#264653'] },
    { name: 'Cyan Blue', colors: ['#06D6A0', '#06D6A0'] },
    { name: 'Coral', colors: ['#FF6B6B', '#FF6B6B'] },
    { name: 'Purple Mix', colors: ['#A855F7', '#EC4899'] },
    { name: 'Blue Purple', colors: ['#6366F1', '#A855F7'] },
    { name: 'Purple Gradient', colors: ['#8B5CF6', '#8B5CF6'] },
    { name: 'Blue Gradient', colors: ['#3B82F6', '#3B82F6'] },
    { name: 'Cyan', colors: ['#06B6D4', '#06B6D4'] },
    { name: 'Teal Blue', colors: ['#0D9488', '#06B6D4'] },
    { name: 'Green Teal', colors: ['#10B981', '#0D9488'] },
    { name: 'Yellow Green', colors: ['#84CC16', '#10B981'] },
    { name: 'Yellow Orange', colors: ['#F59E0B', '#F97316'] },
    { name: 'Orange Red', colors: ['#F97316', '#EF4444'] },
    { name: 'Pink Purple', colors: ['#EC4899', '#A855F7'] },
    { name: 'Purple Blue', colors: ['#8B5CF6', '#6366F1'] },
  ],
  solid: [
    '#FFFFFF',
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DFE6E9',
    '#74B9FF',
    '#A29BFE',
    '#FD79A8',
    '#FDCB6E',
    '#6C5CE7',
    '#00B894',
    '#00CEC9',
    '#0984E3',
    '#B2BEC3',
    '#2D3436',
    '#636E72',
    '#F8F9FA',
    '#E9ECEF',
  ],
  pastels: [
    '#FFE5E5',
    '#FFF0F0',
    '#E5F4FF',
    '#F0E5FF',
    '#E5FFE5',
    '#FFF5E5',
    '#FFE5F5',
    '#E5FFFF',
    '#F5FFE5',
    '#FFE5EB',
  ],
}

export default function BackgroundColorsPanel({
  selectedTemplate,
  onTemplateUpdate,
  onBackgroundImageUpload,
}: BackgroundColorsPanelProps) {
  const selectedColor = selectedTemplate.backgroundImage.startsWith('#')
    ? selectedTemplate.backgroundImage
    : '#ffffff'

  const handleGradientClick = (colors: string[]) => {
    // Create linear gradient string
    const gradientString = `linear-gradient(135deg, ${colors.join(', ')})`
    onTemplateUpdate({ backgroundImage: gradientString })
  }

  return (
    <div className="space-y-4 mt-2">
      {/* Section Header */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">Background</h3>
        <p className="text-xs text-muted-foreground">Choose colors or upload an image</p>
      </div>

      {/* Upload Image Button */}
      {onBackgroundImageUpload && (
        <>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-10"
            onClick={onBackgroundImageUpload}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Upload Background Image</span>
          </Button>
          <Separator />
        </>
      )}

      {/* Gradients */}
      <div>
        <p className="text-xs text-muted-foreground mb-3 font-medium">Default gradient colours</p>
        <div className="grid grid-cols-7 gap-2">
          {colorPalettes.gradients.map((gradient, idx) => (
            <button
              key={idx}
              className="w-full aspect-square rounded-full cursor-pointer border-2 border-border hover:border-primary transition-all hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${gradient.colors.join(', ')})`,
              }}
              onClick={() => handleGradientClick(gradient.colors)}
              title={gradient.name}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Solid Colors */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium">Solid Colors</p>
        <div className="grid grid-cols-5 gap-2">
          {colorPalettes.solid.map((color, idx) => (
            <button
              key={idx}
              className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                selectedColor === color
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onTemplateUpdate({ backgroundImage: color })}
              title={color}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Pastel Colors */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium">Pastels</p>
        <div className="grid grid-cols-5 gap-2">
          {colorPalettes.pastels.map((color, idx) => (
            <button
              key={idx}
              className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                selectedColor === color
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onTemplateUpdate({ backgroundImage: color })}
              title={color}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Custom Color Picker */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium">Custom Color</p>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => onTemplateUpdate({ backgroundImage: e.target.value })}
            className="w-12 h-12 rounded-lg cursor-pointer border border-border"
          />
          <div className="flex-1">
            <input
              type="text"
              value={selectedColor}
              onChange={(e) => {
                const value = e.target.value
                if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                  onTemplateUpdate({ backgroundImage: value })
                }
              }}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
              placeholder="#000000"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
