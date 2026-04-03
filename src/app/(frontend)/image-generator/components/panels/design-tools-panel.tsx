'use client'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Type, Image as ImageIcon, Shapes, Variable } from 'lucide-react'

interface DesignToolsPanelProps {
  onAddText: () => void
  onAddImage: () => void
  onAddShape: (shape: 'square' | 'circle' | 'triangle' | 'star') => void
  onAddTextVariable: (variableType: string, variableName: string) => void
  onAddImageVariable: (variableType: string, variableName: string) => void
  textVariables: Array<{ id: string; name: string; displayName: string }>
  imageVariables: Array<{ id: string; name: string; displayName: string }>
}

export default function DesignToolsPanel({
  onAddText,
  onAddImage,
  onAddShape,
  onAddTextVariable,
  onAddImageVariable,
  textVariables,
  imageVariables,
}: DesignToolsPanelProps) {
  return (
    <div className="space-y-4 mt-2">
      {/* Section Header */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">Design Tools</h3>
        <p className="text-xs text-muted-foreground">Add elements to your canvas</p>
      </div>

      {/* Basic Elements */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Basic Elements
        </p>
        {/* Text */}
        <Button onClick={onAddText} variant="outline" className="w-full justify-start gap-2 h-10">
          <Type className="w-4 h-4" />
          <span>Add Text</span>
        </Button>

        {/* Image */}
        <Button onClick={onAddImage} variant="outline" className="w-full justify-start gap-2 h-10">
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
      </div>

      {/* Dynamic Variables */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Dynamic Variables
        </p>
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
    </div>
  )
}
