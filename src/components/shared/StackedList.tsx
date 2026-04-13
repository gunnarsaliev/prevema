'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Row } from '@tanstack/react-table'
import { MoreHorizontal, Eye, Pencil, Trash2, Loader2, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BulkAction } from '@/components/ui/data-table'

export interface StackedListItem {
  id: number | string
  title: string
  href?: string
  subtitle?: string
  description?: string
  status?: {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  meta?: { label: string; value: string }[]
  imageUrl?: string | null
  onQuickView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  isDeleting?: boolean
}

interface StackedListProps {
  items: StackedListItem[]
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  selectedIds?: (number | string)[]
  onSelectionChange?: (ids: (number | string)[]) => void
  bulkActions?: BulkAction<any>[]
  emptyTitle?: string
  emptyDescription?: string
  emptyActionHref?: string
  emptyActionLabel?: string
}

export function StackedList({
  items,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  selectedIds = [],
  onSelectionChange,
  bulkActions = [],
  emptyTitle = 'No items',
  emptyDescription,
  emptyActionHref,
  emptyActionLabel,
}: StackedListProps) {
  const [localSearch, setLocalSearch] = useState('')
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean
    action: BulkAction<any> | null
    selectedItems: StackedListItem[]
  }>({
    open: false,
    action: null,
    selectedItems: [],
  })

  const search = searchValue !== undefined ? searchValue : localSearch
  const setSearch = onSearchChange || setLocalSearch

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  )

  const hasSelection = selectedIds.length > 0

  const toggleSelection = (id: number | string) => {
    if (!onSelectionChange) return
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter((sid) => sid !== id)
      : [...selectedIds, id]
    onSelectionChange(newSelection)
  }

  const toggleAll = () => {
    if (!onSelectionChange) return
    const allSelected = filteredItems.every((item) => selectedIds.includes(item.id))
    if (allSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(filteredItems.map((item) => item.id))
    }
  }

  const handleBulkAction = (action: BulkAction<any>) => {
    const selectedItems = items.filter((item) => selectedIds.includes(item.id))
    if (action.confirmation) {
      setConfirmationDialog({ open: true, action, selectedItems })
    } else {
      const mockRows = selectedItems.map((item) => ({ original: item })) as Row<any>[]
      action.onClick(mockRows)
    }
  }

  const handleConfirm = async () => {
    if (confirmationDialog.action) {
      const mockRows = confirmationDialog.selectedItems.map((item) => ({
        original: item,
      })) as Row<any>[]
      await confirmationDialog.action.onClick(mockRows)
      setConfirmationDialog({ open: false, action: null, selectedItems: [] })
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-lg font-medium">{emptyTitle}</p>
        {emptyDescription && (
          <p className="text-sm text-muted-foreground mt-1 mb-4">{emptyDescription}</p>
        )}
        {emptyActionHref && emptyActionLabel && (
          <Button asChild className="mt-4">
            <Link href={emptyActionHref}>{emptyActionLabel}</Link>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Toolbar */}
      {hasSelection && bulkActions.length > 0 && (
        <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {selectedIds.length} item(s) selected
          </div>
          <div className="flex items-center gap-2">
            {bulkActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant ?? 'default'}
                size="sm"
                onClick={() => handleBulkAction(action)}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => onSelectionChange?.([])}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      {onSearchChange && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Stacked List */}
      <div className="divide-y divide-border rounded-lg border bg-card">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
          >
            {/* Checkbox */}
            {onSelectionChange && (
              <Checkbox
                checked={selectedIds.includes(item.id)}
                onCheckedChange={() => toggleSelection(item.id)}
                aria-label={`Select ${item.title}`}
              />
            )}

            {/* Image */}
            {item.imageUrl && (
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {item.href ? (
                  <Link
                    href={item.href}
                    className="font-medium text-foreground hover:text-primary hover:underline truncate"
                  >
                    {item.title}
                  </Link>
                ) : (
                  <span className="font-medium truncate">{item.title}</span>
                )}
                {item.status && (
                  <Badge variant={item.status.variant}>{item.status.label}</Badge>
                )}
              </div>
              {item.subtitle && (
                <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
              )}
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {item.description}
                </p>
              )}
              {item.meta && item.meta.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {item.meta.map((m, idx) => (
                    <span key={idx} className="text-xs text-muted-foreground">
                      <span className="font-medium">{m.label}:</span> {m.value}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Quick View Button */}
              {item.onQuickView && (
                <Button variant="outline" size="sm" onClick={item.onQuickView}>
                  <Eye className="mr-2 h-4 w-4" />
                  Quick View
                </Button>
              )}

              {/* 3-Dot Menu */}
              {(item.onEdit || item.onDelete || item.onQuickView) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {item.onQuickView && (
                      <DropdownMenuItem onClick={item.onQuickView}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                    )}
                    {item.onEdit && item.href && (
                      <DropdownMenuItem asChild>
                        <Link href={item.href}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {item.onDelete && (
                      <DropdownMenuItem
                        onClick={item.onDelete}
                        disabled={item.isDeleting}
                        className="text-destructive focus:text-destructive"
                      >
                        {item.isDeleting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      {confirmationDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-lg border p-6 max-w-md w-full mx-4 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">
              {confirmationDialog.action?.confirmation?.title || 'Confirm Action'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {typeof confirmationDialog.action?.confirmation?.description === 'function'
                ? confirmationDialog.action.confirmation.description(
                    confirmationDialog.selectedItems.length
                  )
                : confirmationDialog.action?.confirmation?.description}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setConfirmationDialog({ open: false, action: null, selectedItems: [] })
                }
              >
                {confirmationDialog.action?.confirmation?.cancelLabel || 'Cancel'}
              </Button>
              <Button
                variant={confirmationDialog.action?.variant ?? 'default'}
                onClick={handleConfirm}
              >
                {confirmationDialog.action?.confirmation?.confirmLabel || 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
