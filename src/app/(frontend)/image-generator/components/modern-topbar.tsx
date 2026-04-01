'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, Save, Redo, Undo } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ModernTopbarProps {
  selectedTemplate: {
    id: string
    name: string
    width: number
    height: number
  }
  templates: Array<{
    id: string
    name: string
    width: number
    height: number
  }>
  onTemplateChange: (templateId: string) => void
  onSave: () => void
  onExport: () => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  editMode?: {
    mode: 'create' | 'edit'
    templateId?: string
  }
}

export default function ModernTopbar({
  selectedTemplate,
  templates,
  onTemplateChange,
  onSave,
  onExport,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  editMode,
}: ModernTopbarProps) {
  return (
    <div className="h-14 border-b border-border bg-background flex items-center justify-between px-4 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <Link href="/dash" className="flex items-center">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
        </Link>

        <div className="h-6 w-px bg-border hidden sm:block" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="w-9 h-9 p-0"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            className="w-9 h-9 p-0"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Center Section - Template Selector */}
      <div className="flex items-center gap-3">
        <Select value={selectedTemplate.id} onValueChange={onTemplateChange}>
          <SelectTrigger className="w-[280px] h-9 bg-muted/30 border-border/50 hover:bg-muted/50 transition-colors">
            <SelectValue>
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{selectedTemplate.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {selectedTemplate.width} × {selectedTemplate.height}
                </span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{template.name}</span>
                  <span className="text-xs text-muted-foreground ml-4">
                    {template.width} × {template.height}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="gap-2 h-9"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onSave}
          className="gap-2 h-9 bg-primary hover:bg-primary/90"
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">
            {editMode?.mode === 'edit' ? 'Save Changes' : 'Save Template'}
          </span>
          <span className="sm:hidden">Save</span>
        </Button>
      </div>
    </div>
  )
}
