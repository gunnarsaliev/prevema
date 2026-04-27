# Dashboard Nav Cleanup & Org-ID Caching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove duplicated active-state logic from the dashboard navigation and cache `getUserOrganizationIds` so it doesn't hit the DB on every page request.

**Architecture:** Add `getCachedUserOrgIds` to `cached-queries.ts` using the same two-tier `React.cache` + `unstable_cache` pattern already used for `getCachedEvents`. Replace all direct `getUserOrganizationIds` calls across 10 dashboard files. Strip the dead `useMemo`/`usePathname` block from `client-layout.tsx` and the no-op `onClick` calls from sidebar `<Link>` elements.

**Tech Stack:** Next.js 15 App Router, `unstable_cache` + `React.cache`, Payload CMS, TypeScript, Tailwind CSS

---

## File Map

| File | Change |
|------|--------|
| `src/lib/cached-queries.ts` | Add `getCachedUserOrgIds` export |
| `src/app/(frontend)/dashboard/layout.tsx` | Use `getCachedUserOrgIds`, remove raw call |
| `src/app/(frontend)/dashboard/client-layout.tsx` | Remove `useMemo`/`usePathname` active-state block |
| `src/app/(frontend)/dashboard/page.tsx` | Use `getCachedUserOrgIds` |
| `src/app/(frontend)/dashboard/events/page.tsx` | Use `getCachedUserOrgIds` |
| `src/app/(frontend)/dashboard/events/[id]/page.tsx` | Use `getCachedUserOrgIds` |
| `src/app/(frontend)/dashboard/participants/page.tsx` | Use `getCachedUserOrgIds` |
| `src/app/(frontend)/dashboard/participants/[id]/page.tsx` | Use `getCachedUserOrgIds` |
| `src/app/(frontend)/dashboard/partners/page.tsx` | Use `getCachedUserOrgIds` |
| `src/app/(frontend)/dashboard/partners/[id]/page.tsx` | Use `getCachedUserOrgIds` |
| `src/app/(frontend)/dashboard/partner-types/page.tsx` | Use `getCachedUserOrgIds` |
| `src/app/(frontend)/dashboard/participant-roles/page.tsx` | Use `getCachedUserOrgIds` |
| `src/components/layout/application-shell/app-sidebar.tsx` | Remove `onClick` from `<Link>` elements |
| `src/components/layout/application-shell/application-shell.tsx` | Remove `onClick` from `<Link>` in `MobileBottomNav` |

---

### Task 1: Add `getCachedUserOrgIds` to cached-queries.ts

**Files:**
- Modify: `src/lib/cached-queries.ts`

- [ ] **Step 1: Add the cached function**

