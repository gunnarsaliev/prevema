'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface NewButtonDropdownItem {
  label: string
  icon?: ReactNode
  href?: string
  onClick?: () => void
}

interface NewButtonDropdownProps {
  items: NewButtonDropdownItem[]
  variant?: 'default' | 'outline'
  fullWidth?: boolean
  buttonLabel?: string
}

export function NewButtonDropdown({
  items,
  variant = 'default',
  fullWidth = false,
  buttonLabel = 'New',
}: NewButtonDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          className={fullWidth ? 'w-full justify-start gap-2' : 'gap-2'}
        >
          <Plus className="h-4 w-4" />
          {buttonLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={fullWidth ? 'start' : 'end'} className="w-48">
        {items.map((item, index) => (
          <DropdownMenuItem
            key={index}
            onClick={item.onClick}
            asChild={!!item.href}
          >
            {item.href ? (
              <Link href={item.href} className="flex items-center">
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </Link>
            ) : (
              <div className="flex items-center cursor-pointer">
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
