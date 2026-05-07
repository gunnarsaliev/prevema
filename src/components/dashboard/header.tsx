'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DateRangePicker } from './date-range-picker'

interface DashboardHeaderProps {
  name: string
  email?: string
  avatarUrl?: string
  greeting?: string
  from?: string
  to?: string
}

export function DashboardHeader({
  name,
  email,
  avatarUrl,
  greeting,
  from,
  to,
}: DashboardHeaderProps) {
  const firstName = name.split(' ')[0] ?? name
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <header className="flex w-full shrink-0 items-center gap-3 border-b bg-background px-4 py-4 sm:px-6">
      <Avatar className="size-10 rounded-lg">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
        <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{`Hello ${firstName}`}</span>
        <span className="text-xs text-muted-foreground">
          {greeting ?? 'Welcome back to Prevema 👋'}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* <Button variant="outline" size="icon" className="size-8" aria-label="Search">
          <Search className="size-4" aria-hidden="true" />
        </Button> */}
        {/* <Button variant="outline" size="icon" className="size-8" aria-label="Notifications">
          <Bell className="size-4" aria-hidden="true" />
        </Button> */}
        <DateRangePicker from={from} to={to} />
      </div>
    </header>
  )
}
