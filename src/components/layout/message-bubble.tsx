import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { type Message } from './data'

interface MessageBubbleProps {
  message: Message
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

export function MessageBubble({ message }: MessageBubbleProps) {
  const sender = message.sender
  const isCustomer = 'company' in sender

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <Avatar className="mt-0.5 size-10 shrink-0">
          <AvatarImage src={sender.avatar} alt={sender.name} />
          <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
            {getInitials(sender.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{sender.name}</span>
            {!isCustomer && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                Staff
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>From</span>
            <span>{sender.email}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {message.date}, {message.timestamp}
          </span>
        </div>
      </div>
      <div className="pl-13 text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
    </div>
  )
}
