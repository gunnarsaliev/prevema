'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Type,
  Image as ImageIcon,
  Shapes,
  Variable,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Paintbrush,
} from 'lucide-react'
import type { CanvasElement, Template } from '@/components/canvas/types/canvas-element'

interface ImageGeneratorPanelContentProps {
  // Tool handlers
  onAddText: () => void
  onAddImage: () => void
  onAddShape: (shape: 'square' | 'circle' | 'triangle' | 'star') => void
  onAddTextVariable: (variableType: string, variableName: string) => void
  onAddImageVariable: (variableType: string, variableName: string) => void
  textVariables: Array<{ id: string; name: string; displayName: string }>
  imageVariables: Array<{ id: string; name: string; displayName: string }>

  // Template/Canvas settings
  selectedTemplate: Template
  onTemplateUpdate: (updates: Partial<Template>) => void

  // Layer management
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
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DFE6E9', '#74B9FF', '#A29BFE', '#FD79A8', '#FDCB6E',
    '#6C5CE7', '#00B894', '#00CEC9', '#0984E3', '#B2BEC3',
    '#2D3436', '#636E72', '#FFFFFF', '#F8F9FA', '#E9ECEF',
  ],
  pastels: [
    '#FFE5E5', '#FFF0F0', '#E5F4FF', '#F0E5FF', '#E5FFE5',
    '#FFF5E5', '#FFE5F5', '#E5FFFF', '#F5FFE5', '#FFE5EB',
  ],
}

export default function ImageGeneratorPanelContent({
  onAddText,
  onAddImage,
  onAddShape,
  onAddTextVariable,
  onAddImageVariable,
  textVariables,
  imageVariables,
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
}: ImageGeneratorPanelContentProps) {
  const selectedColor = selectedTemplate.backgroundImage.startsWith('#')
    ? selectedTemplate.backgroundImage
    : '#ffffff'

  const handleGradientClick = (colors: string[]) => {
    onTemplateUpdate({ backgroundImage: colors[0] })
  }

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
    <div className="space-y-3">
      <Accordion type="multiple" defaultValue={['tools', 'canvas', 'colors', 'layers']} className="space-y-2">
        {/* Section 1: Design Tools */}
        <AccordionItem value="tools" className="border rounded-lg px-3 bg-card">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
            Design Tools
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="space-y-2">
              {/* Text */}
              <Button
                onClick={onAddText}
                variant="outline"
                className="w-full justify-start gap-2 h-10"
              >
                <Type className="w-4 h-4" />
                <span>Add Text</span>
              </Button>

              {/* Image */}
              <Button
                onClick={onAddImage}
                variant="outline"
                className="w-full justify-start gap-2 h-10"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Add Image</span>
              </Button>

              {/* Shapes */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2 h-10">
                    <Shapes className="w-4 h-4" />
                    <span>Add Shape</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56" side="right" align="start">
                  <div className="space-y-1">
                    <p className="text-sm font-medium mb-2">Select Shape</p>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => onAddShape('square')}
                    >
                      Square
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => onAddShape('circle')}
                    >
                      Circle
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => onAddShape('triangle')}
                    >
                      Triangle
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => onAddShape('star')}
                    >
                      Star
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Text Variables */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2 h-10">
                    <Variable className="w-4 h-4" />
                    <span>Text Variable</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" side="right" align="start">
                  <div className="space-y-1">
                    <p className="text-sm font-medium mb-2">Select Text Variable</p>
                    {textVariables.map((variable) => (
                      <Button
                        key={variable.id}
                        variant="ghost"
                        className="w-full justify-start text-xs"
                        onClick={() => onAddTextVariable(variable.id, variable.displayName)}
                      >
                        {variable.displayName}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Image Variables */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2 h-10">
                    <Variable className="w-4 h-4" />
                    <span>Image Variable</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" side="right" align="start">
                  <div className="space-y-1">
                    <p className="text-sm font-medium mb-2">Select Image Variable</p>
                    {imageVariables.map((variable) => (
                      <Button
                        key={variable.id}
                        variant="ghost"
                        className="w-full justify-start text-xs"
                        onClick={() => onAddImageVariable(variable.id, variable.displayName)}
                      >
                        {variable.displayName}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 2: Canvas Settings */}
        <AccordionItem value="canvas" className="border rounded-lg px-3 bg-card">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
            Canvas Settings
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="space-y-3">
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
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 3: Background Colors */}
        <AccordionItem value="colors" className="border rounded-lg px-3 bg-card">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3 gap-2">
            <div className="flex items-center gap-2">
              <Paintbrush className="w-4 h-4" />
              <span>Background Colors</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="space-y-3">
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
          </AccordionContent>
        </AccordionItem>

        {/* Section 4: Layers */}
        <AccordionItem value="layers" className="border rounded-lg px-3 bg-card">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
            Layers
          </AccordionTrigger>
          <AccordionContent className="pb-3">
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
              <div className="pt-3 border-t border-border mt-3">
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
