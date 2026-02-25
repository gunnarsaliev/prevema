'use client'

import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Separator } from './ui/separator'
import { Bold, Italic, Minus, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CanvasElement } from '@/components/canvas/types/canvas-element'

interface FormattingToolbarProps {
  selectedElement: CanvasElement | null
  onElementUpdate: (id: string, updates: Partial<CanvasElement>) => void
  onDeleteElement: (id: string) => void
}

const fontFamilies = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Comic Sans MS',
  'Impact',
  'Trebuchet MS',
  'Courier New',
  'Palatino',
  'Garamond',
  'Bookman',
  'Avant Garde',
]

export default function FormattingToolbar({
  selectedElement,
  onElementUpdate,
  onDeleteElement,
}: FormattingToolbarProps) {
  if (!selectedElement) {
    return (
      <div className="border-b border-border bg-card px-2 sm:px-4 py-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center h-8">
          Select an element to see formatting options
        </div>
      </div>
    )
  }

  const handleFontSizeChange = (increment: number) => {
    const currentSize = selectedElement.fontSize || 24
    const newSize = Math.max(8, Math.min(120, currentSize + increment))
    onElementUpdate(selectedElement.id, { fontSize: newSize })
  }

  const toggleBold = () => {
    const currentWeight = selectedElement.fontWeight || 'normal'
    const newWeight = currentWeight === 'bold' ? 'normal' : 'bold'
    onElementUpdate(selectedElement.id, { fontWeight: newWeight })
  }

  const toggleItalic = () => {
    const currentStyle = selectedElement.fontStyle || 'normal'
    const newStyle = currentStyle === 'italic' ? 'normal' : 'italic'
    onElementUpdate(selectedElement.id, { fontStyle: newStyle })
  }

  const resetRotation = () => {
    onElementUpdate(selectedElement.id, { rotation: 0 })
  }

  // Get element type display name
  const getElementTypeDisplay = () => {
    switch (selectedElement.type) {
      case 'text':
        return 'Text Element'
      case 'image':
        return 'Image Element'
      case 'text-variable':
        return `Text Variable: ${selectedElement.variableName || 'Unknown'}`
      case 'image-variable':
        return `Image Variable: ${selectedElement.variableName || 'Unknown'}`
      default:
        return 'Element'
    }
  }

  // Text element or text variable toolbar
  if (selectedElement.type === 'text' || selectedElement.type === 'text-variable') {
    return (
      <div className="border-b border-border bg-card px-2 sm:px-4 py-2 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2 min-w-max">
          {/* Element Type Indicator */}
          <div className="text-xs text-foreground font-medium px-2 py-1 bg-muted rounded whitespace-nowrap">
            {getElementTypeDisplay()}
          </div>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          {/* Font Family - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:block">
            <Select
              value={selectedElement.fontFamily || 'Arial'}
              onValueChange={(value: string) => onElementUpdate(selectedElement.id, { fontFamily: value })}
            >
              <SelectTrigger className="w-24 lg:w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator orientation="vertical" className="h-6 hidden md:block" />

          {/* Font Size Controls */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleFontSizeChange(-2)}
              className="h-8 w-6 sm:w-8 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              value={selectedElement.fontSize || 24}
              onChange={(e) =>
                onElementUpdate(selectedElement.id, {
                  fontSize: Number.parseInt(e.target.value) || 24,
                })
              }
              className="w-14 sm:w-16 h-8 text-xs text-center"
              min="8"
              max="120"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleFontSizeChange(2)}
              className="h-8 w-6 sm:w-8 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          {/* Text Styling */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleBold}
              className={cn(
                'h-8 w-6 sm:w-8 p-0',
                selectedElement.fontWeight === 'bold' && 'bg-accent',
              )}
            >
              <Bold className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleItalic}
              className={cn(
                'h-8 w-6 sm:w-8 p-0',
                selectedElement.fontStyle === 'italic' && 'bg-accent',
              )}
            >
              <Italic className="h-3 w-3" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          {/* Text Color */}
          <div className="flex items-center gap-1">
            <Input
              type="color"
              value={selectedElement.fill || '#000000'}
              onChange={(e) => onElementUpdate(selectedElement.id, { fill: e.target.value })}
              className="w-6 sm:w-8 h-8 p-0 border rounded cursor-pointer"
              title="Text Color"
            />
          </div>

          <Separator orientation="vertical" className="h-6 hidden lg:block" />

          {/* Size Controls - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-1">
            <span className="text-xs text-muted-foreground">W:</span>
            <Input
              type="number"
              value={Math.round(selectedElement.width || 0)}
              onChange={(e) =>
                onElementUpdate(selectedElement.id, { width: Number.parseInt(e.target.value) || 0 })
              }
              className="w-12 xl:w-16 h-8 text-xs"
              min="1"
            />
            <span className="text-xs text-muted-foreground">H:</span>
            <Input
              type="number"
              value={Math.round(selectedElement.height || 0)}
              onChange={(e) =>
                onElementUpdate(selectedElement.id, {
                  height: Number.parseInt(e.target.value) || 0,
                })
              }
              className="w-12 xl:w-16 h-8 text-xs"
              min="1"
            />
          </div>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Rotation Reset */}
            <Button
              size="sm"
              variant="ghost"
              onClick={resetRotation}
              className="h-8 w-6 sm:w-8 p-0"
              title="Reset Rotation"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>

            {/* Delete */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDeleteElement(selectedElement.id)}
              className="h-8 w-6 sm:w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Image element or image variable toolbar
  if (selectedElement.type === 'image' || selectedElement.type === 'image-variable') {
    return (
      <div className="border-b border-border bg-card px-2 sm:px-4 py-2 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2 min-w-max">
          {/* Element Type Indicator */}
          <div className="text-xs text-foreground font-medium px-2 py-1 bg-muted rounded whitespace-nowrap">
            {getElementTypeDisplay()}
          </div>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          {/* Size Controls */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground hidden sm:inline">Width:</span>
            <span className="text-xs text-muted-foreground sm:hidden">W:</span>
            <Input
              type="number"
              value={Math.round(selectedElement.width || 0)}
              onChange={(e) =>
                onElementUpdate(selectedElement.id, { width: Number.parseInt(e.target.value) || 0 })
              }
              className="w-12 sm:w-16 lg:w-20 h-8 text-xs"
              min="1"
            />
            <span className="text-xs text-muted-foreground hidden sm:inline">Height:</span>
            <span className="text-xs text-muted-foreground sm:hidden">H:</span>
            <Input
              type="number"
              value={Math.round(selectedElement.height || 0)}
              onChange={(e) =>
                onElementUpdate(selectedElement.id, {
                  height: Number.parseInt(e.target.value) || 0,
                })
              }
              className="w-12 sm:w-16 lg:w-20 h-8 text-xs"
              min="1"
            />
          </div>

          <Separator orientation="vertical" className="h-6 hidden md:block" />

          {/* Position Controls - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-1">
            <span className="text-xs text-muted-foreground">X:</span>
            <Input
              type="number"
              value={Math.round(selectedElement.x)}
              onChange={(e) =>
                onElementUpdate(selectedElement.id, { x: Number.parseInt(e.target.value) || 0 })
              }
              className="w-12 lg:w-16 h-8 text-xs"
            />
            <span className="text-xs text-muted-foreground">Y:</span>
            <Input
              type="number"
              value={Math.round(selectedElement.y)}
              onChange={(e) =>
                onElementUpdate(selectedElement.id, { y: Number.parseInt(e.target.value) || 0 })
              }
              className="w-12 lg:w-16 h-8 text-xs"
            />
          </div>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          {/* Border Radius Control - Only for regular images */}
          {selectedElement.type === 'image' && (
            <>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Radius:</span>
                <Input
                  type="number"
                  value={Math.round(selectedElement.borderRadius || 0)}
                  onChange={(e) =>
                    onElementUpdate(selectedElement.id, {
                      borderRadius: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-12 sm:w-16 h-8 text-xs"
                  min="0"
                  max="500"
                />
              </div>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
            </>
          )}

          {/* Rotation Display and Reset */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground hidden sm:inline">Rotation:</span>
            <span className="text-xs text-muted-foreground sm:hidden">R:</span>
            <span className="text-xs font-mono w-6 sm:w-8 text-foreground">
              {selectedElement.rotation || 0}°
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={resetRotation}
              className="h-8 w-6 sm:w-8 p-0"
              title="Reset Rotation"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 hidden lg:block" />

          {/* Aspect Ratio Info - Hidden on mobile and tablet */}
          {selectedElement.aspectRatio && (
            <>
              <div className="hidden lg:flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Aspect Ratio:</span>
                <span className="text-xs font-mono text-foreground">
                  {selectedElement.aspectRatio.toFixed(2)}
                </span>
              </div>
              <Separator orientation="vertical" className="h-6 hidden lg:block" />
            </>
          )}

          {/* Delete */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDeleteElement(selectedElement.id)}
            className="h-8 w-6 sm:w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  return null
}
