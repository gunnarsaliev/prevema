'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { Template } from '@/components/canvas/types/canvas-element'

interface CanvasSettingsPanelProps {
  selectedTemplate: Template
  onTemplateUpdate: (updates: Partial<Template>) => void
}

export default function CanvasSettingsPanel({
  selectedTemplate,
  onTemplateUpdate,
}: CanvasSettingsPanelProps) {
  return (
    <div className="space-y-4 mt-2">
      {/* Section Header */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">Canvas Settings</h3>
        <p className="text-xs text-muted-foreground">Adjust canvas dimensions and preview</p>
      </div>

      {/* Canvas Size */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Size</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="canvas-width" className="text-xs">
              Width (px)
            </Label>
            <Input
              id="canvas-width"
              type="number"
              value={selectedTemplate.width}
              onChange={(e) => onTemplateUpdate({ width: parseInt(e.target.value) || 600 })}
              className="h-8 text-sm"
              min="100"
              max="4000"
            />
          </div>
          <div>
            <Label htmlFor="canvas-height" className="text-xs">
              Height (px)
            </Label>
            <Input
              id="canvas-height"
              type="number"
              value={selectedTemplate.height}
              onChange={(e) => onTemplateUpdate({ height: parseInt(e.target.value) || 600 })}
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
    </div>
  )
}
