import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, ChevronDown, Plus, Send } from 'lucide-react'
import { type User } from './data'

interface ReplyComposerProps {
  recipientEmail: string
  respondingUser?: User
  isAgentPanelOpen?: boolean
}

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'
  )
}

export function ReplyComposer({
  recipientEmail,
  respondingUser,
  isAgentPanelOpen = true,
}: ReplyComposerProps) {
  return (
    <div
      className={`shrink-0 border-t bg-background px-6 py-4 transition-all duration-200 ${
        isAgentPanelOpen ? 'lg:px-10' : 'lg:px-10 xl:px-16'
      }`}
    >
      <div
        className={`mx-auto rounded-lg border bg-muted/30 transition-all duration-200 ${
          isAgentPanelOpen ? 'max-w-3xl' : 'max-w-4xl xl:max-w-5xl'
        }`}
      >
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <ArrowLeft className="size-4 shrink-0 rotate-[135deg] text-muted-foreground" />
          <span className="truncate text-sm text-muted-foreground">{recipientEmail}</span>
          <Button variant="ghost" size="sm" className="ml-auto h-6 shrink-0 px-2 text-xs">
            Cc
          </Button>
        </div>
        <Textarea
          placeholder="Write a reply..."
          className="min-h-[80px] resize-none border-0 bg-transparent focus-visible:ring-0 md:min-h-[100px]"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="size-8 shrink-0">
              <Plus className="size-4" />
            </Button>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Use <kbd className="rounded bg-muted px-1">/</kbd> for shortcuts
            </span>
          </div>
          <div className="flex items-center gap-2">
            {respondingUser && (
              <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                <Avatar className="size-5">
                  <AvatarImage src={respondingUser.avatar} alt={respondingUser.name} />
                  <AvatarFallback className="text-[8px]">
                    {getInitials(respondingUser.name)}
                  </AvatarFallback>
                </Avatar>
                <span>{respondingUser.name.split(' ')[0]} is responding...</span>
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  Close
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Close as resolved</DropdownMenuItem>
                <DropdownMenuItem>Close as spam</DropdownMenuItem>
                <DropdownMenuItem>Close without reply</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" className="gap-1">
              <Send className="size-3" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
