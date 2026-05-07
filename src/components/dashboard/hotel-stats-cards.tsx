'use client'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { StatItem } from './types'

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const numberFormatter = new Intl.NumberFormat('en-US')
const trendPercentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
})

function formatValue(value: number, format: StatItem['format']) {
  if (format === 'currency') return currencyFormatter.format(value)
  if (format === 'percent') return `${value}%`
  return numberFormatter.format(value)
}

function formatTrend(trendValue: number) {
  return trendPercentFormatter.format(trendValue / 100)
}

interface StatsCardsProps {
  stats: StatItem[]
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => {
        const isPositive = (stat.trendValue ?? 0) > 0
        const isNeutral = (stat.trendValue ?? 0) === 0
        const trendColor = isNeutral
          ? 'text-muted-foreground'
          : isPositive
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-destructive'

        return (
          <Card key={stat.title} className="gap-2 px-4 py-2.5 shadow-none">
            <p className="text-sm text-muted-foreground">{stat.title}</p>
            <div className="flex items-baseline gap-2 whitespace-nowrap">
              <span className="text-lg font-semibold">{formatValue(stat.value, stat.format)}</span>
              {stat.trendValue !== undefined && (
                <span className={cn('text-sm', trendColor)}>{formatTrend(stat.trendValue)}</span>
              )}
            </div>
            {stat.footerLabel && (
              <p className="text-xs text-muted-foreground">
                {stat.footerLabel}
                {stat.footerSubtext && (
                  <span className="block text-[10px]">{stat.footerSubtext}</span>
                )}
              </p>
            )}
          </Card>
        )
      })}
    </div>
  )
}
