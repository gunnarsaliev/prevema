# Dashboard Navigation & Caching — Design Spec

**Date:** 2026-04-27
**Status:** Approved

---

## Context

The dashboard uses a Discord-style icon-rail sidebar (`AppSidebar`) inside `ApplicationShell`. Two problems need fixing:

1. **Active-state logic is duplicated.** Both `client-layout.tsx` and `app-sidebar.tsx` independently compute `activeModuleId` via `useMemo` + `usePathname`. The value computed in `client-layout.tsx` is passed as a prop but then ignored — `AppSidebar` recomputes it from `pathname` anyway. The `onModuleChange` callback is a no-op `() => {}` throughout.

2. **`getUserOrganizationIds` is uncached.** Every dashboard page (layout, events, participants, partners, etc.) calls this function directly, which issues a raw Payload DB query on every request with no caching. The layout already uses `getCachedLayoutData` for permissions, but org ID resolution bypasses the cache entirely.

---

## Design

### 1. Remove duplicated active-state computation

**`client-layout.tsx`:** Remove the `useMemo`/`usePathname` block that computes `activeModuleId`. Remove `usePathname` import. Pass a static placeholder (empty string `''`) or remove the prop entirely if `AppSidebar` ignores it in favour of its own derived value.

**`app-sidebar.tsx`:** Already derives active state from `usePathname` internally — no change needed. Remove `onClick={() => onModuleChange(module.id)}` from `<Link>` elements since navigation is handled by the link itself and active state is derived from `pathname`, not from callback state.

**`application-shell.tsx` / `MobileBottomNav`:** Same — remove `onClick` calls on `<Link>` elements in `MobileBottomNav`. The `onModuleChange` prop can remain on `ApplicationShellProps` for future use but callers no longer need to wire it.

### 2. Cache `getUserOrganizationIds`

**`src/lib/cached-queries.ts`:** Add a new exported function:

```ts
export const getCachedUserOrgIds = cache(
  async (userId: number, payload: Payload): Promise<number[]> => {
    return unstable_cache(
      async () => {
        const ids = await getUserOrganizationIds(payload, { id: userId } as User)
        return ids.map(Number)
      },
      ['user-orgs', String(userId)],
      { tags: [`user-${userId}-orgs`], revalidate: 60 },
    )()
  },
)
```

**`src/app/(frontend)/dashboard/layout.tsx`:** Replace:
```ts
const rawOrgIds = await getUserOrganizationIds(payload, user)
const organizationIds = rawOrgIds.map(Number)
```
With:
```ts
const organizationIds = await getCachedUserOrgIds(userId, payload)
```
(Move `userId` extraction above this call.)

**All dashboard `page.tsx` files** that call `getUserOrganizationIds` directly: replace with `getCachedUserOrgIds(userId, payload)`. Affected pages: `dashboard/page.tsx`, `dashboard/events/page.tsx`, `dashboard/participants/page.tsx`, `dashboard/partners/page.tsx`, and any other pages that call it.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/cached-queries.ts` | Add `getCachedUserOrgIds` |
| `src/app/(frontend)/dashboard/layout.tsx` | Use `getCachedUserOrgIds` |
| `src/app/(frontend)/dashboard/client-layout.tsx` | Remove `useMemo`/`usePathname` active-state block |
| `src/app/(frontend)/dashboard/page.tsx` | Use `getCachedUserOrgIds` |
| `src/app/(frontend)/dashboard/events/page.tsx` | Use `getCachedUserOrgIds` |
| `src/app/(frontend)/dashboard/participants/page.tsx` | Use `getCachedUserOrgIds` |
| `src/app/(frontend)/dashboard/partners/page.tsx` | Use `getCachedUserOrgIds` |
| `src/components/layout/application-shell/app-sidebar.tsx` | Remove `onClick` from `<Link>` elements |
| `src/components/layout/application-shell/application-shell.tsx` | Remove `onClick` from `<Link>` elements in `MobileBottomNav` |

---

## What We Are NOT Doing

- Not switching to `DubSidebarLayout`
- Not adding `prefetch` attributes (Next.js defaults handle this)
- Not caching permission/role checks
- Not refactoring the Auth provider client-side fetch
- No new routes or UI changes

---

## Verification

1. `pnpm build` — zero TypeScript errors
2. Visit `/dashboard` — correct active icon, no console errors
3. Navigate between all 6 sections — active icon updates correctly on each
4. Network tab — repeated navigation to same section does not trigger new DB queries for org IDs
5. Hard refresh on any dashboard page — page loads with correct active state
