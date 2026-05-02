# Dash Breadcrumb Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the demo `breadcrumb-home-icon-2.tsx` with a reusable `DashBreadcrumb` component and add it to every page under `src/app/(frontend)/tw/dash/`.

**Architecture:** A single `DashBreadcrumb` component accepts an `items` prop and renders a shadcn Breadcrumb with a Home icon always first. Each page passes its own static/dynamic labels — no layout-level breadcrumb needed because pages own their dynamic data.

**Tech Stack:** Next.js 15 (App Router), React, shadcn `@/components/ui/breadcrumb`, lucide-react, Vitest + jsdom for unit tests.

---

## File map

| Action | Path |
|---|---|
| Delete | `src/components/breadcrumb-home-icon-2.tsx` |
| Create | `src/components/dash-breadcrumb.tsx` |
| Create | `tests/int/components/dash-breadcrumb.int.spec.ts` |
| Modify | `src/app/(frontend)/tw/dash/page.tsx` |
| Modify | `src/app/(frontend)/tw/dash/events/page.tsx` |
| Modify | `src/app/(frontend)/tw/dash/events/create/page.tsx` |
| Modify | `src/app/(frontend)/tw/dash/events/[id]/page.tsx` |
| Modify | `src/app/(frontend)/tw/dash/events/[id]/edit/page.tsx` |
| Modify | `src/app/(frontend)/tw/dash/events/[id]/participants/page.tsx` |
| Modify | `src/app/(frontend)/tw/dash/events/[id]/participants/[participantId]/page.tsx` |
| Modify | `src/app/(frontend)/tw/dash/events/[id]/partners/page.tsx` |
| Modify | `src/app/(frontend)/tw/dash/events/[id]/partners/[partnerId]/page.tsx` |
| Modify | `src/app/(frontend)/tw/dash/participants/page.tsx` |
| Modify | `src/app/(frontend)/tw/dash/participants/create/page.tsx` |
| Modify | `src/app/(frontend)/tw/dash/participants/[id]/page.tsx` |
| Modify | `src/app/(frontend)/tw/dash/participants/[id]/edit/page.tsx` |
| Modify | `src/app/(frontend)/tw/dash/partners/page.tsx` |
| Modify | `src/app/(frontend)/tw/dash/partners/create/page.tsx` |
| Modify | `src/app/(frontend)/tw/dash/partners/[id]/page.tsx` |
| Modify | `src/app/(frontend)/tw/dash/partners/[id]/edit/page.tsx` |

---

### Task 1: Create `DashBreadcrumb` component and its tests

**Files:**
- Delete: `src/components/breadcrumb-home-icon-2.tsx`
- Create: `src/components/dash-breadcrumb.tsx`
- Create: `tests/int/components/dash-breadcrumb.int.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/int/components/dash-breadcrumb.int.spec.ts`:

```ts
import { render, screen } from '@testing-library/react'
import { DashBreadcrumb } from '@/components/dash-breadcrumb'

describe('DashBreadcrumb', () => {
  it('renders the home link', () => {
    render(<DashBreadcrumb items={[]} />)
    const homeLink = screen.getByRole('link', { name: /home/i })
    expect(homeLink).toHaveAttribute('href', '/tw/dash')
  })

  it('renders a linked item', () => {
    render(<DashBreadcrumb items={[{ label: 'Events', href: '/tw/dash/events' }]} />)
    const link = screen.getByRole('link', { name: 'Events' })
    expect(link).toHaveAttribute('href', '/tw/dash/events')
  })

  it('renders the last item without a link', () => {
    render(
      <DashBreadcrumb
        items={[
          { label: 'Events', href: '/tw/dash/events' },
          { label: 'My Event' },
        ]}
      />,
    )
    expect(screen.getByText('My Event').tagName).not.toBe('A')
    expect(screen.queryByRole('link', { name: 'My Event' })).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /path/to/project && pnpm run test:int -- --reporter=verbose 2>&1 | grep -A 5 "dash-breadcrumb"
```

Expected: tests fail because `@/components/dash-breadcrumb` does not exist.

- [ ] **Step 3: Create the component**

Create `src/components/dash-breadcrumb.tsx`:

```tsx
import { Home } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

type Item = { label: string; href?: string }

export function DashBreadcrumb({ items }: { items: Item[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/tw/dash" aria-label="Home">
            <Home className="size-4" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <span key={item.label} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {!isLast && item.href ? (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </span>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
pnpm run test:int -- --reporter=verbose 2>&1 | grep -A 5 "dash-breadcrumb"
```

Expected: 3 tests pass.

- [ ] **Step 5: Delete the old demo file**

