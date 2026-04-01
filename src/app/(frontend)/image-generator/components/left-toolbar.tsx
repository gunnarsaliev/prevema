'use client'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Star,
  Triangle,
  Sparkles,
  Variable
} from 'lucide-react'
import { useState } from 'react'

interface LeftToolbarProps {
  onAddText: () => void
  onAddImage: () => void
  onAddShape: (shape: 'square' | 'circle' | 'triangle' | 'star') => void
  onAddTextVariable: (variableType: string, variableName: string) => void
  onAddImageVariable: (variableType: string, variableName: string) => void
  textVariables: Array<{ id: string; name: string; displayName: string }>
  imageVariables: Array<{ id: string; name: string; displayName: string }>
}

export default function LeftToolbar({
  onAddText,
  onAddImage,
  onAddShape,
  onAddTextVariable,
  onAddImageVariable,
  textVariables,
  imageVariables,
}: LeftToolbarProps) {
  const [openPopover, setOpenPopover] = useState<string | null>(null)

  return (
    <div className="w-16 border-r border-border bg-background flex flex-col items-center py-4 gap-2">
      {/* Text Tool */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onAddText}
        className="w-12 h-12 p-0 flex flex-col items-center justify-center gap-1 hover:bg-muted"
        title="Add Text"
      >
        <Type className="w-5 h-5" />
        <span className="text-[10px]">Text</span>
      </Button>

      {/* Image Upload Tool */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onAddImage}
        className="w-12 h-12 p-0 flex flex-col items-center justify-center gap-1 hover:bg-muted"
        title="Upload Image"
      >
        <ImageIcon className="w-5 h-5" />
        <span className="text-[10px]">Image</span>
      </Button>

      {/* Shapes Tool */}
      <Popover open={openPopover === 'shapes'} onOpenChange={(open) => setOpenPopover(open ? 'shapes' : null)}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 flex flex-col items-center justify-center gap-1 hover:bg-muted"
            title="Add Shape"
          >
            <Square className="w-5 h-5" />
            <span className="text-[10px]">Shape</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" className="w-48 p-2">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-2 px-2">Shapes</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onAddShape('square')
                setOpenPopover(null)
              }}
              className="w-full justify-start gap-3"
            >
              <Square className="w-4 h-4" />
              <span>Square</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onAddShape('circle')
                setOpenPopover(null)
              }}
              className="w-full justify-start gap-3"
            >
              <Circle className="w-4 h-4" />
              <span>Circle</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onAddShape('triangle')
                setOpenPopover(null)
              }}
              className="w-full justify-start gap-3"
            >
              <Triangle className="w-4 h-4" />
              <span>Triangle</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onAddShape('star')
                setOpenPopover(null)
              }}
              className="w-full justify-start gap-3"
            >
              <Star className="w-4 h-4" />
              <span>Star</span>
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <div className="h-px w-8 bg-border my-1" />

      {/* Text Variables */}
      <Popover open={openPopover === 'text-vars'} onOpenChange={(open) => setOpenPopover(open ? 'text-vars' : null)}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 flex flex-col items-center justify-center gap-1 hover:bg-muted"
            title="Text Variables"
          >
            <Variable className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-[10px]">Text</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" className="w-56 p-2">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-2 px-2">Text Variables</p>
            {textVariables.map((variable) => (
              <Button
                key={variable.id}
                variant="ghost"
                size="sm"
                onClick={() => {
                  onAddTextVariable(variable.id, variable.displayName)
                  setOpenPopover(null)
                }}
                className="w-full justify-start gap-3"
              >
                <Variable className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm">{variable.name}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Image Variables */}
      <Popover open={openPopover === 'image-vars'} onOpenChange={(open) => setOpenPopover(open ? 'image-vars' : null)}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 flex flex-col items-center justify-center gap-1 hover:bg-muted"
            title="Image Variables"
          >
            <Variable className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-[10px]">Image</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" className="w-56 p-2">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-2 px-2">Image Variables</p>
            {imageVariables.map((variable) => (
              <Button
                key={variable.id}
                variant="ghost"
                size="sm"
                onClick={() => {
                  onAddImageVariable(variable.id, variable.displayName)
                  setOpenPopover(null)
                }}
                className="w-full justify-start gap-3"
              >
                <Variable className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm">{variable.name}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex-1" />

      {/* Elements/AI Tool (placeholder) */}
      <Button
        variant="ghost"
        size="sm"
        className="w-12 h-12 p-0 flex flex-col items-center justify-center gap-1 hover:bg-muted opacity-50"
        title="AI Tools (Coming Soon)"
        disabled
      >
        <Sparkles className="w-5 h-5" />
        <span className="text-[10px]">AI</span>
      </Button>
    </div>
  )
}
