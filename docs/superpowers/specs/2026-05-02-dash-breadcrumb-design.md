# Dash Breadcrumb Design

## Overview

Replace the demo component `src/components/breadcrumb-home-icon-2.tsx` with a reusable `DashBreadcrumb` component and add it to every page under `src/app/(frontend)/tw/dash/`.

## Component

**File:** `src/components/dash-breadcrumb.tsx` (renamed from `breadcrumb-home-icon-2.tsx`)

**Export:** `DashBreadcrumb` (named export, no default)

**Props:**
```ts
items: { label: string; href?: string }[]
```

**Behaviour:**
- Home icon (links to `/tw/dash`) is always the first item
- Each entry in `items` renders as a `BreadcrumbLink` if it has an `href`, or `BreadcrumbPage` if it is the last segment (no `href`)
- Separators are rendered between all items automatically
- Uses the existing shadcn `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator` primitives from `@/components/ui/breadcrumb`
- The middle dropdown slot from the original demo is removed — responsive collapsing is handled natively by the shadcn primitives

## Breadcrumb trails per page

| Route | Trail |
|---|---|
| `/tw/dash` | Home |
| `/tw/dash/events` | Home › Events |
| `/tw/dash/events/create` | Home › Events › Create |
| `/tw/dash/events/[id]` | Home › Events › [Event Name] |
| `/tw/dash/events/[id]/edit` | Home › Events › [Event Name] › Edit |
| `/tw/dash/events/[id]/participants` | Home › Events › [Event Name] › Participants |
| `/tw/dash/events/[id]/participants/[participantId]` | Home › Events › [Event Name] › Participants › [Name] |
| `/tw/dash/events/[id]/partners` | Home › Events › [Event Name] › Partners |
| `/tw/dash/events/[id]/partners/[partnerId]` | Home › Events › [Event Name] › Partners › [Name] |
| `/tw/dash/participants` | Home › Participants |
| `/tw/dash/participants/create` | Home › Participants › Create |
| `/tw/dash/participants/[id]` | Home › Participants › [Name] |
| `/tw/dash/participants/[id]/edit` | Home › Participants › [Name] › Edit |
| `/tw/dash/partners` | Home › Partners |
| `/tw/dash/partners/create` | Home › Partners › Create |
| `/tw/dash/partners/[id]` | Home › Partners › [Name] |
| `/tw/dash/partners/[id]/edit` | Home › Partners › [Name] › Edit |

Dynamic segments (event name, participant name, partner name) are already available in the page components via data fetching — they are passed directly as the `label` string.

## Implementation notes

- The old `breadcrumb-home-icon-2.tsx` file is deleted; `dash-breadcrumb.tsx` replaces it entirely
- No layout-level breadcrumb — each page adds `<DashBreadcrumb items={[...]} />` at the top of its JSX, because each page owns the dynamic label data
- Pages that already fetch the entity name (event, participant, partner) for `generateMetadata` reuse that same value for the breadcrumb label — no extra fetches
- The existing `ChevronLeftIcon` back-links on detail pages are kept as-is alongside the breadcrumb
