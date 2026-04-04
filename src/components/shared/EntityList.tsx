'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { DataTable, BulkAction } from '@/components/ui/data-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  } = config

  return (
    <div className="space-y-4">
      {/* Optional Filter */}
      {filter && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{filter.label}</span>
          <Select value={filter.value} onValueChange={filter.onChange}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Empty State or Data Table */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          {emptyIcon && <div className="mb-4">{emptyIcon}</div>}
          {emptyTitle && <p className="text-lg font-medium">{emptyTitle}</p>}
          {emptyDescription && (
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {emptyDescription}
            </p>
          )}
          {emptyActionHref && emptyActionLabel && (
            <Button asChild className="mt-4">
              <Link href={emptyActionHref}>{emptyActionLabel}</Link>
            </Button>
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          searchKey={searchKey}
          searchPlaceholder={searchPlaceholder}
          bulkActions={bulkActions}
        />
      )}
    </div>
  )
}
