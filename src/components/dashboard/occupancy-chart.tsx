'use client'

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { type ChartConfig, ChartContainer } from '@/components/ui/chart'
import type { RegistrationDayData } from './types'

const mixBase = 'var(--background)'
const palette = {
  primary: 'var(--primary)',
  secondary: {
    light: `color-mix(in oklch, var(--primary) 60%, ${mixBase})`,
    dark: `color-mix(in oklch, var(--primary) 70%, ${mixBase})`,
  },
}

const chartConfig = {
  participants: { label: 'Participants', color: palette.primary },
  partners: { label: 'Partners', theme: palette.secondary },
} satisfies ChartConfig

const TICK_EVERY = 4

const shortDate = (iso: string) => {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function RegistrationsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { dataKey?: string; value?: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const participants = Number(payload.find((e) => e.dataKey === 'participants')?.value ?? 0)
  const partners = Number(payload.find((e) => e.dataKey === 'partners')?.value ?? 0)
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="mb-1.5 text-xs font-medium text-foreground">{label ? shortDate(label) : ''}</p>
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-full" style={{ backgroundColor: palette.primary }} />
            Participants
          </span>
          <span className="font-medium">{participants}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: palette.secondary.light }}
            />
            Partners
          </span>
          <span className="font-medium">{partners}</span>
        </div>
      </div>
    </div>
  )
}

interface RegistrationsChartProps {
  data: RegistrationDayData[]
}

export function RegistrationsChart({ data }: RegistrationsChartProps) {
  const totalParticipants = data.reduce((s, d) => s + d.participants, 0)
  const totalPartners = data.reduce((s, d) => s + d.partners, 0)

  return (
    <div className="w-full rounded-xl border bg-card">
      <div className="flex items-start justify-between gap-4 px-4 pt-4 pb-3 sm:px-5">
        <div>
          <h2 className="text-sm font-medium sm:text-base">Registrations</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Last {data.length} days</p>
        </div>
        <div className="flex items-center gap-4 pt-0.5">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full" style={{ backgroundColor: palette.primary }} />
            <span className="text-[10px] text-muted-foreground sm:text-xs">
              Participants{' '}
              <span className="font-medium text-foreground">({totalParticipants})</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: palette.secondary.light }}
            />
            <span className="text-[10px] text-muted-foreground sm:text-xs">
              Partners <span className="font-medium text-foreground">({totalPartners})</span>
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 sm:px-5">
        <div className="h-[220px] w-full min-w-0 sm:h-[250px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart
              data={data}
              barGap={2}
              barCategoryGap={data.length > 20 ? 2 : 6}
              margin={{ top: 4, right: 0, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                tickMargin={8}
                tickFormatter={(value, index) => (index % TICK_EVERY === 0 ? shortDate(value) : '')}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                dx={-4}
                width={28}
                allowDecimals={false}
              />
              <Tooltip cursor={{ fillOpacity: 0.06 }} content={<RegistrationsTooltip />} />
              <Bar dataKey="participants" fill="var(--color-participants)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="partners" fill="var(--color-partners)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  )
}
