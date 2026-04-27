'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { HelpCircle } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import type { SidebarModule } from './types'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  modules: SidebarModule[]
  activeModuleId: string
  logo?: {
    src: string
    alt: string
    href?: string
  }
}

export function AppSidebar({
  modules,
  activeModuleId,
  logo = { src: '/logo.png', alt: 'Logo', href: '/dash' },
  ...props
}: AppSidebarProps) {
  const pathname = usePathname()

  const derivedActiveId = React.useMemo(() => {
    const sorted = [...modules]
      .filter((m) => m.path)
      .sort((a, b) => (b.path?.length ?? 0) - (a.path?.length ?? 0))
    return sorted.find((m) => m.path && pathname.startsWith(m.path))?.id ?? activeModuleId
  }, [pathname, modules, activeModuleId])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-3">
        <Link href={logo.href ?? '/dash'}>
          <Image
            src={logo.src}
            alt={logo.alt}
            width={56}
            height={56}
            className="size-14 object-contain"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-3 pt-0">
        <SidebarGroup className="p-0">
          <SidebarGroupContent className="flex flex-col gap-2">
            {modules.map((module) => {
              const isActive = derivedActiveId === module.id
              const itemClass = cn(
                'flex aspect-square w-full items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground transition-all hover:rounded-xl hover:bg-primary hover:text-primary-foreground',
                isActive && 'rounded-xl bg-primary text-primary-foreground',
              )
              return module.path ? (
                <Link
                  key={module.id}
                  href={module.path}
                  className={itemClass}
                  aria-label={module.label}
                  title={module.label}
                >
                  <module.icon className="size-6" />
                </Link>
              ) : (
                <button
                  key={module.id}
                  type="button"
                  className={itemClass}
                  aria-label={module.label}
                  title={module.label}
                >
                  <module.icon className="size-6" />
                </button>
              )
            })}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <Link
          href="/dash/help"
          className="flex aspect-square w-full items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground transition-all hover:rounded-xl hover:bg-primary hover:text-primary-foreground"
          aria-label="Help"
          title="Help"
        >
          <HelpCircle className="size-6" />
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}
