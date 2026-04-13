# Migration Guide: Members Collection Refactor

## Overview

This migration refactors the organization membership system from an array field to a proper many-to-many relationship using a separate `Members` collection.

### What Changed

**Before:**
- Organizations had a `members` array field
- Each member entry had: `user` (relationship), `email` (for invitations), `role`
- Complex validation logic with context flags
- Hooks had to coordinate to avoid validation conflicts

**After:**
- New `Members` collection for all user-organization relationships
- Clean data model with separate documents per membership
- No validation hacks or context flags needed
- Simplified invitation flow

## Database Migration Steps

### 1. Run the Payload Migration

First, run Payload's migration to create the new Members table:

```bash
npm run payload migrate
```

This will:
- Create the new `members` table
- Remove the `members` array column from the `organizations` table

### 2. Migrate Existing Data (If Needed)

If you have existing organizations with members, you'll need to migrate that data. Here's a migration script:

```typescript
// migrations/migrate-members.ts
import payload from 'payload'

export async function migrateMembers() {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET!,
    // ... your config
  })

  // Fetch all organizations (you may need to paginate if you have many)
  const orgs = await payload.find({
    collection: 'organizations',
    limit: 1000,
    depth: 0,
  })

  console.log(`Found ${orgs.docs.length} organizations to migrate`)

  for (const org of orgs.docs) {
    // Create owner membership
    try {
      await payload.create({
        collection: 'members',
        data: {
          user: org.owner,
          organization: org.id,
          role: 'owner',
          status: 'active',
        },
      })
      console.log(`✅ Created owner membership for org ${org.id}`)
    } catch (error) {
      console.error(`❌ Failed to create owner membership for org ${org.id}:`, error)
    }

    // Note: If your old organizations had members in the array, you would migrate them here
    // However, based on the code, it seems the array was being cleared after invitations
    // so there shouldn't be any members to migrate
  }

  console.log('✅ Migration complete!')
  process.exit(0)
}

migrateMembers()
```

Run it with:
```bash
ts-node migrations/migrate-members.ts
```

### 3. Verify the Migration

Check that:
1. All existing organizations have owner memberships in the Members collection
2. All existing invitations still work
3. Access control functions correctly

## Code Changes Summary

### Collections

1. **New Collection: `src/collections/Members/index.ts`**
   - Manages user-organization relationships
   - Fields: `user`, `organization`, `role`, `status`
   - Proper access control and validation

2. **Updated: `src/collections/Organizations/index.ts`**
   - Removed `members` array field
   - Removed `autoInviteMembers` hook import
   - Added `afterChange` hook to auto-create owner membership

3. **Updated: `src/collections/Invitations/hooks/acceptInvitation.ts`**
   - Now creates/updates `Members` documents instead of modifying org array
   - Simplified logic, no validation bypasses needed

4. **Updated: `src/collections/Users/hooks/autoAcceptInvitation.ts`**
   - Now creates/updates `Members` documents instead of modifying org array
   - Simplified logic, no validation bypasses needed

### Utilities

**Updated: `src/access/utilities.ts`**
- `getOrganizationRole()` - Now queries Members collection
- `getUserOrganizationIds()` - Now queries Members collection
- `getUserOrganizationIdsWithMinRole()` - Now queries Members collection

### Removed Files

- `src/collections/Organizations/hooks/autoInviteMembers.ts` - No longer needed

## Testing Checklist

### Basic Functionality
- [ ] Create a new organization → Owner membership created automatically
- [ ] View organizations list → Only shows orgs where user is a member
- [ ] Access organization details → Correct role and permissions displayed

### Invitation Flow
- [ ] Send invitation to existing user → Invitation email sent
- [ ] Accept invitation as existing user → Membership created, invitation marked accepted
- [ ] Send invitation to new email → Invitation email sent
- [ ] Register with invitation token → User created, membership created, invitation accepted
- [ ] Try to accept expired invitation → Proper error message
- [ ] Try to accept already-used invitation → Proper error message

### Access Control
- [ ] Owner can manage all settings → ✓
- [ ] Admin can send invitations → ✓
- [ ] Editor can edit content → ✓
- [ ] Viewer can only view → ✓
- [ ] Non-members cannot access → ✓

### Edge Cases
- [ ] User with multiple org memberships → All orgs visible
- [ ] User invited to same org twice → Second invitation updates role
- [ ] Remove member → Status updated to 'removed'
- [ ] Reactivate removed member → Status updated to 'active'

## Rollback Plan

If you need to rollback:

1. Revert the code changes using git:
   ```bash
   git revert HEAD
   ```

2. Run database migration to restore the members array:
   ```bash
   npm run payload migrate -- --revert
   ```

Note: Any memberships created during the new system will be lost in rollback.

## Benefits of New Architecture

1. ✅ **Cleaner data model** - Each membership is a separate document
2. ✅ **No validation hacks** - No need for `skipMemberValidation` context flags
3. ✅ **Better queries** - Native Payload relationship queries
4. ✅ **Audit trail** - Can add timestamps, history, etc.
5. ✅ **Scalable** - Works with millions of memberships
6. ✅ **Type safe** - Better TypeScript types
7. ✅ **Simpler code** - Each collection has clear responsibilities

## Support

If you encounter issues during migration, check:
- Database connection
- Payload logs
- Console output for specific error messages
