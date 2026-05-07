'use client'

import * as React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { CalendarRange } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { format, differenceInCalendarDays, subDays } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 14 days', days: 14 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
]

interface DateRangePickerProps {
  from?: string
  to?: string
}

export function DateRangePicker({ from, to }: DateRangePickerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = React.useState(false)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const defaultFrom = subDays(today, 29)

  const initialRange: DateRange = {
    from: from ? new Date(from) : defaultFrom,
    to: to ? new Date(to) : today,
  }

  const [range, setRange] = React.useState<DateRange | undefined>(initialRange)

  const apply = (next: DateRange | undefined) => {
    if (!next?.from) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('from', format(next.from, 'yyyy-MM-dd'))
    params.set('to', format(next.to ?? next.from, 'yyyy-MM-dd'))
    router.push(`${pathname}?${params.toString()}`)
    setOpen(false)
  }

  const applyPreset = (days: number) => {
    const next: DateRange = { from: subDays(today, days - 1), to: today }
    setRange(next)
    apply(next)
  }

  const label = React.useMemo(() => {
    if (!range?.from) return 'Pick a range'
    const f = format(range.from, 'MMM d, yyyy')
    const t = range.to ? format(range.to, 'MMM d, yyyy') : f
    if (f === t) return f
    return `${f} – ${t}`
  }, [range])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hidden h-8 gap-1.5 text-xs sm:flex"
          aria-label="Date range"
        >
          <CalendarRange className="size-3.5" aria-hidden="true" />
          {label}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex">
          <div className="flex flex-col gap-1 border-r p-3">
            {PRESETS.map((p) => (
              <Button
                key={p.days}
                variant="ghost"
                size="sm"
                className="justify-start text-xs"
                onClick={() => applyPreset(p.days)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          <div className="p-3">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={2}
              disabled={{ after: today }}
              initialFocus
            />
            <div className="mt-3 flex justify-end gap-2 border-t pt-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs"
                onClick={() => apply(range)}
                disabled={!range?.from}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
