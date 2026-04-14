# Events Caching Strategy

This document explains the comprehensive caching strategy implemented for the events pages, following Next.js best practices.

## Overview

We use a **two-tier caching strategy** that combines:

1. **React `cache()`** - Request-level deduplication
2. **Next.js `unstable_cache()`** - Persistent cross-request caching

## Architecture

### Data Access Layer (`data.ts`)

The data access layer provides cached functions for fetching events data:

```typescript
import { cache } from 'react'
import { unstable_cache } from 'next/cache'

export const getEvents = cache(async (userId, organizationIds) => {
  const cachedFetch = unstable_cache(
    async () => fetchEventsFromDB(organizationIds),
    ['events-list', userId.toString(), cacheKey],
    {
      revalidate: 30,      // Auto-revalidate after 30 seconds
      tags: orgEventsTag   // Tag-based invalidation
    }
  )
  return cachedFetch()
})
```

## Caching Layers Explained

### Layer 1: React `cache()` - Request Deduplication

**Purpose**: Prevents duplicate database queries within a single request/render pass

**How it works**:
- If `getEvents()` is called multiple times in the same request (e.g., in metadata generation and page rendering), React ensures the database query only executes once
- Cache is scoped to a single server request
- Automatically cleared after the request completes

**Benefits**:
- Eliminates redundant database calls in the same request
- Improves performance when sharing data between components
- Zero configuration needed

### Layer 2: Next.js `unstable_cache()` - Persistent Caching

**Purpose**: Caches data across multiple requests to reduce database load

**How it works**:
- Stores query results in Next.js data cache
- Cache persists across multiple user requests
- Automatically revalidates based on configured strategies

**Configuration**:
```typescript
{
  revalidate: 30,  // Time-based: refresh every 30 seconds
  tags: ['org-123-events']  // Tag-based: invalidate on-demand
}
```

## Cache Invalidation

### Time-Based Revalidation

- Events list: Revalidates every **30 seconds**
- Individual events: Revalidates every **60 seconds**
- Ensures data freshness while reducing database load

### Tag-Based Revalidation (On-Demand)

When events are created or updated, we invalidate relevant caches:

```typescript
// In actions.ts - after creating/updating an event
revalidateTag(orgEventsTag(organizationId))
```

**Cache tags used**:
- `org-{id}-events` - All events for an organization
- `event-{id}` - Specific event data

## Prefetching Strategy

### Dashboard Prefetching

When users view the dashboard, we prefetch events data to warm the cache:

```typescript
// In dashboard page.tsx
getEvents(userId, organizationIds).catch(() => {
  // Silently fail - optimization only
})
```

**Benefits**:
- Events page loads instantly from cache when user navigates
- Prefetch happens in background, doesn't block dashboard rendering
- Uses React `cache()` so if events are also rendered on dashboard, query runs only once

## Client-Side Optimizations

### Lazy Loading

Search component is lazy-loaded to reduce initial bundle size:

```typescript
const EventsSearchBar = lazy(() => import('./EventsSearchBar'))
```

### Memoization

Event filtering is memoized to prevent unnecessary recalculations:

```typescript
const filteredEvents = useMemo(
  () => events.filter(event => ...),
  [events, searchQuery]
)
```

## Performance Characteristics

### Cold Cache (First Visit)
1. Database query executes
2. Result cached with 30s TTL
3. Page renders with data

### Warm Cache (Return Visit within 30s)
1. Data served from cache (near-instant)
2. No database query
3. Page renders immediately

### Cache Invalidation (After Mutation)
1. User creates/updates event
2. `revalidateTag()` invalidates relevant cache
3. Next request fetches fresh data
4. New data cached for 30s

### Prefetched (From Dashboard)
1. Dashboard prefetches events
2. Cache warmed in background
3. Navigation to events page instant (served from cache)

## Cache Keys Structure

Cache keys include user and organization context for proper scoping:

```typescript
['events-list', userId, 'org1,org2,org3']
['event', eventId, userId]
```

This ensures:
- Different users see their own cached data
- Cache properly scoped by organization membership
- No cache leakage between users

## Monitoring Cache Behavior

To verify caching is working:

1. **Check Response Times**: Initial load vs subsequent loads
2. **Database Logs**: Count queries before/after caching
3. **Network Tab**: See if React Server Component payloads are cached

## Best Practices Applied

✅ **Request Deduplication**: React `cache()` prevents duplicate queries
✅ **Persistent Caching**: `unstable_cache()` reduces database load
✅ **Cache Scoping**: Keys include user/org IDs for security
✅ **Tag-Based Invalidation**: Granular cache updates on mutations
✅ **Time-Based Revalidation**: Automatic freshness guarantees
✅ **Prefetching**: Warm cache for better UX
✅ **Lazy Loading**: Reduce initial bundle size

## References

- [Next.js Caching Documentation](https://nextjs.org/docs/app/building-your-application/caching)
- [React cache() API](https://react.dev/reference/react/cache)
- [Next.js unstable_cache()](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)
- [Next.js revalidateTag()](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
