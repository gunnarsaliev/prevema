'use client'

import { Button } from '@/components/ui/button'
import {
  Type,
  Image as ImageIcon,
  Variable,
  Shapes,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import type { CanvasElement } from '@/components/canvas/types/canvas-element'

interface LayersPanelProps {
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

export default function LayersPanel({
  elements,
  selectedElementId,
  onElementSelect,
  onMoveToFront,
  onMoveToBack,
  onMoveForward,
  onMoveBackward,
  onToggleVisibility,
}: LayersPanelProps) {
  const getElementName = (element: CanvasElement, index: number) => {
    switch (element.type) {
      case 'text':
        return element.text || `Text ${index + 1}`
      case 'image':
        return element.id.includes('profile') ? `Profile Image ${index + 1}` : `Image ${index + 1}`
      case 'text-variable':
        return `Text Variable: ${element.variableName?.replace(/[{}]/g, '') || 'Unknown'}`
      case 'image-variable':
        return `Image Variable: ${element.variableName?.replace(/[{}]/g, '') || 'Unknown'}`
      case 'shape':
        return `${element.shapeType ? element.shapeType.charAt(0).toUpperCase() + element.shapeType.slice(1) : 'Shape'} ${index + 1}`
      default:
        return `Element ${index + 1}`
    }
  }

  const getElementIcon = (element: CanvasElement) => {
    switch (element.type) {
      case 'text':
        return <Type className="w-4 h-4 text-muted-foreground" />
      case 'image':
        return <ImageIcon className="w-4 h-4 text-muted-foreground" />
      case 'text-variable':
        return <Variable className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      case 'image-variable':
        return <Variable className="w-4 h-4 text-green-600 dark:text-green-400" />
      case 'shape':
        return <Shapes className="w-4 h-4 text-muted-foreground" />
      default:
        return <Type className="w-4 h-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-4 mt-2">
      {/* Section Header */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">Layers</h3>
        <p className="text-xs text-muted-foreground">Manage element order and visibility</p>
      </div>

      {elements.length === 0 ? (
        <div className="text-center py-6 px-4">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-muted/50 flex items-center justify-center">
            <Type className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <p className="text-xs text-muted-foreground">No elements yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Add text or images to get started</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* Render elements in reverse order (top layer first) */}
          {[...elements].reverse().map((element, reverseIndex) => {
            const actualIndex = elements.length - 1 - reverseIndex
            const isSelected = element.id === selectedElementId
            const isVisible = element.visible !== false

            return (
              <div
                key={element.id}
                className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary/15 border-primary shadow-md'
                    : 'bg-muted/30 border-border/50 hover:bg-muted/60 hover:border-border hover:shadow-sm'
                }`}
              >
                {/* Element Icon */}
                <div className="flex-shrink-0">{getElementIcon(element)}</div>

                {/* Element Name */}
                <div
                  className="flex-1 text-xs cursor-pointer truncate text-foreground"
                  onClick={() => onElementSelect(element.id)}
                >
                  {getElementName(element, actualIndex)}
                </div>

                {/* Layer Controls */}
                <div className="flex items-center gap-0.5">
                  {/* Visibility Toggle */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onToggleVisibility(element.id)}
                    className="w-6 h-6 p-0"
                  >
                    {isVisible ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-muted-foreground/50" />
                    )}
                  </Button>

                  {/* Move Up */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onMoveForward(element.id)}
                    disabled={actualIndex === elements.length - 1}
                    className="w-6 h-6 p-0"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </Button>

                  {/* Move Down */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onMoveBackward(element.id)}
                    disabled={actualIndex === 0}
                    className="w-6 h-6 p-0"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick Layer Actions */}
      {selectedElementId && (
        <div className="pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">Quick Actions</div>
          <div className="grid grid-cols-2 gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMoveToFront(selectedElementId)}
              className="text-xs h-8"
            >
              To Front
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMoveToBack(selectedElementId)}
              className="text-xs h-8"
            >
              To Back
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
