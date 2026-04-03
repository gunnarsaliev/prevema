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
    { name: 'Sunset', colors: ['#FF6B6B', '#FFE66D', '#4ECDC4'] },
    { name: 'Ocean', colors: ['#2E3192', '#1BFFFF', '#00D4FF'] },
    { name: 'Forest', colors: ['#0F2027', '#203A43', '#2C5364'] },
    { name: 'Purple Haze', colors: ['#6A0572', '#AB83A1', '#FFE5E5'] },
    { name: 'Mint', colors: ['#11998E', '#38EF7D', '#D4FC79'] },
    { name: 'Warm', colors: ['#F2994A', '#F2C94C', '#EB5757'] },
  ],
  solid: [
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
    '#FFFFFF',
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
    onTemplateUpdate({ backgroundImage: colors[0] })
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
        <p className="text-xs text-muted-foreground mb-2 font-medium">Gradients</p>
        <div className="grid grid-cols-2 gap-2">
          {colorPalettes.gradients.map((gradient, idx) => (
            <div
              key={idx}
              className="h-12 rounded-lg cursor-pointer border-2 border-transparent hover:border-primary transition-all shadow-sm hover:shadow-md"
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
