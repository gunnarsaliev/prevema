'use client'

import * as React from 'react'
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type ChartConfig, ChartContainer } from '@/components/ui/chart'
import { cn } from '@/lib/utils'

type TimePeriod = '6months' | 'year'

const mixBase = 'var(--background)'
const palette = {
  primary: 'var(--primary)',
  secondary: {
    light: `color-mix(in oklch, var(--primary) 75%, ${mixBase})`,
    dark: `color-mix(in oklch, var(--primary) 85%, ${mixBase})`,
  },
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 0,
})
const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' })
const monthLabel = (m: number) => monthFormatter.format(new Date(2025, m, 1))

const fullYearData = [
  { monthIndex: 0, thisYear: 42000, prevYear: 38000 },
  { monthIndex: 1, thisYear: 38000, prevYear: 45000 },
  { monthIndex: 2, thisYear: 52000, prevYear: 41000 },
  { monthIndex: 3, thisYear: 45000, prevYear: 48000 },
  { monthIndex: 4, thisYear: 58000, prevYear: 44000 },
  { monthIndex: 5, thisYear: 41000, prevYear: 52000 },
  { monthIndex: 6, thisYear: 55000, prevYear: 47000 },
  { monthIndex: 7, thisYear: 48000, prevYear: 53000 },
  { monthIndex: 8, thisYear: 62000, prevYear: 49000 },
  { monthIndex: 9, thisYear: 54000, prevYear: 58000 },
  { monthIndex: 10, thisYear: 67000, prevYear: 52000 },
  { monthIndex: 11, thisYear: 71000, prevYear: 61000 },
].map(({ monthIndex, ...entry }) => ({ month: monthLabel(monthIndex), ...entry }))

const periodLabels: Record<TimePeriod, string> = { '6months': 'Last 6 Months', year: 'Last Year' }

function getDataForPeriod(period: TimePeriod) {
  return period === '6months' ? fullYearData.slice(0, 6) : fullYearData
}

const revenueFlowChartConfig = {
  thisYear: { label: 'This Year', color: palette.primary },
  prevYear: { label: 'Previous Year', theme: palette.secondary },
} satisfies ChartConfig

function CustomTooltip({
  active,
  payload,
  label,
  colors,
}: {
  active?: boolean
  payload?: { dataKey?: string; value?: number }[]
  label?: string
  colors: { primary: string; secondary: string }
}) {
  if (!active || !payload?.length) return null
  const thisYear = payload.find((p) => p.dataKey === 'thisYear')?.value ?? 0
  const prevYear = payload.find((p) => p.dataKey === 'prevYear')?.value ?? 0
  const diff = Number(thisYear) - Number(prevYear)
  const percentage = prevYear ? Math.round((diff / Number(prevYear)) * 100) : 0
  const currentYear = new Date().getFullYear()
  return (
    <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
      <p className="mb-2 text-sm font-medium text-foreground">{label}, {currentYear}</p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-full" style={{ backgroundColor: colors.primary }} />
          <span className="text-sm text-muted-foreground">This Year:</span>
          <span className="text-sm font-medium text-foreground">{currencyFormatter.format(Number(thisYear))}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-full" style={{ backgroundColor: colors.secondary }} />
          <span className="text-sm text-muted-foreground">Prev Year:</span>
          <span className="text-sm font-medium text-foreground">{currencyFormatter.format(Number(prevYear))}</span>
        </div>
        <div className="mt-1 border-t border-border pt-1">
          <span className={cn('text-xs font-medium', diff >= 0 ? 'text-emerald-500' : 'text-red-500')}>
            {diff >= 0 ? '+' : ''}{percentage}% vs last year
          </span>
        </div>
      </div>
    </div>
  )
}

export function RevenueFlowChart() {
  const [period, setPeriod] = React.useState<TimePeriod>('year')
  const chartData = getDataForPeriod(period)
  const totalRevenue = chartData.reduce((acc, item) => acc + item.thisYear, 0)

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-xl border bg-card p-4 sm:gap-6 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-xl font-semibold tracking-tight sm:text-2xl">
            {compactCurrencyFormatter.format(totalRevenue)}
          </p>
          <p className="text-xs text-muted-foreground">Total Revenue ({periodLabels[period]})</p>
        </div>
        <div className="hidden items-center gap-5 sm:flex">
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full" style={{ backgroundColor: palette.primary }} />
            <span className="text-xs text-muted-foreground">This Year</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full" style={{ backgroundColor: palette.secondary.light }} />
            <span className="text-xs text-muted-foreground">Prev Year</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" aria-label="Select time period">
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Time Period</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(periodLabels) as TimePeriod[]).map((key) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={period === key}
                onCheckedChange={() => setPeriod(key)}
              >
                {periodLabels[key]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="h-[200px] w-full min-w-0 sm:h-[240px] lg:h-[280px]">
        <ChartContainer config={revenueFlowChartConfig} className="h-full w-full">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="0" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dx={-5} width={40}
              tickFormatter={(value) => compactCurrencyFormatter.format(value)} />
            <Tooltip
              content={
                <CustomTooltip
                  colors={{ primary: 'var(--color-thisYear)', secondary: 'var(--color-prevYear)' }}
                />
              }
              cursor={{ strokeOpacity: 0.2 }}
            />
            <Line type="linear" dataKey="thisYear" stroke="var(--color-thisYear)" strokeWidth={1.5}
              dot={{ fill: 'var(--color-thisYear)', strokeWidth: 0, r: 2 }}
              activeDot={{ r: 3.5, fill: 'var(--color-thisYear)' }} />
            <Line type="linear" dataKey="prevYear" stroke="var(--color-prevYear)" strokeWidth={1.5}
              strokeOpacity={0.5}
              dot={{ fill: 'var(--color-prevYear)', fillOpacity: 0.5, strokeWidth: 0, r: 2 }}
              activeDot={{ r: 3.5, fill: 'var(--color-prevYear)', fillOpacity: 0.5 }} />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  )
}
