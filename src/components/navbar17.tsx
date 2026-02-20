'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'

import { useAuth } from '@/providers/Auth'

import { Button } from '@/components/ui/button'
import { Skeleton } from './ui/skeleton'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const NAV_LOGO = {
  url: '/',
  src: 'https://asset.cooksa.com/prevema.svg',
  alt: 'Prevema Logo',
  title: 'Prevema',
}
const NAV_ITEMS = [
  { name: 'Home', link: '/' },
  { name: 'About', link: '/about' },
  { name: 'Pricing', link: '/pricing' },
  // { name: 'Image Generator', link: '/image-generator' },
  { name: 'Contact', link: '/contact' },
]

const Navbar17 = () => {
  const [activeItem, setActiveItem] = useState(NAV_ITEMS[0].name)
  const { user, status } = useAuth()

  const indicatorRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = document.querySelector(`[data-nav-item="${activeItem}"]`) as HTMLElement

      if (activeEl && indicatorRef.current && menuRef.current) {
        const menuRect = menuRef.current.getBoundingClientRect()
        const itemRect = activeEl.getBoundingClientRect()

        indicatorRef.current.style.width = `${itemRect.width}px`
        indicatorRef.current.style.left = `${itemRect.left - menuRect.left}px`
      }
    }
    updateIndicator()
    window.addEventListener('resize', updateIndicator)

    return () => window.removeEventListener('resize', updateIndicator)
  }, [activeItem])

  return (
    <section className="py-4">
      <nav className="container flex items-center justify-between">
        {/* Left WordMark */}
        <Link href={NAV_LOGO.url} className="flex items-center gap-2">
          <img src={NAV_LOGO.src} className="max-h-8 w-8" alt={NAV_LOGO.alt} />
          <span className="text-lg font-semibold tracking-tighter">{NAV_LOGO.title}</span>
        </Link>

        <NavigationMenu className="hidden lg:block">
          <NavigationMenuList
            ref={menuRef}
            className="rounded-4xl flex items-center gap-6 px-8 py-3"
          >
            {NAV_ITEMS.map((item) => (
              <React.Fragment key={item.name}>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.link}
                      data-nav-item={item.name}
                      onClick={() => setActiveItem(item.name)}
                      className={`relative cursor-pointer text-sm font-medium hover:bg-transparent ${
                        activeItem === item.name ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </React.Fragment>
            ))}
            {/* Active Indicator */}
            <div
              ref={indicatorRef}
              className="absolute bottom-2 flex h-1 items-center justify-center px-2 transition-all duration-300"
            >
              <div className="bg-foreground h-0.5 w-full rounded-t-none transition-all duration-300" />
            </div>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Menu Popover */}
        <MobileNav activeItem={activeItem} setActiveItem={setActiveItem} />

        <div className="hidden items-center gap-2 lg:flex">
          {status === undefined ? (
            <Skeleton className="h-10 w-24" />
          ) : user ? (
            <Button asChild variant="outline" size="sm" className="h-10 py-2.5 text-sm font-normal">
              <Link href="/dash">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="h-10 py-2.5 text-sm font-normal">
              <Link href="/login">Log In</Link>
            </Button>
          )}
        </div>
      </nav>
    </section>
  )
}

export { Navbar17 }

const AnimatedHamburger = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <div className="group relative size-full">
      <div className="absolute flex size-full items-center justify-center">
        <Menu
          className={`text-muted-foreground group-hover:text-foreground absolute size-6 transition-all duration-300 ${
            isOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
          }`}
        />
        <X
          className={`text-muted-foreground group-hover:text-foreground absolute size-6 transition-all duration-300 ${
            isOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
          }`}
        />
      </div>
    </div>
  )
}

const MobileNav = ({
  activeItem,
  setActiveItem,
}: {
  activeItem: string
  setActiveItem: (item: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, status } = useAuth()

  return (
    <div className="block flex h-full items-center lg:hidden">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon">
            <AnimatedHamburger isOpen={isOpen} />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="relative -right-4 top-4 block w-[calc(100vw-32px)] overflow-hidden rounded-xl p-0 sm:right-auto sm:top-auto sm:w-80 lg:hidden"
        >
          <ul className="bg-background text-foreground w-full py-4">
            {NAV_ITEMS.map((navItem, idx) => (
              <li key={idx}>
                <Link
                  href={navItem.link}
                  onClick={() => setActiveItem(navItem.name)}
                  className={`text-foreground flex items-center border-l-[3px] px-6 py-4 text-sm font-medium transition-all duration-75 ${
                    activeItem === navItem.name
                      ? 'border-foreground text-foreground'
                      : 'text-muted-foreground hover:text-foreground border-transparent'
                  }`}
                >
                  {navItem.name}
                </Link>
              </li>
            ))}
            <li className="flex flex-col px-7 py-2">
              {status === undefined ? (
                <Skeleton className="h-10 w-full" />
              ) : user ? (
                <Button asChild variant="outline">
                  <Link href="/dash">Dashboard</Link>
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link href="/login">Log In</Link>
                </Button>
              )}
            </li>
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  )
}
