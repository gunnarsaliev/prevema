'use client'

import { CornerDownLeft, MoreHorizontalIcon, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface MemberRow {
  id: string
  userId?: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  status: string
  isOwner: boolean
  isInvitation: boolean
  invitedAt?: string
  expiresAt?: string
  joinedAt?: string
}

interface MembersClientProps {
  initialMembers: MemberRow[]
  organization: { id: string; name: string }
  currentUserId: string
}

export function MembersClient({ initialMembers, organization, currentUserId }: MembersClientProps) {
  const [members, setMembers] = useState<MemberRow[]>(initialMembers)
  const [searchValue, setSearchValue] = useState('')
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  const [inviteOpen, setInviteOpen] = useState(false)

  const filteredMembers = useMemo(
    () =>
      members.filter(
        (m) =>
          m.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          m.email.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    [members, searchValue],
  )

  const setLoading = (id: string, loading: boolean) => {
    setLoadingIds((prev) => {
      const next = new Set(prev)
      loading ? next.add(id) : next.delete(id)
      return next
    })
  }

  const refresh = async () => {
    try {
      const res = await fetch('/api/team/members')
      if (!res.ok) throw new Error('Failed to refresh')
      const data = await res.json()
      setMembers(data.members ?? [])
    } catch {
      toast.error('Failed to refresh member list')
    }
  }

  const handleRoleChange = async (memberId: string, newRole: string, previousRole: string) => {
    setLoading(memberId, true)
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole as MemberRow['role'] } : m)),
    )
    try {
      const res = await fetch('/api/team/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === memberId ? { ...m, role: previousRole as MemberRow['role'] } : m,
          ),
        )
        toast.error(data.error || 'Failed to update role')
        return
      }
      toast.success('Role updated')
    } catch {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId ? { ...m, role: previousRole as MemberRow['role'] } : m,
        ),
      )
      toast.error('Failed to update role')
    } finally {
      setLoading(memberId, false)
    }
  }

  const handleRemove = async (memberId: string, type: 'member' | 'invitation') => {
    setLoading(memberId, true)
    try {
      const res = await fetch('/api/team/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: memberId, type }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to remove')
        return
      }
      toast.success(type === 'invitation' ? 'Invitation cancelled' : 'Member removed')
      await refresh()
    } catch {
      toast.error('Failed to remove')
    } finally {
      setLoading(memberId, false)
    }
  }

  const handleResend = async (invitationId: string) => {
    setLoading(invitationId, true)
    try {
      const res = await fetch('/api/team/invitations/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to resend invitation')
        return
      }
      toast.success('Invitation resent')
    } catch {
      toast.error('Failed to resend invitation')
    } finally {
      setLoading(invitationId, false)
    }
  }

  const handleInvite = async (email: string, role: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/team/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: [email], role }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to send invitation')
        return false
      }
      if (data.errors?.length > 0) {
        data.errors.forEach((e: { email: string; error: string }) =>
          toast.error(`${e.email}: ${e.error}`),
        )
      }
      if (data.success) {
        toast.success(data.message)
        await refresh()
        return true
      }
      return false
    } catch {
      toast.error('Failed to send invitation')
      return false
    }
  }

  return (
    <section className="py-32">
      <div className="container max-w-3xl">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold tracking-tight">{organization.name} Members</h3>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Add teammates to collaborate on projects together. Control permissions and manage
              access levels for each member.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="relative w-full max-w-56 min-w-20">
                <Search className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  className="pl-7"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
              <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} onInvite={handleInvite} />
            </div>

            <p className="text-xs font-semibold text-muted-foreground">
              {filteredMembers.length} members
            </p>

            <ul className="overflow-x-auto">
              {filteredMembers.map((member) => (
                <li key={member.id} className="w-full min-w-80 shrink-0 border-b py-3 first:pt-0">
                  <MemberCard
                    member={member}
                    currentUserId={currentUserId}
                    isLoading={loadingIds.has(member.id)}
                    onRoleChange={(newRole, previousRole) =>
                      handleRoleChange(member.id, newRole, previousRole)
                    }
                    onRemove={() =>
                      handleRemove(member.id, member.isInvitation ? 'invitation' : 'member')
                    }
                    onResend={() => handleResend(member.id)}
                  />
                </li>
              ))}
              {filteredMembers.length === 0 && (
                <li className="py-8 text-center text-sm text-muted-foreground">
                  {searchValue ? 'No members match your search.' : 'No members yet.'}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

interface MemberCardProps {
  member: MemberRow
  currentUserId: string
  isLoading: boolean
  onRoleChange: (newRole: string, previousRole: string) => void
  onRemove: () => void
  onResend: () => void
}

function MemberCard({
  member,
  currentUserId,
  isLoading,
  onRoleChange,
  onRemove,
  onResend,
}: MemberCardProps) {
  const isSelf = !!member.userId && String(member.userId) === String(currentUserId)
  const canEditRole = !member.isOwner && !member.isInvitation && !isSelf
  const showDropdown = !member.isOwner && !isSelf

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2 sm:flex-2/3">
        <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-muted">
          <span className="text-sm font-medium">{member.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="text-sm font-medium">
          <p>{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.email}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:flex-1/3">
        <div className="flex items-center gap-2">
          {member.isInvitation ? (
            <StatusBadge status="invited" />
          ) : (
            <>
              <StatusBadge status={member.status} />
              {canEditRole ? (
                <Select
                  value={member.role}
                  onValueChange={(val) => onRoleChange(val, member.role)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="min-w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-sm capitalize text-muted-foreground">{member.role}</span>
              )}
            </>
          )}
        </div>

        {showDropdown ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" aria-label="Open menu" size="icon-sm" disabled={isLoading}>
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-fit max-w-56" align="end">
              {member.isInvitation ? (
                <>
                  <DropdownMenuItem onClick={onResend} disabled={isLoading}>
                    Resend invitation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onRemove} disabled={isLoading}>
                    Cancel invitation
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={onRemove} disabled={isLoading}>
                  Remove from team
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="size-8" />
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'invited') {
    return (
      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
        Invited
      </span>
    )
  }
  if (status === 'active') {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
        Active
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
      {status}
    </span>
  )
}

interface InviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite: (email: string, role: string) => Promise<boolean>
}

function InviteDialog({ open, onOpenChange, onInvite }: InviteDialogProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('editor')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Please enter an email address')
      return
    }
    setLoading(true)
    const ok = await onInvite(email.trim(), role)
    setLoading(false)
    if (ok) {
      setEmail('')
      setRole('editor')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Invite Member</Button>
      </DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden p-0">
        <DialogTitle className="flex items-center gap-2 border-b p-4 text-sm font-medium">
          Invite Team Member
        </DialogTitle>
        <form
          autoComplete="off"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 bg-muted pt-4"
        >
          <div className="flex flex-col gap-4 px-4">
            <div className="space-y-1">
              <Label className="text-xs">Email address</Label>
              <Input
                type="email"
                placeholder="name@yourcompany.com"
                className="bg-background"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Select role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="border-t bg-background px-4 py-3">
            <Button size="sm" type="submit" disabled={loading}>
              {loading ? 'Sending…' : (
                <>
                  Send Invitation <CornerDownLeft />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
