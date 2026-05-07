'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'

const orderStatuses: OrderStatus[] = ['Processing', 'Shipped', 'Delivered', 'Cancelled']

const statusStyles: Record<OrderStatus, string> = {
  Processing: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-400/20',
  Shipped: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/20',
  Delivered: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-400/20',
  Cancelled: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-400/20',
}

const orders = [
  { id: '1', orderNumber: 'ORD-2024-001', customer: 'Sarah Johnson', status: 'Delivered' as OrderStatus, total: 2499.0 },
  { id: '2', orderNumber: 'ORD-2024-002', customer: 'Michael Chen', status: 'Shipped' as OrderStatus, total: 1348.0 },
  { id: '3', orderNumber: 'ORD-2024-003', customer: 'Emma Wilson', status: 'Processing' as OrderStatus, total: 1198.0 },
  { id: '4', orderNumber: 'ORD-2024-004', customer: 'James Rodriguez', status: 'Delivered' as OrderStatus, total: 799.0 },
  { id: '5', orderNumber: 'ORD-2024-005', customer: 'Lisa Park', status: 'Cancelled' as OrderStatus, total: 599.0 },
  { id: '6', orderNumber: 'ORD-2024-006', customer: 'David Kim', status: 'Shipped' as OrderStatus, total: 5498.0 },
  { id: '7', orderNumber: 'ORD-2024-007', customer: 'Anna Martinez', status: 'Delivered' as OrderStatus, total: 1199.0 },
  { id: '8', orderNumber: 'ORD-2024-008', customer: 'Robert Taylor', status: 'Processing' as OrderStatus, total: 1128.0 },
  { id: '9', orderNumber: 'ORD-2024-009', customer: 'Jennifer Lee', status: 'Shipped' as OrderStatus, total: 449.0 },
  { id: '10', orderNumber: 'ORD-2024-010', customer: 'William Brown', status: 'Delivered' as OrderStatus, total: 2199.0 },
  { id: '11', orderNumber: 'ORD-2024-011', customer: 'Sophia Davis', status: 'Cancelled' as OrderStatus, total: 349.0 },
  { id: '12', orderNumber: 'ORD-2024-012', customer: 'Daniel Garcia', status: 'Processing' as OrderStatus, total: 899.0 },
]

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const tableHeadClass = 'text-xs font-medium text-muted-foreground sm:text-sm'

export function RecentOrdersTable() {
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = React.useState(1)
  const pageSize = 6

  const filteredOrders = React.useMemo(
    () => (statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter)),
    [statusFilter],
  )

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize))

  const paginatedOrders = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredOrders.slice(startIndex, startIndex + pageSize)
  }, [filteredOrders, currentPage])

  React.useEffect(() => { setCurrentPage(1) }, [statusFilter])

  const startRow = filteredOrders.length ? (currentPage - 1) * pageSize + 1 : 0
  const endRow = Math.min(currentPage * pageSize, filteredOrders.length)
  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)))

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-6">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium sm:text-base">Recent Orders</h2>
          <span className="ml-1 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset sm:text-xs dark:bg-gray-800/50 dark:text-gray-400 dark:ring-gray-400/20">
            {filteredOrders.length}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 sm:h-9 sm:gap-2">
              <span className="text-xs sm:text-sm">{statusFilter === 'all' ? 'All' : statusFilter}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuCheckboxItem checked={statusFilter === 'all'} onCheckedChange={() => setStatusFilter('all')}>
              All Statuses
            </DropdownMenuCheckboxItem>
            {orderStatuses.map((status) => (
              <DropdownMenuCheckboxItem key={status} checked={statusFilter === status} onCheckedChange={() => setStatusFilter(status)}>
                {status}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-4 pt-3 pb-4 sm:px-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className={tableHeadClass}>Order Ref</TableHead>
              <TableHead className={tableHeadClass}>Buyer</TableHead>
              <TableHead className={tableHeadClass}>Total</TableHead>
              <TableHead className={tableHeadClass}>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-20 text-center text-sm text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-xs font-medium text-muted-foreground sm:text-sm">{order.orderNumber}</TableCell>
                  <TableCell className="text-xs text-muted-foreground sm:text-sm">{order.customer}</TableCell>
                  <TableCell className="text-xs text-foreground tabular-nums sm:text-sm">{currencyFormatter.format(order.total)}</TableCell>
                  <TableCell>
                    <span className={cn('inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium sm:text-xs', statusStyles[order.status])}>
                      {order.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between border-t px-4 py-3 text-[10px] text-muted-foreground sm:px-6 sm:text-xs">
        <span>{startRow}-{endRow} of {filteredOrders.length}</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="size-7" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page">
            <ChevronLeft className="size-3.5" aria-hidden="true" />
          </Button>
          <Button variant="outline" size="icon" className="size-7" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page">
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  )
}
