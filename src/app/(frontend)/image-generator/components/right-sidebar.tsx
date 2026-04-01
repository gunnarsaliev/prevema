'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import ColorPalettePicker from './color-palette-picker'
import LayersPanel from './layers-panel'
import type { CanvasElement, Template } from '@/components/canvas/types/canvas-element'

interface RightSidebarProps {
  selectedTemplate: Template
  onTemplateUpdate: (updates: Partial<Template>) => void
  elements: CanvasElement[]
  selectedElementId: string | null
  onElementSelect: (id: string | null) => void
  onMoveToFront: (id: string) => void
  onMoveToBack: (id: string) => void
  onMoveForward: (id: string) => void
  onMoveBackward: (id: string) => void
  onToggleVisibility: (id: string) => void
  onDeleteElement: (id: string) => void
}

export default function RightSidebar({
  selectedTemplate,
  onTemplateUpdate,
  elements,
  selectedElementId,
  onElementSelect,
  onMoveToFront,
  onMoveToBack,
  onMoveForward,
  onMoveBackward,
  onToggleVisibility,
  onDeleteElement,
}: RightSidebarProps) {
  return (
    <div className="w-80 border-l border-border bg-background overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Canvas Settings */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Canvas Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Canvas Size */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Size</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="canvas-width" className="text-xs">Width (px)</Label>
                  <Input
                    id="canvas-width"
                    type="number"
                    value={selectedTemplate.width}
                    onChange={(e) =>
                      onTemplateUpdate({ width: parseInt(e.target.value) || 600 })
                    }
                    className="h-8 text-sm"
                    min="100"
                    max="4000"
                  />
                </div>
                <div>
                  <Label htmlFor="canvas-height" className="text-xs">Height (px)</Label>
                  <Input
                    id="canvas-height"
                    type="number"
                    value={selectedTemplate.height}
                    onChange={(e) =>
                      onTemplateUpdate({ height: parseInt(e.target.value) || 600 })
                    }
                    className="h-8 text-sm"
                    min="100"
                    max="4000"
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Aspect Ratio: {(selectedTemplate.width / selectedTemplate.height).toFixed(2)}
              </div>
            </div>

            <Separator />

            {/* Background Preview */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Background Preview</Label>
              <div
                className="w-full h-24 rounded-md border-2 border-border shadow-inner"
                style={
                  selectedTemplate.backgroundImage.startsWith('#') ||
                  selectedTemplate.backgroundImage.startsWith('linear-gradient')
                    ? { background: selectedTemplate.backgroundImage }
                    : {
                        backgroundImage: `url(${selectedTemplate.backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <ColorPalettePicker
          selectedColor={
            selectedTemplate.backgroundImage.startsWith('#')
              ? selectedTemplate.backgroundImage
              : '#ffffff'
          }
          onColorChange={(color) => onTemplateUpdate({ backgroundImage: color })}
        />

        {/* Layers Panel */}
        <LayersPanel
          elements={elements}
          selectedElementId={selectedElementId}
          onElementSelect={onElementSelect}
          onMoveToFront={onMoveToFront}
          onMoveToBack={onMoveToBack}
          onMoveForward={onMoveForward}
          onMoveBackward={onMoveBackward}
          onToggleVisibility={onToggleVisibility}
          onDeleteElement={onDeleteElement}
        />
      </div>
    </div>
  )
}
