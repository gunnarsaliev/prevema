'use client'

import { useMemo, useState, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { QuickViewDrawer } from '../components/QuickViewDrawer'
import type { QuickViewItem } from '../components/QuickViewDrawer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { makeColumns } from './columns'
import type { Partner, Organization } from '@/payload-types'
import PageHeader from '../components/page-header'
import { GenerateWithPrevemaDrawer } from './GenerateWithPrevemaDrawer'

interface EventOption {
  id: string
  name: string
}

export function PartnersTable({
  partners,
  events = [],
  selectedEventId,
}: {
  partners: Partner[]
  events?: EventOption[]
  selectedEventId?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [selected, setSelected] = useState<QuickViewItem | null>(null)
  const [generateOpen, setGenerateOpen] = useState(false)

  const handleEventChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === 'all') {
        params.delete('eventId')
      } else {
        params.set('eventId', value)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  const columns = useMemo(() => makeColumns(setSelected), [])

  const table = useReactTable({
    data: partners,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters, rowSelection },
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedPartners = selectedRows.map((r) => r.original)
  const selectedIds = selectedPartners.map((p) => String(p.id))
  const firstOrg = selectedPartners.find((p) => p.organization)?.organization
  const organizationId =
    firstOrg == null
      ? null
      : typeof firstOrg === 'object'
        ? String((firstOrg as Organization).id)
        : String(firstOrg)
  const hasSelection = selectedIds.length > 0

  return (
    <>
      <PageHeader
        title="All Partners"
        primaryAction={{
          label: 'Generate with Prevema',
          onClick: () => setGenerateOpen(true),
          disabled: !hasSelection,
          tooltip: !hasSelection ? 'Select partners first to generate with Prevema' : undefined,
        }}
        secondaryAction={{
          label: '+ Add New',
          href: selectedEventId
            ? `/tw/dash/partners/create?eventId=${selectedEventId}`
            : '/tw/dash/partners/create',
        }}
      />
      <div className="mt-8 space-y-4">
        <div className="flex flex-col gap-3 py-2 sm:flex-row sm:flex-wrap sm:items-center">
          {events.length > 0 && (
            <Select value={selectedEventId ?? 'all'} onValueChange={handleEventChange}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="All events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All events</SelectItem>
                {events.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Input
            placeholder="Filter by company name…"
            value={(table.getColumn('companyName')?.getFilterValue() as string) ?? ''}
            onChange={(e) => table.getColumn('companyName')?.setFilterValue(e.target.value)}
            className="w-full sm:max-w-xs"
          />
          <Input
            placeholder="Filter by contact…"
            value={(table.getColumn('contactPerson')?.getFilterValue() as string) ?? ''}
            onChange={(e) => table.getColumn('contactPerson')?.setFilterValue(e.target.value)}
            className="w-full sm:max-w-xs"
          />
          <span className="text-sm text-muted-foreground sm:ml-auto">
            {table.getFilteredSelectedRowModel().rows.length > 0
              ? `${table.getFilteredSelectedRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} selected`
              : `${table.getFilteredRowModel().rows.length} partner${table.getFilteredRowModel().rows.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No partners found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      <QuickViewDrawer item={selected} onClose={() => setSelected(null)} />
      <GenerateWithPrevemaDrawer
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        partnerIds={selectedIds}
        organizationId={organizationId}
      />
    </>
  )
}
