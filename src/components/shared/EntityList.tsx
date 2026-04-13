'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { LayoutGrid, Table as TableIcon, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

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

  // Optional filters
  filter?: {
    label: string
    value: string
    options: Array<{ value: string; label: string }>
    onChange: (value: string) => void
  }
  filters?: {
    label: string
    value: string
    options: Array<{ value: string; label: string }>
    onChange: (value: string) => void
  }[]

  // Stacked list configuration
  toStackedListItem?: (data: TData) => StackedListItem
  enableViewToggle?: boolean
  defaultViewMode?: ViewMode

  // Sort configuration
  sort?: {
    label: string
    value: string
    options: Array<{ value: string; label: string }>
    onChange: (value: string) => void
    sortDirection: 'asc' | 'desc'
    onDirectionChange: () => void
  }
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
    filters,
    toStackedListItem,
    enableViewToggle = false,
    defaultViewMode = 'table',
  } = config

  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode)
  const [searchValue, setSearchValue] = useState('')
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([])

  // Extract sort from config
  const sort = config.sort

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
      {/* View Mode Toggle and Filters */}
      {(enableViewToggle || filters || filter) && data.length > 0 && (
        <div className="flex items-center justify-between gap-4">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Single filter (legacy support) */}
            {filter && (
              <Select value={filter.value} onValueChange={filter.onChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {/* Multiple filters */}
            {filters?.map((f, index) => (
              <Select key={index} value={f.value} onValueChange={f.onChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={f.label} />
                </SelectTrigger>
                <SelectContent>
                  {f.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
            {/* Sort */}
            {sort && (
              <div className="flex items-center gap-2">
                <Select value={sort.value} onValueChange={sort.onChange}>
                  <SelectTrigger className="w-[160px]">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={sort.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {sort.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={sort.onDirectionChange}
                  title={sort.sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sort.sortDirection === 'asc' ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* View Mode Toggle */}
          {enableViewToggle && (
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
          )}
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
