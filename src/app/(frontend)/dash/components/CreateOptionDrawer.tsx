'use client'

import { useState, useTransition } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/catalyst/button'
import { Field, Label, ErrorMessage } from '@/components/catalyst/fieldset'
import { Input } from '@/components/catalyst/input'

export interface CreatedOption {
  id: number
  name: string
}

interface CreateOptionDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  inputLabel?: string
  onSubmit: (
    name: string,
  ) => Promise<{ success: true; item: CreatedOption } | { success: false; message: string }>
  onCreated: (item: CreatedOption) => void
}

export function CreateOptionDrawer({
  open,
  onOpenChange,
  title,
  inputLabel = 'Name',
  onSubmit,
  onCreated,
}: CreateOptionDrawerProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleClose = () => {
    if (isPending) return
    setName('')
    setError(null)
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError(`${inputLabel} is required`)
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await onSubmit(name.trim())
      if (result.success) {
        onCreated(result.item)
        setName('')
        onOpenChange(false)
      } else {
        setError(result.message)
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <SheetContent side="right" className="flex flex-col sm:max-w-sm">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 px-6 pt-4">
          <Field>
            <Label>{inputLabel} *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${inputLabel.toLowerCase()}…`}
              autoFocus
              data-invalid={error ? true : undefined}
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </Field>
          <div className="mt-auto flex justify-end gap-3 pb-6">
            <Button type="button" plain onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