```bash
rm src/components/breadcrumb-home-icon-2.tsx
```

- [ ] **Step 6: Commit**

```bash
git add src/components/dash-breadcrumb.tsx tests/int/components/dash-breadcrumb.int.spec.ts
git rm src/components/breadcrumb-home-icon-2.tsx
git commit -m "feat: add DashBreadcrumb component"
```

---

### Task 2: Add breadcrumb to top-level dash page

**Files:**
- Modify: `src/app/(frontend)/tw/dash/page.tsx`

- [ ] **Step 1: Add `DashBreadcrumb` to the home page**

The home page (`/tw/dash`) has no sub-path, so `items` is empty — only the Home icon shows.

Replace the contents of `src/app/(frontend)/tw/dash/page.tsx`:

```tsx
import { Stat } from '../stat'
import { Heading, Subheading } from '@/components/catalyst/heading'
import { Select } from '@/components/catalyst/select'
import { DashBreadcrumb } from '@/components/dash-breadcrumb'

export default async function Home() {
  return (
    <>
      <DashBreadcrumb items={[]} />
      <Heading>Good afternoon, Erica</Heading>
      <div className="mt-8 flex items-end justify-between">
        <Subheading>Overview</Subheading>
        <div>
          <Select name="period">
            <option value="last_week">Last week</option>
            <option value="last_two">Last two weeks</option>
            <option value="last_month">Last month</option>
            <option value="last_quarter">Last quarter</option>
          </Select>
        </div>
      </div>
      <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Total revenue" value="$2.6M" change="+4.5%" />
        <Stat title="Average order value" value="$455" change="-0.5%" />
        <Stat title="Tickets sold" value="5,888" change="+4.5%" />
        <Stat title="Pageviews" value="823,067" change="+21.2%" />
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(frontend\)/tw/dash/page.tsx
git commit -m "feat: add breadcrumb to dash home page"
```

---

### Task 3: Add breadcrumb to events pages

**Files:**
- Modify: `src/app/(frontend)/tw/dash/events/page.tsx`
- Modify: `src/app/(frontend)/tw/dash/events/create/page.tsx`
- Modify: `src/app/(frontend)/tw/dash/events/[id]/page.tsx`
- Modify: `src/app/(frontend)/tw/dash/events/[id]/edit/page.tsx`

- [ ] **Step 1: Update events list page**

In `src/app/(frontend)/tw/dash/events/page.tsx`, add the import at the top:

```tsx
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
```

Add `<DashBreadcrumb items={[{ label: 'Events' }]} />` as the first child inside the outer fragment of the `Events` function, before the existing `<div className="flex flex-wrap ...">`:

```tsx
  return (
    <>
      <DashBreadcrumb items={[{ label: 'Events' }]} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        {/* ... rest unchanged ... */}
      </div>
      {/* ... rest unchanged ... */}
    </>
  )
```

- [ ] **Step 2: Update events create page**

In `src/app/(frontend)/tw/dash/events/create/page.tsx`, add the import:

```tsx
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
```

Wrap the existing `<div className="px-8 py-8">` with a fragment and add the breadcrumb above it:

```tsx
  return (
    <>
      <DashBreadcrumb items={[{ label: 'Events', href: '/tw/dash/events' }, { label: 'Create' }]} />
      <div className="px-8 py-8">
        <EventForm organizations={organizations} />
      </div>
    </>
  )
```

- [ ] **Step 3: Update event detail page**

In `src/app/(frontend)/tw/dash/events/[id]/page.tsx`, add the import:

```tsx
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
```

Add the breadcrumb as the first element inside the outer fragment, using `event.name` for the label (already fetched for `generateMetadata`):

```tsx
  return (
    <>
      <DashBreadcrumb
        items={[
          { label: 'Events', href: '/tw/dash/events' },
          { label: event.name },
        ]}
      />
      <div className="max-lg:hidden">
        {/* ... rest unchanged ... */}
      </div>
      {/* ... rest unchanged ... */}
    </>
  )
```

- [ ] **Step 4: Update event edit page**

In `src/app/(frontend)/tw/dash/events/[id]/edit/page.tsx`, add the import:

```tsx
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
```

The page already fetches the event with `event.name` available. Wrap the return with a fragment and prepend the breadcrumb. The edit page's event name comes from `event.name` (the `event` variable fetched via `payload.findByID`):

```tsx
  return (
    <>
      <DashBreadcrumb
        items={[
          { label: 'Events', href: '/tw/dash/events' },
          { label: event.name, href: `/tw/dash/events/${id}` },
          { label: 'Edit' },
        ]}
      />
      <div className="px-8 py-8">
        <EventForm
          mode="edit"
          eventId={id}
          defaultValues={defaultValues}
          existingImageUrl={imageUrl}
        />
      </div>
    </>
  )
```

