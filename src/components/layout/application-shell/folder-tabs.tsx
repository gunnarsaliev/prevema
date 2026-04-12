'use client'

import * as React from 'react'
import { ChevronDown, MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export interface Folder {
  id: string
  label: string
  icon: LucideIcon
  count?: number
}

interface FolderTabsProps {
  className?: string
  folders: Folder[]
  activeFolder: string
  onFolderChange: (folderId: string) => void
  activeCount?: number
}

export function FolderTabs({
  className,
  folders,
  activeFolder,
  onFolderChange,
  activeCount = 0,
}: FolderTabsProps) {
  const mainFolders = folders.slice(0, 5)
  const additionalFolders = folders.slice(5)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Desktop: All folders visible at 2xl */}
      <div className="hidden items-center gap-1 2xl:flex">
        {folders.map((folder) => {
          const Icon = folder.icon
          const isActive = activeFolder === folder.id
          return (
            <Button
              key={folder.id}
              variant="ghost"
              size="sm"
              onClick={() => onFolderChange(folder.id)}
              className={cn('h-[30px] gap-1.5', isActive && 'bg-muted text-foreground hover:bg-muted')}
            >
              <Icon className="size-4" />
              <span className="text-[13px]">{folder.label}</span>
              {isActive && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {activeCount.toLocaleString()}
                </Badge>
              )}
            </Button>
          )
        })}
      </div>

      {/* Large: Main folders + dropdown for additional */}
      <div className="hidden items-center gap-1 xl:flex 2xl:hidden">
        {mainFolders.map((folder) => {
          const Icon = folder.icon
          const isActive = activeFolder === folder.id
          return (
            <Button
              key={folder.id}
              variant="ghost"
              size="sm"
              onClick={() => onFolderChange(folder.id)}
              className={cn('h-[30px] gap-1.5', isActive && 'bg-muted text-foreground hover:bg-muted')}
            >
              <Icon className="size-4" />
              <span className="text-[13px]">{folder.label}</span>
              {isActive && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {activeCount.toLocaleString()}
                </Badge>
              )}
            </Button>
          )
        })}
        {additionalFolders.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-[30px]">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {additionalFolders.map((folder) => {
                const Icon = folder.icon
                return (
                  <DropdownMenuItem key={folder.id} onClick={() => onFolderChange(folder.id)}>
                    <Icon className="mr-2 size-4" />
                    {folder.label}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Medium: First 3 folders + dropdown */}
      <div className="hidden items-center gap-1 lg:flex xl:hidden">
        {mainFolders.slice(0, 3).map((folder) => {
          const Icon = folder.icon
          const isActive = activeFolder === folder.id
          return (
            <Button
              key={folder.id}
              variant="ghost"
              size="sm"
              onClick={() => onFolderChange(folder.id)}
              className={cn('h-[30px] gap-1.5', isActive && 'bg-muted text-foreground hover:bg-muted')}
            >
              <Icon className="size-4" />
              <span className="text-[13px]">{folder.label}</span>
              {isActive && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {activeCount.toLocaleString()}
                </Badge>
              )}
            </Button>
          )
        })}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-[30px]">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {[...mainFolders.slice(3), ...additionalFolders].map((folder) => {
              const Icon = folder.icon
              return (
                <DropdownMenuItem key={folder.id} onClick={() => onFolderChange(folder.id)}>
                  <Icon className="mr-2 size-4" />
                  {folder.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Small: First 2 folders + dropdown */}
      <div className="hidden items-center gap-1 md:flex lg:hidden">
        {mainFolders.slice(0, 2).map((folder) => {
          const Icon = folder.icon
          const isActive = activeFolder === folder.id
          return (
            <Button
              key={folder.id}
              variant="ghost"
              size="sm"
              onClick={() => onFolderChange(folder.id)}
              className={cn('h-[30px] gap-1.5', isActive && 'bg-muted text-foreground hover:bg-muted')}
            >
              <Icon className="size-4" />
              <span className="text-[13px]">{folder.label}</span>
              {isActive && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {activeCount.toLocaleString()}
                </Badge>
              )}
            </Button>
          )
        })}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-[30px]">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {[...mainFolders.slice(2), ...additionalFolders].map((folder) => {
              const Icon = folder.icon
              return (
                <DropdownMenuItem key={folder.id} onClick={() => onFolderChange(folder.id)}>
                  <Icon className="mr-2 size-4" />
                  {folder.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile: Single dropdown */}
      <div className="flex items-center gap-1 md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-[30px] gap-1.5">
              {(() => {
                const activeItem = folders.find((f) => f.id === activeFolder)
                const ActiveIcon = activeItem?.icon
                return ActiveIcon ? <ActiveIcon className="size-4" /> : null
              })()}
              <span className="text-[13px]">{folders.find((f) => f.id === activeFolder)?.label}</span>
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {activeCount.toLocaleString()}
              </Badge>
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {folders.map((folder) => {
              const Icon = folder.icon
              const isActive = activeFolder === folder.id
              return (
                <DropdownMenuItem key={folder.id} onClick={() => onFolderChange(folder.id)}>
                  <Icon className="mr-2 size-4" />
                  {folder.label}
                  {isActive && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {activeCount.toLocaleString()}
                    </span>
                  )}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
