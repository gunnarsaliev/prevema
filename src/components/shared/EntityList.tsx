'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { LayoutGrid, Table as TableIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DataTable, BulkAction } from '@/components/ui/data-table'
import { StackedList, StackedListItem } from './StackedList'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type ViewMode = 'table' | 'stacked'

export interface EntityListConfig<TData> {
  // Table configuration
  columns: ColumnDef<TData>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string

  // Empty state configuration
  emptyTitle?: string
  emptyDescription?: string
  emptyActionHref?: string
  emptyActionLabel?: string
  emptyIcon?: ReactNode

  // Bulk actions
  bulkActions?: BulkAction<TData>[]

  // Optional filter
  filter?: {
    label: string
    value: string
    options: Array<{ value: string; label: string }>
    onChange: (value: string) => void
  }

  // Stacked list configuration
  toStackedListItem?: (data: TData) => StackedListItem
  enableViewToggle?: boolean
  defaultViewMode?: ViewMode
}

interface EntityListProps<TData> {
  config: EntityListConfig<TData>
}

export function EntityList<TData>({ config }: EntityListProps<TData>) {
  const {
    columns,
    data,
    searchKey,
    searchPlaceholder,
    emptyTitle,
    emptyDescription,
    emptyActionHref,
    emptyActionLabel,
    emptyIcon,
    bulkActions,
    filter,
    toStackedListItem,
    enableViewToggle = false,
    defaultViewMode = 'table',
  } = config

  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode)
  const [searchValue, setSearchValue] = useState('')
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([])

  // Convert data to stacked list items if needed
  const stackedListItems = toStackedListItem ? data.map(toStackedListItem) : []

  // Filter items based on search (client-side filtering for stacked list)
  const filteredItems = searchValue
    ? stackedListItems.filter((item) =>
        item.title.toLowerCase().includes(searchValue.toLowerCase()),
      )
    : stackedListItems

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      {enableViewToggle && data.length > 0 && (
        <div className="flex items-center justify-end gap-2">
          <div className="flex items-center rounded-md border bg-muted p-1">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewMode('table')}
            >
              <TableIcon className="h-4 w-4 mr-1" />
              Table
            </Button>
            <Button
              variant={viewMode === 'stacked' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewMode('stacked')}
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              List
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          {emptyIcon && <div className="mb-4">{emptyIcon}</div>}
          {emptyTitle && <p className="text-lg font-medium">{emptyTitle}</p>}
          {emptyDescription && (
            <p className="text-sm text-muted-foreground mt-1 mb-4">{emptyDescription}</p>
          )}
          {emptyActionHref && emptyActionLabel && (
            <Button asChild className="mt-4">
              <Link href={emptyActionHref}>{emptyActionLabel}</Link>
            </Button>
          )}
        </div>
      ) : viewMode === 'table' || !enableViewToggle ? (
        <DataTable
          columns={columns}
          data={data}
          searchKey={searchKey}
          searchPlaceholder={searchPlaceholder}
          bulkActions={bulkActions}
        />
      ) : (
        <StackedList
          items={filteredItems}
          searchPlaceholder={searchPlaceholder}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          bulkActions={bulkActions}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          emptyActionHref={emptyActionHref}
          emptyActionLabel={emptyActionLabel}
        />
      )}
    </div>
  )
}