- [ ] **Step 5: Commit**

```bash
git add \
  src/app/\(frontend\)/tw/dash/events/page.tsx \
  src/app/\(frontend\)/tw/dash/events/create/page.tsx \
  src/app/\(frontend\)/tw/dash/events/\[id\]/page.tsx \
  src/app/\(frontend\)/tw/dash/events/\[id\]/edit/page.tsx
git commit -m "feat: add breadcrumbs to events pages"
```

---

### Task 4: Add breadcrumb to event sub-pages (participants & partners inside events)

**Files:**
- Modify: `src/app/(frontend)/tw/dash/events/[id]/participants/page.tsx`
- Modify: `src/app/(frontend)/tw/dash/events/[id]/participants/[participantId]/page.tsx`
- Modify: `src/app/(frontend)/tw/dash/events/[id]/partners/page.tsx`
- Modify: `src/app/(frontend)/tw/dash/events/[id]/partners/[partnerId]/page.tsx`

These pages need the event name to build the breadcrumb. The event participants/partners pages don't currently fetch the event name — add a minimal fetch for it.

- [ ] **Step 1: Update event participants list page**

In `src/app/(frontend)/tw/dash/events/[id]/participants/page.tsx`, add these imports:

```tsx
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
import { getTwDashEvent } from '../../data'
```

After the auth/userId/organizationIds block, fetch the event name:

```tsx
  const rawEvent = await getTwDashEvent(id, userId)
  const eventName = rawEvent?.name ?? id
```

Then prepend the breadcrumb:

```tsx
  return (
    <>
      <DashBreadcrumb
        items={[
          { label: 'Events', href: '/tw/dash/events' },
          { label: eventName, href: `/tw/dash/events/${id}` },
          { label: 'Participants' },
        ]}
      />
      <div className="max-lg:hidden">
        {/* ... rest unchanged ... */}
      </div>
      {/* ... rest unchanged ... */}
    </>
  )
```

- [ ] **Step 2: Update event participant detail page**

In `src/app/(frontend)/tw/dash/events/[id]/participants/[participantId]/page.tsx`, add these imports:

```tsx
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
import { getTwDashEvent } from '../../../data'
```

After the auth/userId/organizationIds block, fetch both the event name and participant name:

```tsx
  const rawEvent = await getTwDashEvent(id, userId)
  const eventName = rawEvent?.name ?? id
  const participant = await getTwDashParticipant(participantId, userId)
  const participantName = participant?.name ?? participantId
```

Note: `getTwDashParticipant` is already imported (used by `generateMetadata`). Then add the breadcrumb as the first element inside the `Suspense`'s wrapping fragment:

```tsx
  return (
    <>
      <DashBreadcrumb
        items={[
          { label: 'Events', href: '/tw/dash/events' },
          { label: eventName, href: `/tw/dash/events/${id}` },
          { label: 'Participants', href: `/tw/dash/events/${id}/participants` },
          { label: participantName },
        ]}
      />
      <Suspense fallback={<ParticipantDetailSkeleton />}>
        <ParticipantDetail
          participantId={participantId}
          userId={userId}
          backHref={`/tw/dash/events/${id}/participants`}
          backLabel="Participants"
        />
      </Suspense>
    </>
  )
```

- [ ] **Step 3: Update event partners list page**

In `src/app/(frontend)/tw/dash/events/[id]/partners/page.tsx`, add these imports:

```tsx
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
import { getTwDashEvent } from '../../data'
```

After the auth/userId/organizationIds block:

```tsx
  const rawEvent = await getTwDashEvent(id, userId)
  const eventName = rawEvent?.name ?? id
```

Then prepend the breadcrumb:

```tsx
  return (
    <>
      <DashBreadcrumb
        items={[
          { label: 'Events', href: '/tw/dash/events' },
          { label: eventName, href: `/tw/dash/events/${id}` },
          { label: 'Partners' },
        ]}
      />
      <div className="max-lg:hidden">
        {/* ... rest unchanged ... */}
      </div>
      {/* ... rest unchanged ... */}
    </>
  )
```

- [ ] **Step 4: Update event partner detail page**

In `src/app/(frontend)/tw/dash/events/[id]/partners/[partnerId]/page.tsx`, add these imports:

```tsx
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
import { getTwDashEvent } from '../../../data'
```

After the auth/userId/organizationIds block:

