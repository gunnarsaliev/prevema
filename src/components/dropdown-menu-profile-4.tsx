'use client'

import { Check, ChevronsUpDown, Plus } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const title = 'Multi-Account Switcher'

const DropdownMenuProfile4 = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button className="h-auto w-full justify-between py-2 px-2" variant="outline">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Avatar className="h-6 w-6 flex-shrink-0">
            <AvatarImage alt="@haydenbleasel" src="https://github.com/haydenbleasel.png" />
            <AvatarFallback>HB</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-medium truncate">Personal Account</span>
            <span className="text-xs text-muted-foreground truncate">hello@haydenbleasel.com</span>
          </div>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" className="w-[calc(100%-1rem)] min-w-48" sideOffset={4}>
      <DropdownMenuLabel>Accounts</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="flex items-center gap-2">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage alt="@haydenbleasel" src="https://github.com/haydenbleasel.png" />
          <AvatarFallback>HB</AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-medium truncate">Personal Account</span>
          <span className="text-xs text-muted-foreground truncate">hello@haydenbleasel.com</span>
        </div>
        <Check className="ml-auto h-4 w-4 shrink-0" />
      </DropdownMenuItem>
      <DropdownMenuItem className="flex items-center gap-2">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback>AC</AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-medium truncate">Acme Corp</span>
          <span className="text-xs text-muted-foreground truncate">team@acme.com</span>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem className="flex items-center gap-2">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback>ST</AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-medium truncate">Startup Inc</span>
          <span className="text-xs text-muted-foreground truncate">hello@startup.io</span>
        </div>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <Plus />
        Add Account
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)

export default DropdownMenuProfile4