Open `src/lib/cached-queries.ts`. Add this import at the top alongside the existing ones (it's already importing `cache` from `react` and `unstable_cache` from `next/cache`):

```ts
import { getUserOrganizationIds } from '@/access/utilities'
```

Then append this export at the bottom of the file (after `getCachedEvents`):

```ts
/**
 * Cached user org IDs.
 * Two-tier: React cache() deduplicates within a render pass;
 * unstable_cache persists across requests for 60 s.
 */
export const getCachedUserOrgIds = cache(async (userId: number): Promise<number[]> => {
  return unstable_cache(
    async () => {
      const payload = await getPayload({ config: await config })
      const ids = await getUserOrganizationIds(payload, { id: userId } as any)
      return ids.map(Number)
    },
    ['user-orgs', String(userId)],
    { revalidate: 60, tags: [`user-${userId}-orgs`] },
  )()
})
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/gunnarsaliev/Documents/projects/prevema && pnpm tsc --noEmit 2>&1 | head -40
```

Expected: no errors related to `getCachedUserOrgIds`. Fix any type errors before continuing.

- [ ] **Step 3: Commit**

```bash
git add src/lib/cached-queries.ts
git commit -m "feat: add getCachedUserOrgIds with two-tier caching"
```

---

### Task 2: Update dashboard layout.tsx

**Files:**
- Modify: `src/app/(frontend)/dashboard/layout.tsx`

- [ ] **Step 1: Replace the uncached call**

Replace the entire file content with:

```tsx
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { getCachedLayoutData, getCachedUserOrgIds } from '@/lib/cached-queries'
import { DashboardClientLayout } from './client-layout'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/admin/login')

  const userId = typeof user.id === 'number' ? user.id : Number(user.id)
  const organizationIds = await getCachedUserOrgIds(userId)

  const { permissions } = await getCachedLayoutData(userId, organizationIds)

  return <DashboardClientLayout permissions={permissions}>{children}</DashboardClientLayout>
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/gunnarsaliev/Documents/projects/prevema && pnpm tsc --noEmit 2>&1 | head -40
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(frontend\)/dashboard/layout.tsx
git commit -m "feat: use getCachedUserOrgIds in dashboard layout"
```

---

### Task 3: Strip dead active-state code from client-layout.tsx

**Files:**
- Modify: `src/app/(frontend)/dashboard/client-layout.tsx`

- [ ] **Step 1: Remove useMemo/usePathname block**

Replace the entire file content with:

```tsx
'use client'

import {
  LayoutDashboard,
  Calendar,
  Users,
  Tag,
  Handshake,
  Layers,
} from 'lucide-react'

import { ApplicationShell } from '@/components/layout/application-shell'
import { PermissionsProvider } from '@/providers/Permissions'
import { useAuth } from '@/providers/Auth'
import type { SidebarModule } from '@/components/layout/application-shell/types'

const dashboardModules: SidebarModule[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'events', label: 'Events', icon: Calendar, path: '/dashboard/events' },
  { id: 'participants', label: 'Participants', icon: Users, path: '/dashboard/participants' },
  { id: 'participant-roles', label: 'Roles', icon: Tag, path: '/dashboard/participant-roles' },
  { id: 'partners', label: 'Partners', icon: Handshake, path: '/dashboard/partners' },
  { id: 'partner-types', label: 'Types', icon: Layers, path: '/dashboard/partner-types' },
]

interface Permissions {
  role: 'owner' | 'admin' | 'editor' | 'viewer' | null
  canEdit: boolean
  canAdmin: boolean
  isOwner: boolean
}

export function DashboardClientLayout({
  children,
  permissions,
}: {
  children: React.ReactNode
  permissions: Permissions
}) {
  const { user } = useAuth()

  const profileImageUrl =
    user?.profileImage && typeof user.profileImage === 'object'
      ? (user.profileImage as any).url
      : undefined

  const userData = user
    ? { name: user.name ?? user.email, email: user.email, avatar: profileImageUrl ?? '' }
    : undefined

  return (
    <PermissionsProvider
      role={permissions.role}
      canEdit={permissions.canEdit}
      canAdmin={permissions.canAdmin}
      isOwner={permissions.isOwner}
    >
      <ApplicationShell
        modules={dashboardModules}
        activeModuleId=""
        onModuleChange={() => {}}
        user={userData}
        logo={{ src: '/logo.png', alt: 'Logo', href: '/dashboard' }}
        mobileNavigation
      >
        {children}
      </ApplicationShell>
    </PermissionsProvider>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/gunnarsaliev/Documents/projects/prevema && pnpm tsc --noEmit 2>&1 | head -40
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(frontend\)/dashboard/client-layout.tsx
git commit -m "refactor: remove dead active-state useMemo from client-layout"
```

---

### Task 4: Remove no-op onClick from app-sidebar.tsx Links

**Files:**
- Modify: `src/components/layout/application-shell/app-sidebar.tsx`

- [ ] **Step 1: Remove onClick from Link elements**

Replace the file content with:

```tsx
'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { HelpCircle } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import type { SidebarModule } from './types'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  modules: SidebarModule[]
  activeModuleId: string
  onModuleChange: (moduleId: string) => void
  logo?: {
    src: string
    alt: string
    href?: string
  }
}

export function AppSidebar({
  modules,
  activeModuleId,
  logo = { src: '/logo.png', alt: 'Logo', href: '/dash' },
  ...props
}: AppSidebarProps) {
  const pathname = usePathname()

  const derivedActiveId = React.useMemo(() => {
    const sorted = [...modules]
      .filter((m) => m.path)
      .sort((a, b) => (b.path?.length ?? 0) - (a.path?.length ?? 0))
    return sorted.find((m) => m.path && pathname.startsWith(m.path))?.id ?? activeModuleId
  }, [pathname, modules, activeModuleId])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-3">
        <Link href={logo.href ?? '/dash'}>
          <Image
            src={logo.src}
            alt={logo.alt}
            width={56}
            height={56}
            className="size-14 object-contain"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-3 pt-0">
        <SidebarGroup className="p-0">
          <SidebarGroupContent className="flex flex-col gap-2">
            {modules.map((module) => {
              const isActive = derivedActiveId === module.id
              const itemClass = cn(
                'flex aspect-square w-full items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground transition-all hover:rounded-xl hover:bg-primary hover:text-primary-foreground',
                isActive && 'rounded-xl bg-primary text-primary-foreground',
              )
              return module.path ? (
                <Link
                  key={module.id}
                  href={module.path}
                  className={itemClass}
                  aria-label={module.label}
                  title={module.label}
                >
                  <module.icon className="size-6" />
                </Link>
              ) : (
                <button
                  key={module.id}
                  type="button"
                  className={itemClass}
                  aria-label={module.label}
                  title={module.label}
                >
                  <module.icon className="size-6" />
                </button>
              )
            })}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <Link
          href="/dash/help"
          className="flex aspect-square w-full items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground transition-all hover:rounded-xl hover:bg-primary hover:text-primary-foreground"
          aria-label="Help"
          title="Help"
        >
          <HelpCircle className="size-6" />
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/gunnarsaliev/Documents/projects/prevema && pnpm tsc --noEmit 2>&1 | head -40
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/application-shell/app-sidebar.tsx
git commit -m "refactor: remove no-op onClick from sidebar Link elements"
```

---

### Task 5: Remove no-op onClick from MobileBottomNav Links

**Files:**
- Modify: `src/components/layout/application-shell/application-shell.tsx`

- [ ] **Step 1: Remove onClick from MobileBottomNav Link elements**

In `application-shell.tsx`, find the `MobileBottomNav` function (lines 135–185). Replace just that function with:

```tsx
function MobileBottomNav({ modules, activeModuleId }: Omit<MobileBottomNavProps, 'onModuleChange'>) {
  const pathname = usePathname()

  const derivedActiveId = React.useMemo(() => {
    const sorted = [...modules]
      .filter((m) => m.path)
      .sort((a, b) => (b.path?.length ?? 0) - (a.path?.length ?? 0))
    return sorted.find((m) => m.path && pathname.startsWith(m.path))?.id ?? activeModuleId
  }, [pathname, modules, activeModuleId])

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${Math.min(modules.length, 5)}, minmax(0, 1fr))` }}
      >
        {modules.slice(0, 5).map((module) => {
          const Icon = module.icon
          const isActive = derivedActiveId === module.id
          const itemClass = cn(
            'flex flex-col items-center justify-center py-3 text-xs',
            isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
          )
          return module.path ? (
            <Link
              key={module.id}
              href={module.path}
              className={itemClass}
              aria-label={module.label}
            >
              <Icon className="size-5" />
              <span className="mt-1 text-[10px]">{module.label}</span>
            </Link>
          ) : (
            <button
              key={module.id}
              type="button"
              className={itemClass}
              aria-label={module.label}
            >
              <Icon className="size-5" />
              <span className="mt-1 text-[10px]">{module.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
```

Also update the `MobileBottomNavProps` interface (lines 129–133) to remove `onModuleChange`:

```tsx
interface MobileBottomNavProps {
  modules: SidebarModule[]
  activeModuleId: string
}
```

And update the call site inside `ApplicationShell` (around line 263) — remove `onModuleChange`:

```tsx
{mobileNavigation && (
  <MobileBottomNav
    modules={modules}
    activeModuleId={activeModuleId}
  />
)}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/gunnarsaliev/Documents/projects/prevema && pnpm tsc --noEmit 2>&1 | head -40
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/application-shell/application-shell.tsx
git commit -m "refactor: remove no-op onClick from MobileBottomNav Links"
```

---

### Task 6: Replace getUserOrganizationIds in all dashboard pages

**Files:**
- Modify: `src/app/(frontend)/dashboard/page.tsx`
- Modify: `src/app/(frontend)/dashboard/events/page.tsx`
- Modify: `src/app/(frontend)/dashboard/events/[id]/page.tsx`
- Modify: `src/app/(frontend)/dashboard/participants/page.tsx`
- Modify: `src/app/(frontend)/dashboard/participants/[id]/page.tsx`
- Modify: `src/app/(frontend)/dashboard/partners/page.tsx`
- Modify: `src/app/(frontend)/dashboard/partners/[id]/page.tsx`
- Modify: `src/app/(frontend)/dashboard/partner-types/page.tsx`
- Modify: `src/app/(frontend)/dashboard/participant-roles/page.tsx`

In each file, apply this two-part change:

**A. Remove import:**
```ts
import { getUserOrganizationIds } from '@/access/utilities'
```

**B. Add `getCachedUserOrgIds` to the cached-queries import** (each file already imports something from `@/lib/cached-queries` — add it there):
```ts
import { ..., getCachedUserOrgIds } from '@/lib/cached-queries'
```

**C. Replace the uncached pattern:**
```ts
// BEFORE (two lines):
const rawOrgIds = await getUserOrganizationIds(payload, user)
const organizationIds = rawOrgIds.map(Number)

// AFTER (one line, userId must already be computed above it):
const organizationIds = await getCachedUserOrgIds(userId)
```

For pages that don't yet extract `userId` before this call, add:
```ts
const userId = typeof user.id === 'number' ? user.id : Number(user.id)
```
immediately above the `getCachedUserOrgIds` call.

- [ ] **Step 1: Update dashboard/page.tsx**

`dashboard/page.tsx` currently extracts no `userId`. The current code (lines 128–129):
```ts
const rawOrgIds = await getUserOrganizationIds(payload, user)
const organizationIds = rawOrgIds.map(Number)
```

Replace with:
```ts
const userId = typeof user.id === 'number' ? user.id : Number(user.id)
const organizationIds = await getCachedUserOrgIds(userId)
```

Remove the `getUserOrganizationIds` import. Add `getCachedUserOrgIds` to the `@/lib/cached-queries` import.

- [ ] **Step 2: Update events/page.tsx**

Lines 35–36:
```ts
const rawOrgIds = await getUserOrganizationIds(payload, user)
const organizationIds = rawOrgIds.map(Number)
```
Replace with:
```ts
const organizationIds = await getCachedUserOrgIds(userId)
```
(`userId` is already extracted on the next line — move the extraction up above this call.)

Remove `getUserOrganizationIds` import, add `getCachedUserOrgIds` to cached-queries import.

- [ ] **Step 3: Update events/[id]/page.tsx**

Same pattern — find:
```ts
const rawOrgIds = await getUserOrganizationIds(payload, user)
const organizationIds = rawOrgIds.map(Number)
```
Ensure `userId` is extracted before this call, then replace with:
```ts
const organizationIds = await getCachedUserOrgIds(userId)
```

Remove `getUserOrganizationIds` import, add `getCachedUserOrgIds` to cached-queries import.

- [ ] **Step 4: Update participants/page.tsx**

Same pattern. Remove `getUserOrganizationIds` import, add `getCachedUserOrgIds`.

- [ ] **Step 5: Update participants/[id]/page.tsx**

Same pattern. Remove `getUserOrganizationIds` import, add `getCachedUserOrgIds`.

- [ ] **Step 6: Update partners/page.tsx**

Same pattern. Remove `getUserOrganizationIds` import, add `getCachedUserOrgIds`.

- [ ] **Step 7: Update partners/[id]/page.tsx**

Same pattern. Remove `getUserOrganizationIds` import, add `getCachedUserOrgIds`.

- [ ] **Step 8: Update partner-types/page.tsx**

Same pattern. Remove `getUserOrganizationIds` import, add `getCachedUserOrgIds`.

- [ ] **Step 9: Update participant-roles/page.tsx**

Same pattern. Remove `getUserOrganizationIds` import, add `getCachedUserOrgIds`.

- [ ] **Step 10: Verify TypeScript across all changed files**

```bash
cd /Users/gunnarsaliev/Documents/projects/prevema && pnpm tsc --noEmit 2>&1 | head -60
```

Expected: zero errors. Fix any remaining type issues (usually just missing `userId` extraction).

- [ ] **Step 11: Confirm no remaining raw calls**

```bash
grep -rn "getUserOrganizationIds" /Users/gunnarsaliev/Documents/projects/prevema/src/app/\(frontend\)/dashboard/
```

Expected: no output (zero matches).

- [ ] **Step 12: Commit**

```bash
git add \
  src/app/\(frontend\)/dashboard/page.tsx \
  src/app/\(frontend\)/dashboard/events/page.tsx \
  "src/app/(frontend)/dashboard/events/[id]/page.tsx" \
  src/app/\(frontend\)/dashboard/participants/page.tsx \
  "src/app/(frontend)/dashboard/participants/[id]/page.tsx" \
  src/app/\(frontend\)/dashboard/partners/page.tsx \
  "src/app/(frontend)/dashboard/partners/[id]/page.tsx" \
  src/app/\(frontend\)/dashboard/partner-types/page.tsx \
  src/app/\(frontend\)/dashboard/participant-roles/page.tsx
git commit -m "feat: replace getUserOrganizationIds with getCachedUserOrgIds across dashboard pages"
```

---

### Task 7: Final verification

- [ ] **Step 1: Full TypeScript check**

```bash
cd /Users/gunnarsaliev/Documents/projects/prevema && pnpm tsc --noEmit 2>&1
```

Expected: no errors.

- [ ] **Step 2: Build check**

```bash
cd /Users/gunnarsaliev/Documents/projects/prevema && pnpm build 2>&1 | tail -30
```

Expected: build completes successfully with no type or compilation errors.

- [ ] **Step 3: Smoke test navigation**

Start the dev server (`pnpm dev`) and visit each route in order. Verify:
- `/dashboard` — correct active icon (Overview)
- `/dashboard/events` — Events icon active
- `/dashboard/participants` — Participants icon active
- `/dashboard/participant-roles` — Roles icon active
- `/dashboard/partners` — Partners icon active
- `/dashboard/partner-types` — Types icon active
- On mobile viewport — bottom nav shows correct active tab on each route

- [ ] **Step 4: Verify no stray getUserOrganizationIds calls in dashboard**

```bash
grep -rn "getUserOrganizationIds" /Users/gunnarsaliev/Documents/projects/prevema/src/app/\(frontend\)/dashboard/
```

Expected: no output.