```tsx
  const rawEvent = await getTwDashEvent(id, userId)
  const eventName = rawEvent?.name ?? id
  const partner = await getTwDashPartner(partnerId, userId)
  const partnerName = partner?.companyName ?? partnerId
```

Note: `getTwDashPartner` is already imported (used by `generateMetadata`). The `partnerId` param needs to be destructured from params alongside `id`:

```tsx
  const { id, partnerId } = await params
```

Then:

```tsx
  return (
    <>
      <DashBreadcrumb
        items={[
          { label: 'Events', href: '/tw/dash/events' },
          { label: eventName, href: `/tw/dash/events/${id}` },
          { label: 'Partners', href: `/tw/dash/events/${id}/partners` },
          { label: partnerName },
        ]}
      />
      <Suspense fallback={<PartnerDetailSkeleton />}>
        <PartnerDetail
          partnerId={partnerId}
          userId={userId}
          backHref={`/tw/dash/events/${id}/partners`}
          backLabel="Partners"
        />
      </Suspense>
    </>
  )
```

- [ ] **Step 5: Commit**

```bash
git add \
  src/app/\(frontend\)/tw/dash/events/\[id\]/participants/page.tsx \
  src/app/\(frontend\)/tw/dash/events/\[id\]/participants/\[participantId\]/page.tsx \
  src/app/\(frontend\)/tw/dash/events/\[id\]/partners/page.tsx \
  src/app/\(frontend\)/tw/dash/events/\[id\]/partners/\[partnerId\]/page.tsx
git commit -m "feat: add breadcrumbs to event sub-pages"
```

---

### Task 5: Add breadcrumb to standalone participants pages

**Files:**
- Modify: `src/app/(frontend)/tw/dash/participants/page.tsx`
- Modify: `src/app/(frontend)/tw/dash/participants/create/page.tsx`
- Modify: `src/app/(frontend)/tw/dash/participants/[id]/page.tsx`
- Modify: `src/app/(frontend)/tw/dash/participants/[id]/edit/page.tsx`

- [ ] **Step 1: Update participants list page**

In `src/app/(frontend)/tw/dash/participants/page.tsx`, add the import:

```tsx
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
```

Prepend the breadcrumb:

```tsx
  return (
    <>
      <DashBreadcrumb items={[{ label: 'Participants' }]} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        {/* ... rest unchanged ... */}
      </div>
      {/* ... rest unchanged ... */}
    </>
  )
```

- [ ] **Step 2: Update participants create page**

In `src/app/(frontend)/tw/dash/participants/create/page.tsx`, add the import:

```tsx
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
```

Wrap and prepend:

```tsx
  return (
    <>
      <DashBreadcrumb
        items={[{ label: 'Participants', href: '/tw/dash/participants' }, { label: 'Create' }]}
      />
      <div className="px-8 py-8">
        {/* ... existing content unchanged ... */}
      </div>
    </>
  )
```

- [ ] **Step 3: Update participant detail page**

In `src/app/(frontend)/tw/dash/participants/[id]/page.tsx`, add the import:

```tsx
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
```

The participant name is already fetched for `generateMetadata` via `getTwDashParticipant`. Fetch it in the page body too and use it:

```tsx
  const participant = await getTwDashParticipant(id, userId)
  const participantName = participant?.name ?? id
```

Then:

```tsx
  return (
    <>
      <DashBreadcrumb
        items={[
          { label: 'Participants', href: '/tw/dash/participants' },
          { label: participantName },
        ]}
      />
      <Suspense fallback={<ParticipantDetailSkeleton />}>
        <ParticipantDetail
          participantId={id}
          userId={userId}
          backHref="/tw/dash/participants"
          backLabel="Participants"
        />
      </Suspense>
    </>
  )
```

- [ ] **Step 4: Update participant edit page**

In `src/app/(frontend)/tw/dash/participants/[id]/edit/page.tsx`, add the import:

```tsx
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
```

The `participant.name` is already available after the `findByID` call. Wrap and prepend:

```tsx
  return (
    <>
      <DashBreadcrumb
        items={[
          { label: 'Participants', href: '/tw/dash/participants' },
          { label: participant.name, href: `/tw/dash/participants/${id}` },
          { label: 'Edit' },
        ]}
      />
      <div className="px-8 py-8">
        <ParticipantForm
          mode="edit"
          participantId={id}
          eventId={eventId}
          eventName={eventName}
          participantRoles={participantRoles.map((r) => ({ id: r.id, name: r.name }))}
          defaultValues={defaultValues}
          existingPhotoUrl={existingPhotoUrl}
        />
      </div>
    </>
  )
```

- [ ] **Step 5: Commit**

