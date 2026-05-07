# Members Page Dynamic Team Management — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire `/settings/members` to live data — list members, invite, change role, remove, cancel invitation, resend invitation — and retire the duplicate `/settings/team` page.

**Architecture:** Async server component (`page.tsx`) fetches initial data via Payload and passes typed props to a `"use client"` `MembersClient` component that owns all mutation state. Mutations hit new `PATCH`/`DELETE` handlers on the existing `/api/team/members` route and a new `/api/team/invitations/resend` route.

**Tech Stack:** Next.js 15 (App Router), Payload CMS 3 (`@payload-config`, `getPayload`), TypeScript, shadcn/ui (Dialog, DropdownMenu, Select, Badge, Input, Button), sonner toasts, Tailwind CSS 4.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/app/(frontend)/settings/members/page.tsx` | Rewrite | Async server component — auth, data fetch, pass props to MembersClient |
| `src/components/settings-members-client.tsx` | Create | Client component — state, mutations, full UI |
| `src/app/api/team/members/route.ts` | Modify | Add PATCH (change role) and DELETE (remove/cancel) handlers |
| `src/app/api/team/invitations/resend/route.ts` | Create | POST handler — reset expiry, trigger afterChange email hook |
| `src/app/(frontend)/settings/team/page.tsx` | Rewrite | One-liner redirect to /settings/members |

---

## Task 1: PATCH + DELETE handlers on `/api/team/members`

**Files:**
- Modify: `src/app/api/team/members/route.ts`

- [ ] **Step 1: Add the PATCH handler at the bottom of the file (after the existing POST handler)**

Open `src/app/api/team/members/route.ts` and append:

```typescript
/**
 * PATCH /api/team/members
 * Change a member's role
 * Body: { memberId: string, role: 'admin' | 'editor' | 'viewer' }
 */
