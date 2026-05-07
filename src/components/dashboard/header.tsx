'use client'

import { Bell, Search, CalendarRange } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface DashboardHeaderProps {
  name: string
  email?: string
  avatarUrl?: string
  greeting?: string
}

export function DashboardHeader({ name, email, avatarUrl, greeting }: DashboardHeaderProps) {
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
        <Button variant="outline" size="icon" className="size-8" aria-label="Search">
          <Search className="size-4" aria-hidden="true" />
        </Button>
        <Button variant="outline" size="icon" className="size-8" aria-label="Notifications">
          <Bell className="size-4" aria-hidden="true" />
        </Button>
        <Button variant="outline" size="sm" className="hidden h-8 gap-1.5 text-xs sm:flex" aria-label="Date range">
          <CalendarRange className="size-3.5" aria-hidden="true" />
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Button>
      </div>
    </header>
  )
}
