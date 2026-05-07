'use client'

import { useState, useEffect } from 'react'
import {
  CornerDownLeft,
  UserRoundPlus,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

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
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: string
  isOwner?: boolean
  isInvitation?: boolean
  joinedAt?: string
  invitedAt?: string
  expiresAt?: string
}

interface Organization {
  id: string
  name: string
}

interface InviteUser2Props {
  heading?: string
  className?: string
}

const InviteUser2 = ({ heading = 'Invite Users', className }: InviteUser2Props) => {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [isInviteSheetOpen, setIsInviteSheetOpen] = useState(false)
  const [emailText, setEmailText] = useState('')
  const [selectedRole, setSelectedRole] = useState('editor')

  // Fetch team members on component mount
  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/team/members')

      if (!response.ok) {
        throw new Error('Failed to fetch team members')
      }

      const data = await response.json()
      setMembers(data.members || [])
      setOrganization(data.organization || null)
    } catch (error) {
      console.error('Error fetching team members:', error)
      toast.error('Failed to load team members')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!emailText.trim()) {
      toast.error('Please enter at least one email address')
      return
    }

    // Parse email addresses (split by comma, semicolon, or newline)
    const emails = emailText
      .split(/[,;\n]+/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0)

    if (emails.length === 0) {
      toast.error('Please enter valid email addresses')
      return
    }

    try {
      setInviteLoading(true)

      const response = await fetch('/api/team/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails,
          role: selectedRole,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send invitations')
      }

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        setEmailText('')
        setIsInviteSheetOpen(false)
        // Refresh the team members list
        await fetchTeamMembers()
      }

      // Show individual errors if any
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach((error: any) => {
          toast.error(`${error.email}: ${error.error}`)
        })
      }
    } catch (error: any) {
      console.error('Error sending invitations:', error)
      toast.error(error.message || 'Failed to send invitations')
    } finally {
      setInviteLoading(false)
    }
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Owner'
      case 'admin':
        return 'Administrator'
      case 'editor':
        return 'Editor'
      case 'viewer':
        return 'Viewer'
      default:
        return role.charAt(0).toUpperCase() + role.slice(1)
    }
  }

  const getStatusBadge = (member: TeamMember) => {
    if (member.isInvitation) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Invited
        </span>
      )
    }

    switch (member.status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        )
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Inactive
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {member.status}
          </span>
        )
    }
  }

  return (
    <section className="py-32">
      <div className="container flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Team Members</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage and invite users to {organization?.name || 'your team'}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2 text-muted-foreground">Loading team members...</span>
          </div>
        ) : (
          <>
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
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No team members found. Invite your first team member to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {member.name}
                          {member.isOwner && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Owner
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{getRoleDisplay(member.role)}</TableCell>
                      <TableCell>{getStatusBadge(member)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <Sheet open={isInviteSheetOpen} onOpenChange={setIsInviteSheetOpen}>
              <SheetTrigger asChild>
                <Button className="w-fit">Invite Users</Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className={cn(
                  'flex h-full w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-lg',
                  className,
                )}
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
                  onSubmit={handleInvite}
                  className="flex flex-1 flex-col gap-6 overflow-y-auto bg-muted pt-6"
                >
                  <div className="space-y-1 px-6">
                    <Label className="text-xs">Email addresses</Label>
                    <Textarea
                      value={emailText}
                      onChange={(e) => setEmailText(e.target.value)}
                      style={{
                        resize: 'none',
                        minHeight: '100px',
                      }}
                      placeholder="Enter email addresses (one per line, or separated by commas)"
                      className="bg-background"
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple emails with commas, semicolons, or new lines
                    </p>
                  </div>
                  <div className="space-y-1 px-6">
                    <Label className="text-xs">Assign role</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder="Choose a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                        <SelectItem value="editor">Editor - Can edit content</SelectItem>
                        <SelectItem value="admin">Administrator - Full access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex px-6">
                    <Button type="submit" disabled={inviteLoading} className="w-full">
                      {inviteLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending Invitations...
                        </>
                      ) : (
                        <>
                          Send Invitation <CornerDownLeft className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </SheetContent>
            </Sheet>
          </>
        )}
      </div>
    </section>
  )
}

export { InviteUser2 }
