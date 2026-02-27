'use client'

import { useEffect, useState, useTransition } from 'react'
import { CornerDownLeft, UserRoundPlus, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getOrganizationMembers, createInvitation } from '@/app/(frontend)/dash/settings/actions'

interface InviteUser2Props {
  heading?: string
  className?: string
}

type Member = {
  id: string
  user: {
    id: string
    name: string
    email: string
    profileImage?: {
      url: string
    }
  }
  role: string
  status: string
  createdAt: string
}

const InviteUser2 = ({ heading = 'Invite Users', className }: InviteUser2Props) => {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedRole, setSelectedRole] = useState('editor')

  const loadMembers = async () => {
    setIsLoading(true)
    const result = await getOrganizationMembers()
    if (result.success) {
      setMembers(result.members)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadMembers()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createInvitation(formData)

      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        // Reload members to show updated list
        await loadMembers()
        // Clear form
        ;(e.target as HTMLFormElement).reset()
        setSelectedRole('editor')
        // Close sheet after a short delay
        setTimeout(() => {
          setIsOpen(false)
          setMessage(null)
        }, 1500)
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    })
  }

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <section className={cn('py-32', className)}>
      <div className="container flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Members</h2>
          <p className="mt-2 text-sm text-muted-foreground">Manage and invite users to your team</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : members.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">No members found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.user.name}</TableCell>
                  <TableCell>{member.user.email}</TableCell>
                  <TableCell>{formatRole(member.role)}</TableCell>
                  <TableCell>{formatStatus(member.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button className="w-fit">Invite Member</Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="flex h-full w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-lg"
          >
            <SheetHeader className="border-b px-6 py-4">
              <SheetTitle className="flex items-center gap-2 font-semibold">
                <UserRoundPlus className="size-4" />
                {heading}
              </SheetTitle>
              <SheetDescription className="sr-only">
                Invite a user to your team by entering their email address
              </SheetDescription>
            </SheetHeader>
            <form
              autoComplete="off"
              onSubmit={handleSubmit}
              className="flex flex-1 flex-col gap-6 overflow-y-auto bg-muted pt-6"
            >
              {message && (
                <div
                  className={cn(
                    'mx-6 rounded-lg border p-3 text-sm',
                    message.type === 'success'
                      ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
                      : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
                  )}
                >
                  {message.text}
                </div>
              )}

              <div className="space-y-1 px-6">
                <Label htmlFor="email" className="text-xs">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="colleague@example.com"
                  className="bg-background"
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1 px-6">
                <Label htmlFor="role" className="text-xs">
                  Assign role
                </Label>
                <input type="hidden" name="role" value={selectedRole} />
                <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isPending}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex px-6">
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Invitation <CornerDownLeft className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>
    </section>
  )
}

export { InviteUser2 }
