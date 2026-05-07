'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { makeColumns } from './columns'
import type { PartnerType } from '@/payload-types'
import PageHeader from '../components/page-header'
import { CreatePartnerTypeDrawer } from '../partners/create/CreatePartnerTypeDrawer'

export function PartnerTypesTable({ partnerTypes }: { partnerTypes: PartnerType[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<QuickViewItem | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  const columns = useMemo(() => makeColumns(setSelected), [])

  const table = useReactTable({
    data: partnerTypes,
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

  return (
    <>
      <PageHeader
        title="Partner Types"
        secondaryAction={{
          label: '+ Add New',
          onClick: () => setCreateOpen(true),
        }}
      />
      <div className="mt-8 space-y-4">
        <div className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Filter by name…"
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(e) => table.getColumn('name')?.setFilterValue(e.target.value)}
            className="w-full sm:max-w-xs"
          />
          <span className="text-sm text-muted-foreground sm:ml-auto">
            {table.getFilteredRowModel().rows.length} partner type
            {table.getFilteredRowModel().rows.length !== 1 ? 's' : ''}
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
                    No partner types found.
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
      <CreatePartnerTypeDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => {
          router.refresh()
        }}
      />
    </>
  )
}
