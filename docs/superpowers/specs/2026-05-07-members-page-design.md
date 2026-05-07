# Members Page — Dynamic Team Management

**Date:** 2026-05-07  
**Status:** Approved

---

## Overview

Wire the `/settings/members` page to live data so users can view, invite, change roles, remove members, cancel invitations, and resend invitations. The `/settings/team` page (which partially duplicated this) becomes a redirect. The org creator is already automatically added as an owner via the `createOwnerMember` hook in the Organizations collection — no changes needed there.

---

## Architecture

### Files changed / created

| File | Change |
|------|--------|
| `src/app/(frontend)/settings/members/page.tsx` | Rewrite as async server component; fetches initial data and renders `<MembersClient>` |
| `src/components/settings-members-client.tsx` | New `"use client"` component; owns all mutation state; uses `SettingsMembers2` visual layout |
| `src/app/api/team/members/route.ts` | Add `PATCH` (change role) and `DELETE` (remove member or cancel invitation) handlers |
| `src/app/api/team/invitations/resend/route.ts` | New `POST` handler to resend an invitation email |
| `src/app/(frontend)/settings/team/page.tsx` | Replace with `redirect('/settings/members')` |

`SettingsMembers2` (`src/components/settings-members2.tsx`) is kept as the visual skeleton but its static mock data and internal state are superseded by `MembersClient`.

---

## Data Model (existing, no migrations needed)

- **Members collection**: `{ id, user → users, organization → organizations, role: owner|admin|editor|viewer, status: active|inactive|removed }`
- **Invitations collection**: `{ id, email, organization → organizations, role: admin|editor|viewer, status: pending|accepted|declined|expired, token, expiresAt, invitedBy → users }`
- Org creator is automatically inserted as a `role: owner` member by the `createOwnerMember` afterChange hook on Organizations.

---

## Server Component — `page.tsx`

```
async function MembersPage()
  → getPayload()
  → payload.auth({ headers }) → redirect to login if unauthenticated
  → payload.find('members', { where: { user: userId } }) → first org
  → payload.find('members', { where: { organization: orgId }, depth: 2 })
  → payload.find('invitations', { where: { organization: orgId, status: 'pending' } })
  → serialize to InitialMembersData
  → return <MembersClient initialData={...} currentUserId={userId} />
```

If the user has no organization, render an empty state ("You are not part of any organization yet.").

---

## Client Component — `MembersClient`

**Props:**
```ts
interface InitialMembersData {
  members: MemberRow[]
  organization: { id: string; name: string }
  currentUserId: string
}

interface MemberRow {
  id: string
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
```

**State:**
- `members: MemberRow[]` — seeded from props, refreshed after every mutation
- `searchValue: string`
- `loadingIds: Set<string>` — tracks which rows have in-flight requests (disables their controls)

**Refresh:** after each successful mutation, call `GET /api/team/members` and replace `members` state.

**Visual layout:** mirrors `SettingsMembers2` — heading, subheading CTA text, search input, member count, `UserCard` list, "Invite Member" button that opens the dialog.

**UserCard behavior:**
- Avatar (image or initial letter)
- Name + email
- Inline role `<Select>` — disabled for owner rows and the current user's own row; `onChange` → `PATCH /api/team/members`
- `<DropdownMenu>`:
  - Active member (non-owner, non-self): "Remove from team" → confirmation alert → `DELETE /api/team/members`
  - Invitation row: "Resend invitation" → `POST /api/team/invitations/resend`; "Cancel invitation" → `DELETE /api/team/members`
  - Owner row or self: dropdown hidden
- Status badge: "Active" (green), "Invited" (yellow, for invitation rows), "Inactive" (grey)

**Invite dialog** (reuses `InviteUserForm` from `SettingsMembers2`):
- Single email `<Input>` + role `<Select>` (admin/editor/viewer)
- `POST /api/team/members` with `{ emails: [email], role }`
- On success: toast + refresh + close dialog

---

## API Layer

### Existing

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/team/members` | Fetch members + pending invitations |
| POST | `/api/team/members` | Send invitation(s) |

### New

**PATCH `/api/team/members`**
```json
Request:  { "memberId": "string", "role": "admin|editor|viewer" }
Response: { "success": true, "member": { ...updated } }
```
Guards:
- Caller must be `owner` or `admin` in the org
- Cannot change own role
- Cannot change/demote the last owner → 400 "Cannot change the role of the last owner"

**DELETE `/api/team/members`**
```json
Request:  { "memberId": "string", "type": "member|invitation" }
Response: { "success": true }
```
Guards:
- Caller must be `owner` or `admin`
- Cannot remove self → 403
- Cannot remove last owner → 400
- `type: "invitation"` → sets invitation `status: expired` (soft delete matches existing Invitations hook pattern)

**POST `/api/team/invitations/resend`**
```json
Request:  { "invitationId": "string" }
Response: { "success": true }
```
- Validates invitation exists, belongs to caller's org, status is `pending`
- Resets `expiresAt` to now + 7 days
- Updates the invitation record (triggers `afterChange` email hook → resends email)

---

## Error Handling

| Scenario | Handling |
|----------|---------|
| No org on page load | Empty state message in server component |
| API error (4xx/5xx) | `toast.error(message)` via sonner |
| Last-owner demotion/removal | 400 response → toast; role select reverts to previous value |
| Self-removal attempt | 403 response → toast |
| Resend on non-pending invitation | 400 response → toast |
| Network failure | Catch block → generic toast |

---

## Out of Scope

- Transfer ownership UI (ownership transfer requires careful multi-step UX; dropdown item shown as disabled)
- Multi-org selection (app currently uses user's first org)
- Seat limit enforcement UI (already handled server-side in the Invitations collection hook)
