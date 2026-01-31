'use client'

import { useState, useMemo } from 'react'
import { format, subDays, subMonths, startOfDay, addDays, differenceInDays } from 'date-fns'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
} from 'recharts'
import { CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface ChartGroup12Props {
  className?: string
}

// Seeded random for consistent data generation
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Generate data for any date range dynamically
const generateDataForRange = (from: Date, to: Date) => {
  const data = []
  const days = differenceInDays(to, from) + 1

  for (let i = 0; i < days; i++) {
    const date = addDays(startOfDay(from), i)
    const seed = date.getTime() / 86400000

    data.push({
      date: date,
      dateStr: format(date, 'MMM d'),
      revenue: Math.floor(seededRandom(seed) * 8000) + 3000,
      orders: Math.floor(seededRandom(seed + 1000) * 80) + 30,
      visitors: Math.floor(seededRandom(seed + 2000) * 2000) + 500,
    })
  }
  return data
}

const categoryData = [
  { name: 'Electronics', value: 4200, fill: 'var(--chart-1)' },
  { name: 'Clothing', value: 3100, fill: 'var(--chart-2)' },
  { name: 'Home', value: 2400, fill: 'var(--chart-3)' },
  { name: 'Sports', value: 1800, fill: 'var(--chart-4)' },
]

const categoryConfig = {
  Electronics: { label: 'Electronics', color: 'var(--chart-1)' },
  Clothing: { label: 'Clothing', color: 'var(--chart-2)' },
  Home: { label: 'Home', color: 'var(--chart-3)' },
  Sports: { label: 'Sports', color: 'var(--chart-4)' },
} satisfies ChartConfig

const sourceData = [
  { name: 'Organic', value: 42 },
  { name: 'Paid', value: 28 },
  { name: 'Social', value: 18 },
  { name: 'Referral', value: 12 },
]

const presets = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
]

const revenueConfig = {
  revenue: { label: 'Revenue', color: 'var(--chart-1)' },
} satisfies ChartConfig

const sourceConfig = {
  value: { label: 'Percentage', color: 'var(--chart-2)' },
} satisfies ChartConfig

const ChartGroup12 = ({ className }: ChartGroup12Props) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const filteredData = useMemo(() => {
    const from = dateRange?.from ?? subDays(new Date(), 30)
    const to = dateRange?.to ?? new Date()
    return generateDataForRange(from, to)
  }, [dateRange])

  const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0)
  const totalOrders = filteredData.reduce((sum, item) => sum + item.orders, 0)
  const totalVisitors = filteredData.reduce((sum, item) => sum + item.visitors, 0)
  const conversionRate = totalVisitors > 0 ? ((totalOrders / totalVisitors) * 100).toFixed(1) : '0'

  const handlePreset = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    })
  }

  return (
    <section className={cn('py-6', className)}>
      <div className="container space-y-4">
        {/* Header with Date Picker */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Dashboard Overview</h2>
            <p className="text-muted-foreground">Track your business performance</p>
          </div>
          <div className="flex items-center gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.days}
                variant="outline"
                size="sm"
                onClick={() => handlePreset(preset.days)}
                className={cn(
                  dateRange?.from &&
                    format(dateRange.from, 'yyyy-MM-dd') ===
                      format(subDays(new Date(), preset.days), 'yyyy-MM-dd') &&
                    'bg-accent',
                )}
              >
                {preset.label}
              </Button>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="mr-2 size-4" />
                  Custom
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  numberOfMonths={2}
                  selected={dateRange}
                  onSelect={setDateRange}
                  defaultMonth={subMonths(new Date(), 1)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: 12.5 },
            { title: 'Total Orders', value: totalOrders.toLocaleString(), change: 8.2 },
            { title: 'Visitors', value: totalVisitors.toLocaleString(), change: -2.4 },
            { title: 'Conversion Rate', value: `${conversionRate}%`, change: 5.1 },
          ].map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <div className="mt-1 flex items-center gap-1 text-sm">
                  {stat.change >= 0 ? (
                    <TrendingUp className="size-4 text-green-500" />
                  ) : (
                    <TrendingDown className="size-4 text-red-500" />
                  )}
                  <span className={stat.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {stat.change >= 0 ? '+' : ''}
                    {stat.change}%
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Daily revenue for selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={revenueConfig} className="h-64 w-full">
                <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad12" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="dateStr"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    fontSize={12}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    fontSize={12}
                    tickFormatter={(v) => `$${v / 1000}k`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    fill="url(#revGrad12)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Revenue breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <ChartContainer config={categoryConfig} className="size-36">
                  <PieChart>
                    <ChartTooltip
                      content={<ChartTooltipContent nameKey="name" hideLabel />}
                      cursor={false}
                    />
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      strokeWidth={0}
                    />
                  </PieChart>
                </ChartContainer>
                <div className="grid w-full grid-cols-2 gap-2 text-sm">
                  {categoryData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="size-2 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="truncate text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Where your visitors come from</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={sourceConfig} className="h-40 w-full">
                <BarChart
                  data={sourceData}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    width={70}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Key metrics summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Order Value</span>
                <span className="font-semibold">
                  ${totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Orders/Day</span>
                <span className="font-semibold">
                  {filteredData.length > 0 ? Math.round(totalOrders / filteredData.length) : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue/Day</span>
                <span className="font-semibold">
                  $
                  {filteredData.length > 0
                    ? Math.round(totalRevenue / filteredData.length).toLocaleString()
                    : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Visitors/Day</span>
                <span className="font-semibold">
                  {filteredData.length > 0 ? Math.round(totalVisitors / filteredData.length) : 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export { ChartGroup12 }
