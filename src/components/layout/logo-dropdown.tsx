import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { LogoImage } from '../logo'

interface LogoDropdownProps {
  isCollapsed?: boolean
}

export function LogoDropdown({ isCollapsed = false }: LogoDropdownProps) {
  return (
    <DropdownMenu>
      <div className="flex w-full items-center group-data-[collapsible=icon]:justify-center">
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-auto items-center gap-3 p-0! hover:bg-transparent"
          >
            <LogoImage src="/logo.png" alt="Prevema" className="h-8 w-8 rounded-sm bg-muted p-1" />
            {!isCollapsed && (
              <>
                <span className="font-semibold">Prevema</span>
                <ChevronDown className="size-3 text-muted-foreground" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent className="w-56 z-50" align="start">
        <DropdownMenuLabel>Workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Workspace settings</DropdownMenuItem>
          <DropdownMenuItem>Invite teammates</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