export async function PATCH(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const authResult = await payload.auth({ headers: req.headers })
    if (!authResult?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = authResult.user
    const body = await req.json()
    const { memberId, role } = body

    if (!memberId || !role || !['admin', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'memberId and a valid role are required' }, { status: 400 })
    }

    // Load the membership being changed
    const targetMember = await payload.findByID({
      collection: 'members',
      id: memberId,
      depth: 1,
    })

    const orgId =
      typeof targetMember.organization === 'object'
        ? targetMember.organization.id
        : targetMember.organization

    // Caller must be owner or admin in this org
    const callerMembership = await payload.find({
      collection: 'members',
      where: {
        and: [
          { user: { equals: user.id } },
          { organization: { equals: orgId } },
          { or: [{ role: { equals: 'owner' } }, { role: { equals: 'admin' } }] },
        ],
      },
      limit: 1,
      depth: 0,
    })
    if (callerMembership.docs.length === 0) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Cannot change own role
    const targetUserId =
      typeof targetMember.user === 'object' ? targetMember.user.id : targetMember.user
    if (String(targetUserId) === String(user.id)) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })
    }

    // The Members collection beforeChange hook already guards last-owner demotion —
    // it will throw, which becomes a 500 unless we catch and re-surface it.
    const updated = await payload.update({
      collection: 'members',
      id: memberId,
      data: { role },
    })

    return NextResponse.json({ success: true, member: updated })
  } catch (error: any) {
    const message = error.message || 'Failed to update role'
    const status = message.includes('Cannot change') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

/**
 * DELETE /api/team/members
 * Remove a member or cancel an invitation
 * Body: { memberId: string, type: 'member' | 'invitation' }
 */
export async function DELETE(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const authResult = await payload.auth({ headers: req.headers })
    if (!authResult?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = authResult.user
    const body = await req.json()
    const { memberId, type } = body

    if (!memberId || !['member', 'invitation'].includes(type)) {
      return NextResponse.json(
        { error: 'memberId and type (member|invitation) are required' },
        { status: 400 },
      )
    }

    if (type === 'member') {
      const targetMember = await payload.findByID({
        collection: 'members',
        id: memberId,
        depth: 1,
      })

      const orgId =
        typeof targetMember.organization === 'object'
          ? targetMember.organization.id
          : targetMember.organization

      // Caller must be owner or admin
      const callerMembership = await payload.find({
        collection: 'members',
        where: {
          and: [
            { user: { equals: user.id } },
            { organization: { equals: orgId } },
            { or: [{ role: { equals: 'owner' } }, { role: { equals: 'admin' } }] },
          ],
        },
        limit: 1,
        depth: 0,
      })
      if (callerMembership.docs.length === 0) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      // Cannot remove self
      const targetUserId =
        typeof targetMember.user === 'object' ? targetMember.user.id : targetMember.user
      if (String(targetUserId) === String(user.id)) {
        return NextResponse.json({ error: 'Cannot remove yourself from the team' }, { status: 403 })
      }

      // Members beforeDelete hook guards last-owner deletion
      await payload.delete({ collection: 'members', id: memberId })
      return NextResponse.json({ success: true })
    }

    // type === 'invitation' — soft-expire it
    const invitation = await payload.findByID({
      collection: 'invitations',
      id: memberId,
      depth: 1,
    })

    const orgId =
      typeof invitation.organization === 'object'
        ? invitation.organization.id
        : invitation.organization

    const callerMembership = await payload.find({
      collection: 'members',
      where: {
        and: [
          { user: { equals: user.id } },
          { organization: { equals: orgId } },
          { or: [{ role: { equals: 'owner' } }, { role: { equals: 'admin' } }] },
        ],
      },
      limit: 1,
      depth: 0,
    })
    if (callerMembership.docs.length === 0) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    await payload.update({
      collection: 'invitations',
      id: memberId,
      data: { status: 'expired' },
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    const message = error.message || 'Failed to remove member'
    const status = message.includes('Cannot') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
```

- [ ] **Step 2: Verify the file compiles (no TS errors)**

```bash
cd /Users/gunnarsaliev/Documents/projects/prevema && npx tsc --noEmit 2>&1 | grep "api/team/members"
```
Expected: no output (no errors in that file).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/team/members/route.ts
git commit -m "feat: add PATCH and DELETE handlers to team members API"
```

---

## Task 2: Resend invitation endpoint

**Files:**
- Create: `src/app/api/team/invitations/resend/route.ts`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p /Users/gunnarsaliev/Documents/projects/prevema/src/app/api/team/invitations/resend
```

- [ ] **Step 2: Write the route file**

Create `src/app/api/team/invitations/resend/route.ts`:

```typescript
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/team/invitations/resend
 * Reset expiry and trigger re-send of an invitation email.
 * Body: { invitationId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const authResult = await payload.auth({ headers: req.headers })
    if (!authResult?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = authResult.user
    const body = await req.json()
    const { invitationId } = body

    if (!invitationId) {
      return NextResponse.json({ error: 'invitationId is required' }, { status: 400 })
    }

    const invitation = await payload.findByID({
      collection: 'invitations',
      id: invitationId,
      depth: 1,
    })

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending invitations can be resent' },
        { status: 400 },
      )
    }

    const orgId =
      typeof invitation.organization === 'object'
        ? invitation.organization.id
        : invitation.organization

    // Caller must be owner or admin of this org
    const callerMembership = await payload.find({
      collection: 'members',
      where: {
        and: [
          { user: { equals: user.id } },
          { organization: { equals: orgId } },
          { or: [{ role: { equals: 'owner' } }, { role: { equals: 'admin' } }] },
        ],
      },
      limit: 1,
      depth: 0,
    })
    if (callerMembership.docs.length === 0) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Reset expiry to 7 days from now.
    // The Invitations afterChange hook fires on 'create' only, so we send the email manually.
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await payload.update({
      collection: 'invitations',
      id: invitationId,
      data: { expiresAt: expiresAt.toISOString() },
    })

    // Re-send the email directly (afterChange hook only fires on create)
    const orgName =
      typeof invitation.organization === 'object' && 'name' in invitation.organization
        ? (invitation.organization as any).name
        : 'your organization'

    const inviteUrl = `${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/accept-invitation?token=${invitation.token}`

    await payload.sendEmail({
      to: invitation.email,
      subject: `Reminder: You've been invited to join ${orgName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
            <h1 style="color: #2c3e50; margin-top: 0;">Invitation Reminder</h1>
            <p style="font-size: 16px; color: #555;">
              You have a pending invitation to join <strong>${orgName}</strong>.
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" style="display: inline-block; background-color: #0066cc; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Accept Invitation
            </a>
          </div>
          <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 15px; margin-top: 20px;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              ⏰ <strong>Note:</strong> This invitation expires on ${expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
            </p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e4e8; font-size: 12px; color: #6c757d; text-align: center;">
            <p>If the button doesn't work, copy and paste this link:</p>
            <p style="word-break: break-all; color: #0066cc;">${inviteUrl}</p>
          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error resending invitation:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to resend invitation' },
      { status: 500 },
    )
  }
}
```

- [ ] **Step 3: Verify no TS errors**

```bash
cd /Users/gunnarsaliev/Documents/projects/prevema && npx tsc --noEmit 2>&1 | grep "invitations/resend"
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/team/invitations/resend/route.ts
git commit -m "feat: add resend invitation API endpoint"
```

---

## Task 3: `MembersClient` client component

**Files:**
- Create: `src/components/settings-members-client.tsx`

- [ ] **Step 1: Create the file**

Create `src/components/settings-members-client.tsx`:

```typescript
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
  userId?: string  // populated for real members (not invitations); used for self-detection
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
    // Optimistically update
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
        // Revert
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
        body: JSON.stringify({ memberId, type }),
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

  const handleInvite = async (email: string, role: string) => {
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
  }

  return (
    <section className="py-32">
      <div className="container max-w-3xl">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold tracking-tight">
              {organization.name} Members
            </h3>
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
              <InviteDialog
                open={inviteOpen}
                onOpenChange={setInviteOpen}
                onInvite={handleInvite}
              />
            </div>

            <p className="text-xs font-semibold text-muted-foreground">
              {filteredMembers.length} members
            </p>

            <ul className="overflow-x-auto">
              {filteredMembers.map((member) => (
                <li
                  key={member.id}
                  className="w-full min-w-80 shrink-0 border-b py-3 first:pt-0"
                >
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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
      {/* Avatar + name */}
      <div className="flex items-center gap-2 sm:flex-2/3">
        <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-muted">
          <span className="text-sm font-medium">{member.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="text-sm font-medium">
          <p>{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.email}</p>
        </div>
      </div>

      {/* Role + status + actions */}
      <div className="flex items-center justify-between gap-3 sm:flex-1/3">
        {member.isInvitation ? (
          <StatusBadge status="invited" />
        ) : canEditRole ? (
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

        {showDropdown ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                aria-label="Open menu"
                size="icon-sm"
                disabled={isLoading}
              >
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
          <div className="size-8" /> /* spacer to keep layout consistent */
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
              {loading ? 'Sending…' : <>Send Invitation <CornerDownLeft /></>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verify no TS errors**

```bash
cd /Users/gunnarsaliev/Documents/projects/prevema && npx tsc --noEmit 2>&1 | grep "settings-members-client"
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/settings-members-client.tsx
git commit -m "feat: add MembersClient component with invite, role change, remove, and resend"
```

---

## Task 4: Rewrite the server component `page.tsx`

**Files:**
- Rewrite: `src/app/(frontend)/settings/members/page.tsx`

- [ ] **Step 1: Rewrite the page**

Replace the entire contents of `src/app/(frontend)/settings/members/page.tsx` with:

```typescript
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { MembersClient, type MemberRow } from '@/components/settings-members-client'

export default async function MembersPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  // Find user's first membership to get the org
  const memberships = await payload.find({
    collection: 'members',
    where: { user: { equals: user.id } },
    depth: 1,
    limit: 1,
  })

  if (memberships.docs.length === 0) {
    return (
      <section className="py-32">
        <div className="container max-w-3xl">
          <p className="text-sm text-muted-foreground">
            You are not part of any organization yet.
          </p>
        </div>
      </section>
    )
  }

  const firstMembership = memberships.docs[0]
  const org = typeof firstMembership.organization === 'object' ? firstMembership.organization : null
  const orgId = org?.id ?? (firstMembership.organization as string)
  const orgName = org && 'name' in org ? (org as any).name : 'Organization'

  // Fetch all members of the org
  const orgMembers = await payload.find({
    collection: 'members',
    where: { organization: { equals: orgId } },
    depth: 2,
    sort: '-createdAt',
    limit: 1000,
  })

  // Fetch pending invitations
  const invitations = await payload.find({
    collection: 'invitations',
    where: {
      and: [
        { organization: { equals: orgId } },
        { status: { equals: 'pending' } },
      ],
    },
    depth: 1,
    sort: '-createdAt',
    limit: 1000,
  })

  const memberRows: MemberRow[] = orgMembers.docs.map((m) => {
    const u = typeof m.user === 'object' ? m.user : null
    return {
      id: m.id,
      userId: (u as any)?.id ? String((u as any).id) : undefined,
      name: (u as any)?.name || (u as any)?.email || 'Unknown',
      email: (u as any)?.email || '',
      role: m.role as MemberRow['role'],
      status: m.status,
      isOwner: m.role === 'owner',
      isInvitation: false,
      joinedAt: m.createdAt,
    }
  })

  const invitationRows: MemberRow[] = invitations.docs.map((inv) => ({
    id: inv.id,
    name: inv.email,
    email: inv.email,
    role: inv.role as MemberRow['role'],
    status: 'invited',
    isOwner: false,
    isInvitation: true,
    invitedAt: inv.createdAt,
    expiresAt: inv.expiresAt ?? undefined,
  }))

  return (
    <MembersClient
      initialMembers={[...memberRows, ...invitationRows]}
      organization={{ id: orgId, name: orgName }}
      currentUserId={String(user.id)}
    />
  )
}
```

- [ ] **Step 2: Verify no TS errors**

```bash
cd /Users/gunnarsaliev/Documents/projects/prevema && npx tsc --noEmit 2>&1 | grep "settings/members"
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/(frontend)/settings/members/page.tsx
git commit -m "feat: wire members page to live data via server component"
```

---

## Task 5: Redirect `/settings/team` to `/settings/members`

**Files:**
- Rewrite: `src/app/(frontend)/settings/team/page.tsx`

- [ ] **Step 1: Replace the team page**

Replace the entire contents of `src/app/(frontend)/settings/team/page.tsx` with:

```typescript
import { redirect } from 'next/navigation'

export default function TeamPage() {
  redirect('/settings/members')
}
```

- [ ] **Step 2: Verify no TS errors**

```bash
cd /Users/gunnarsaliev/Documents/projects/prevema && npx tsc --noEmit 2>&1 | grep "settings/team"
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/(frontend)/settings/team/page.tsx
git commit -m "feat: redirect /settings/team to /settings/members"
```

---

## Task 6: Full type-check and smoke test

- [ ] **Step 1: Run full type-check**

```bash
cd /Users/gunnarsaliev/Documents/projects/prevema && npx tsc --noEmit 2>&1
```
Expected: zero errors (or only pre-existing errors unrelated to this feature).

- [ ] **Step 2: Start the dev server and visit the page**

```bash
cd /Users/gunnarsaliev/Documents/projects/prevema && npm run dev
```
Open `http://localhost:3000/settings/members` while logged in.

Expected:
- Page loads without spinner (initial data from server)
- Member list shows the org creator with role "owner"
- Search input filters the list
- "Invite Member" button opens dialog
- Entering an email and submitting sends an invitation and refreshes the list
- Invited row appears with "Invited" badge and a dropdown with "Resend" / "Cancel"
- Role select on non-owner rows saves on change and shows a toast

- [ ] **Step 3: Verify `/settings/team` redirects**

Open `http://localhost:3000/settings/team`.
Expected: browser redirects to `/settings/members`.
