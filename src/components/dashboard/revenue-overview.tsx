'use client'

import * as React from 'react'
import { Bar, BarChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type ChartConfig, ChartContainer } from '@/components/ui/chart'
import { cn } from '@/lib/utils'

type RevenueGlowSegment = 'all' | 'roomRevenue' | 'platformRevenue' | 'upsellRevenue'
type RevenueGlowMetric = Exclude<RevenueGlowSegment, 'all'>

const mixBase = 'var(--background)'
const palette = {
  primary: 'var(--primary)',
  secondary: {
    light: `color-mix(in oklch, var(--primary) 75%, ${mixBase})`,
    dark: `color-mix(in oklch, var(--primary) 85%, ${mixBase})`,
  },
  quaternary: {
    light: `color-mix(in oklch, var(--primary) 40%, ${mixBase})`,
    dark: `color-mix(in oklch, var(--primary) 45%, ${mixBase})`,
  },
}

const revenueGlowData = [
  { channel: 'Booking.com', roomRevenue: 46, platformRevenue: 27, upsellRevenue: 17 },
  { channel: 'Airbnb', roomRevenue: 41, platformRevenue: 24, upsellRevenue: 23 },
  { channel: 'Agoda', roomRevenue: 36, platformRevenue: 20, upsellRevenue: 17 },
  { channel: 'Hotels.com', roomRevenue: 31, platformRevenue: 18, upsellRevenue: 15 },
  { channel: 'Expedia', roomRevenue: 43, platformRevenue: 26, upsellRevenue: 18 },
  { channel: 'Direct', roomRevenue: 58, platformRevenue: 14, upsellRevenue: 12 },
].map((entry) => ({ ...entry, total: entry.roomRevenue + entry.platformRevenue + entry.upsellRevenue }))

const revenueGlowChartConfig = {
  roomRevenue: { label: 'Room Revenue', color: palette.primary },
  platformRevenue: { label: 'Platform Revenue', theme: palette.secondary },
  upsellRevenue: { label: 'Upsell Revenue', theme: palette.quaternary },
} satisfies ChartConfig

const isRevenueGlowMetric = (value: string): value is RevenueGlowMetric =>
  value === 'roomRevenue' || value === 'platformRevenue' || value === 'upsellRevenue'

function RevenueGlowTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { dataKey?: string; color?: string; name?: string; value?: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((sum, item) => sum + Number(item.value || 0), 0)
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-foreground">{label}</p>
      <div className="space-y-1 text-xs">
        {payload.map((item) => {
          const key = String(item.dataKey ?? '')
          const color = String(item.color ?? 'var(--muted-foreground)')
          const entryLabel = isRevenueGlowMetric(key)
            ? revenueGlowChartConfig[key].label
            : String(item.name ?? key)
          return (
            <div key={`${key}-${label}`} className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
                {entryLabel}
              </span>
              <span className="font-medium text-foreground">{Number(item.value).toFixed(0)}%</span>
            </div>
          )
        })}
        <div className="mt-1 border-t border-border pt-1 text-right font-medium text-foreground">
          {total.toFixed(0)}% Total
        </div>
      </div>
    </div>
  )
}

const GlowingBarShape = (
  props: React.SVGProps<SVGRectElement> & {
    dataKey?: string
    activeSegment?: RevenueGlowSegment
    glowPrefix?: string
  },
) => {
  const { fill, x, y, width, height, radius, dataKey, activeSegment = 'all', glowPrefix = 'revenue-glow' } = props
  const key = String(dataKey ?? 'segment')
  const isActive = activeSegment === 'all' || activeSegment === key
  const filterId = `${glowPrefix}-${key}`
  return (
    <>
      <rect
        x={Number(x ?? 0)} y={Number(y ?? 0)}
        width={Math.max(0, Number(width ?? 0))} height={Math.max(0, Number(height ?? 0))}
        rx={Number(radius ?? 0)} ry={Number(radius ?? 0)}
        fill={String(fill ?? 'currentColor')} stroke="none"
        opacity={isActive ? 1 : 0.16}
        filter={isActive && activeSegment !== 'all' ? `url(#${filterId})` : undefined}
      />
      <defs>
        <filter id={filterId} x="-200%" y="-200%" width="600%" height="600%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </>
  )
}

interface RevenueOverviewGlowingHorizontalProps {
  className?: string
}

export function RevenueOverviewGlowingHorizontal({ className }: RevenueOverviewGlowingHorizontalProps) {
  const [activeSegment, setActiveSegment] = React.useState<RevenueGlowSegment>('all')
  const glowPrefix = React.useId().replace(/:/g, '')

  return (
    <div className={cn('flex h-full w-full flex-col rounded-xl border bg-card p-4 sm:p-5', className)}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium sm:text-base">Revenue Overview</h2>
        <Select value={activeSegment} onValueChange={(value) => setActiveSegment(value as RevenueGlowSegment)}>
          <SelectTrigger className="h-7 w-[100px] text-xs" aria-label="Select revenue segment">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="roomRevenue">Room</SelectItem>
            <SelectItem value="platformRevenue">Platform</SelectItem>
            <SelectItem value="upsellRevenue">Upsell</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-4">
        {[
          { label: 'Room', color: palette.primary },
          { label: 'Platform', color: palette.secondary.light },
          { label: 'Upsell', color: palette.quaternary.light },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="size-2 rounded-full sm:size-2.5" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] text-muted-foreground sm:text-xs">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="h-[230px] w-full min-w-0 sm:h-[250px]">
        <ChartContainer config={revenueGlowChartConfig} className="h-full w-full">
          <BarChart data={revenueGlowData} layout="vertical" barCategoryGap={14} margin={{ top: 2, right: 4, bottom: 2, left: -10 }}>
            <YAxis type="category" dataKey="channel" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickMargin={8} width={68} />
            <XAxis type="number" hide domain={[0, 100]} />
            <Tooltip cursor={false} content={<RevenueGlowTooltip />} />
            <Bar dataKey="roomRevenue" stackId="revenue" barSize={12} fill="var(--color-roomRevenue)" radius={4}
              shape={<GlowingBarShape activeSegment={activeSegment} glowPrefix={glowPrefix} />}
              background={{ fill: 'var(--muted)', radius: 4 }} overflow="visible" />
            <Bar dataKey="platformRevenue" stackId="revenue" barSize={12} fill="var(--color-platformRevenue)" radius={4}
              shape={<GlowingBarShape activeSegment={activeSegment} glowPrefix={glowPrefix} />}
              overflow="visible" />
            <Bar dataKey="upsellRevenue" stackId="revenue" barSize={12} fill="var(--color-upsellRevenue)" radius={4}
              shape={<GlowingBarShape activeSegment={activeSegment} glowPrefix={glowPrefix} />}
              overflow="visible" />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  )
}
