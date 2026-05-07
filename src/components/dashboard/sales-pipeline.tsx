'use client'

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type ChartConfig, ChartContainer } from '@/components/ui/chart'

const mixBase = 'var(--background)'
const palette = {
  primary: 'var(--primary)',
  secondary: {
    light: `color-mix(in oklch, var(--primary) 75%, ${mixBase})`,
    dark: `color-mix(in oklch, var(--primary) 85%, ${mixBase})`,
  },
}

const numberFormatter = new Intl.NumberFormat('en-US')
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 0,
})
const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' })
const monthLabel = (m: number) => monthFormatter.format(new Date(2025, m, 1))

const ordersBarConfig = {
  orders: { label: 'Orders', color: palette.primary },
} satisfies ChartConfig

const salesBarConfig = {
  sales: { label: 'Sales', theme: palette.secondary },
} satisfies ChartConfig

const createHighlightBarShape = (fill: string) => (props: unknown) => {
  const { x, y, width, height, index } = props as { x: number; y: number; width: number; height: number; index: number }
  const isHighlight = index === 5
  return <rect x={x} y={y} width={width} height={height} fill={fill} opacity={isHighlight ? 1 : 0.45} rx={4} ry={4} />
}

const salesPipelineData: Record<string, { week: string; month: string; orders: number; sales: number }[]> = {
  q1: [
    { week: 'W1', month: monthLabel(0), orders: 220, sales: 5100 },
    { week: 'W2', month: monthLabel(0), orders: 480, sales: 11200 },
    { week: 'W3', month: monthLabel(0), orders: 390, sales: 9400 },
    { week: 'W4', month: monthLabel(0), orders: 150, sales: 3600 },
    { week: 'W5', month: monthLabel(1), orders: 310, sales: 7400 },
    { week: 'W6', month: monthLabel(1), orders: 540, sales: 13100 },
    { week: 'W7', month: monthLabel(1), orders: 460, sales: 10800 },
    { week: 'W8', month: monthLabel(1), orders: 200, sales: 4700 },
    { week: 'W9', month: monthLabel(2), orders: 130, sales: 3100 },
    { week: 'W10', month: monthLabel(2), orders: 420, sales: 10200 },
    { week: 'W11', month: monthLabel(2), orders: 510, sales: 12400 },
    { week: 'W12', month: monthLabel(2), orders: 350, sales: 8500 },
  ],
  q2: [
    { week: 'W1', month: monthLabel(3), orders: 410, sales: 9800 },
    { week: 'W2', month: monthLabel(3), orders: 280, sales: 6700 },
    { week: 'W3', month: monthLabel(3), orders: 120, sales: 2900 },
    { week: 'W4', month: monthLabel(3), orders: 350, sales: 8400 },
    { week: 'W5', month: monthLabel(4), orders: 520, sales: 12600 },
    { week: 'W6', month: monthLabel(4), orders: 470, sales: 11300 },
    { week: 'W7', month: monthLabel(4), orders: 190, sales: 4500 },
    { week: 'W8', month: monthLabel(4), orders: 100, sales: 2400 },
    { week: 'W9', month: monthLabel(5), orders: 330, sales: 7900 },
    { week: 'W10', month: monthLabel(5), orders: 490, sales: 11800 },
    { week: 'W11', month: monthLabel(5), orders: 540, sales: 13000 },
    { week: 'W12', month: monthLabel(5), orders: 260, sales: 6200 },
  ],
  q3: [
    { week: 'W1', month: monthLabel(6), orders: 180, sales: 4200 },
    { week: 'W2', month: monthLabel(6), orders: 520, sales: 12800 },
    { week: 'W3', month: monthLabel(6), orders: 480, sales: 11500 },
    { week: 'W4', month: monthLabel(6), orders: 120, sales: 2800 },
    { week: 'W5', month: monthLabel(7), orders: 90, sales: 2100 },
    { week: 'W6', month: monthLabel(7), orders: 450, sales: 10500 },
    { week: 'W7', month: monthLabel(7), orders: 510, sales: 12200 },
    { week: 'W8', month: monthLabel(7), orders: 480, sales: 11000 },
    { week: 'W9', month: monthLabel(8), orders: 200, sales: 4800 },
    { week: 'W10', month: monthLabel(8), orders: 150, sales: 3500 },
    { week: 'W11', month: monthLabel(8), orders: 380, sales: 9200 },
    { week: 'W12', month: monthLabel(8), orders: 420, sales: 10100 },
  ],
  q4: [
    { week: 'W1', month: monthLabel(9), orders: 300, sales: 7200 },
    { week: 'W2', month: monthLabel(9), orders: 160, sales: 3800 },
    { week: 'W3', month: monthLabel(9), orders: 440, sales: 10600 },
    { week: 'W4', month: monthLabel(9), orders: 530, sales: 12900 },
    { week: 'W5', month: monthLabel(10), orders: 380, sales: 9100 },
    { week: 'W6', month: monthLabel(10), orders: 140, sales: 3400 },
    { week: 'W7', month: monthLabel(10), orders: 250, sales: 6000 },
    { week: 'W8', month: monthLabel(10), orders: 500, sales: 12100 },
    { week: 'W9', month: monthLabel(11), orders: 550, sales: 13300 },
    { week: 'W10', month: monthLabel(11), orders: 470, sales: 11400 },
    { week: 'W11', month: monthLabel(11), orders: 210, sales: 5000 },
    { week: 'W12', month: monthLabel(11), orders: 340, sales: 8200 },
  ],
}

function PipelineTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean
  payload?: { value?: number }[]
  label?: string
  valueFormatter: (v: number) => string
}) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{valueFormatter(Number(entry.value))}</p>
    </div>
  )
}

export function SalesPipelineChart() {
  const [quarter, setQuarter] = React.useState('q1')
  const data = salesPipelineData[quarter] ?? salesPipelineData.q1
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0)
  const totalSales = data.reduce((sum, d) => sum + d.sales, 0)

  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-xl border bg-card">
      <div className="flex h-14 items-center justify-between border-b px-4 sm:px-5">
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="icon" className="size-7 sm:size-8" aria-label="Sales Pipeline">
            <BarChart3 className="size-4 text-muted-foreground sm:size-[18px]" aria-hidden="true" />
          </Button>
          <h2 className="text-sm font-medium sm:text-base">Sales Pipeline</h2>
        </div>
        <Select value={quarter} onValueChange={setQuarter}>
          <SelectTrigger className="h-7 w-[120px] text-xs" aria-label="Select quarter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="q1">Quarter 1</SelectItem>
            <SelectItem value="q2">Quarter 2</SelectItem>
            <SelectItem value="q3">Quarter 3</SelectItem>
            <SelectItem value="q4">Quarter 4</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 p-4 sm:grid-cols-[1fr_auto_1fr] sm:p-5">
        <div className="flex min-h-0 min-w-0 flex-col gap-3 overflow-hidden">
          <div>
            <p className="text-lg font-semibold tracking-tight">{numberFormatter.format(totalOrders)}</p>
            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">Total Orders</p>
          </div>
          <div className="min-h-0 w-full min-w-0 flex-1">
            <ChartContainer config={ordersBarConfig} className="h-full w-full">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="0" vertical={false} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dx={-5} width={40} />
                <Tooltip cursor={{ fillOpacity: 0.05 }}
                  content={<PipelineTooltip valueFormatter={(v) => numberFormatter.format(v)} />} />
                <Bar dataKey="orders" radius={[4, 4, 0, 0]} fill="var(--color-orders)"
                  shape={createHighlightBarShape('var(--color-orders)')} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        <div className="hidden w-px self-stretch bg-border sm:block" />

        <div className="flex min-h-0 min-w-0 flex-col gap-3 overflow-hidden">
          <div>
            <p className="text-lg font-semibold tracking-tight">{compactCurrencyFormatter.format(totalSales)}</p>
            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">Total Sales</p>
          </div>
          <div className="min-h-0 w-full min-w-0 flex-1">
            <ChartContainer config={salesBarConfig} className="h-full w-full">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="0" vertical={false} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dx={-5} width={40} />
                <Tooltip cursor={{ fillOpacity: 0.05 }}
                  content={<PipelineTooltip valueFormatter={(v) => currencyFormatter.format(v)} />} />
                <Bar dataKey="sales" radius={[4, 4, 0, 0]} fill="var(--color-sales)"
                  shape={createHighlightBarShape('var(--color-sales)')} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