```bash
git add \
  src/app/\(frontend\)/tw/dash/participants/page.tsx \
  src/app/\(frontend\)/tw/dash/participants/create/page.tsx \
  src/app/\(frontend\)/tw/dash/participants/\[id\]/page.tsx \
  src/app/\(frontend\)/tw/dash/participants/\[id\]/edit/page.tsx
git commit -m "feat: add breadcrumbs to participants pages"
```

---

### Task 6: Add breadcrumb to standalone partners pages

**Files:**
- Modify: `src/app/(frontend)/tw/dash/partners/page.tsx`
- Modify: `src/app/(frontend)/tw/dash/partners/create/page.tsx`
- Modify: `src/app/(frontend)/tw/dash/partners/[id]/page.tsx`
- Modify: `src/app/(frontend)/tw/dash/partners/[id]/edit/page.tsx`

- [ ] **Step 1: Update partners list page**

In `src/app/(frontend)/tw/dash/partners/page.tsx`, add the import:

```tsx
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
```

Prepend the breadcrumb:

```tsx
  return (
    <>
      <DashBreadcrumb items={[{ label: 'Partners' }]} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        {/* ... rest unchanged ... */}
      </div>
      {/* ... rest unchanged ... */}
    </>
  )
```

- [ ] **Step 2: Update partners create page**

In `src/app/(frontend)/tw/dash/partners/create/page.tsx`, add the import:

```tsx
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
```

Wrap and prepend:

```tsx
  return (
    <>
      <DashBreadcrumb
        items={[{ label: 'Partners', href: '/tw/dash/partners' }, { label: 'Create' }]}
      />
      <div className="px-8 py-8">
        {/* ... existing content unchanged ... */}
      </div>
    </>
  )
```

- [ ] **Step 3: Update partner detail page**

In `src/app/(frontend)/tw/dash/partners/[id]/page.tsx`, add the import:

```tsx
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
```

Fetch the partner name for use in the breadcrumb (same pattern as participant detail):

```tsx
  const partner = await getTwDashPartner(id, userId)
  const partnerName = partner?.companyName ?? id
```

Then:

```tsx
  return (
    <>
      <DashBreadcrumb
        items={[
          { label: 'Partners', href: '/tw/dash/partners' },
          { label: partnerName },
        ]}
      />
      <Suspense fallback={<PartnerDetailSkeleton />}>
        <PartnerDetail
          partnerId={id}
          userId={userId}
          backHref="/tw/dash/partners"
          backLabel="Partners"
        />
      </Suspense>
    </>
  )
```

- [ ] **Step 4: Update partner edit page**

In `src/app/(frontend)/tw/dash/partners/[id]/edit/page.tsx`, add the import:

```tsx
import { DashBreadcrumb } from '@/components/dash-breadcrumb'
```

The `partner.companyName` is already available after the `findByID` call. Wrap and prepend:

```tsx
  return (
    <>
      <DashBreadcrumb
        items={[
          { label: 'Partners', href: '/tw/dash/partners' },
          { label: partner.companyName, href: `/tw/dash/partners/${id}` },
          { label: 'Edit' },
        ]}
      />
      <div className="px-8 py-8">
        <PartnerForm
          mode="edit"
          partnerId={id}
          eventId={eventId}
          eventName={eventName}
          partnerTypes={partnerTypes.map((t) => ({ id: t.id, name: t.name }))}
          tiers={tiers.map((t) => ({ id: t.id, name: t.name }))}
          defaultValues={defaultValues}
          existingLogoUrl={existingLogoUrl}
        />
      </div>
    </>
  )
```

- [ ] **Step 5: Commit**

```bash
git add \
  src/app/\(frontend\)/tw/dash/partners/page.tsx \
  src/app/\(frontend\)/tw/dash/partners/create/page.tsx \
  src/app/\(frontend\)/tw/dash/partners/\[id\]/page.tsx \
  src/app/\(frontend\)/tw/dash/partners/\[id\]/edit/page.tsx
git commit -m "feat: add breadcrumbs to partners pages"
```

---

### Task 7: Verify TypeScript and tests

- [ ] **Step 1: Run type check**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Run unit tests**

```bash
pnpm run test:int
```

Expected: all tests pass including the 3 new `dash-breadcrumb` tests.

- [ ] **Step 3: If type errors exist, fix them**

Common issues:
- `getTwDashEvent` / `getTwDashParticipant` / `getTwDashPartner` return types — `?.name` and `?.companyName` are already used in `generateMetadata` so the types are known.
- Params destructuring in `[partnerId]` pages — ensure both `id` and `partnerId` are destructured from the same `await params`.
