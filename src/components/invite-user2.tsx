'use client'

import { CornerDownLeft, UserRoundPlus } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'

interface InviteUser2Props {
  heading?: string
  className?: string
}

const InviteUser2 = ({ heading = 'Invite Users', className }: InviteUser2Props) => {
  const users = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      role: 'Administrator',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'm.chen@company.com',
      role: 'Collaborator',
      status: 'Invited',
    },
  ]

  return (
    <section className={cn('py-32', className)}>
      <div className="container flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Members</h2>
          <p className="mt-2 text-sm text-muted-foreground">Manage and invite users to your team</p>
        </div>
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
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-fit">Invite Users</Button>
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
                Invite users to your team by entering their email addresses
              </SheetDescription>
            </SheetHeader>
            <form
              autoComplete="off"
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-1 flex-col gap-6 overflow-y-auto bg-muted pt-6"
            >
              <div className="space-y-1 px-6">
                <Label className="text-xs">Email addresses</Label>
                <Textarea
                  style={{
                    resize: 'none',
                    minHeight: '100px',
                  }}
                  placeholder="Enter email addresses..."
                  className="bg-background"
                />
              </div>
              <div className="space-y-1 px-6">
                <Label className="text-xs">Assign role</Label>
                <Select defaultValue="collaborator">
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="collaborator">Collaborator</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex px-6">
                <Button type="submit">
                  Send Invitation <CornerDownLeft />
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
