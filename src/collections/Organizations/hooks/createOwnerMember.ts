import type { CollectionAfterChangeHook } from 'payload'

/**
 * Hook to automatically create an owner member when an organization is created
 */
export const createOwnerMember: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}) => {
  console.log(`🪝 createOwnerMember hook fired - operation: ${operation}, doc.id: ${doc.id}`)

  // Only run on organization creation
  if (operation !== 'create') {
    console.log(`⏭️  Skipping member creation - operation is ${operation}`)
    return doc
  }

  const { user, payload } = req

  if (!user) {
    console.error('❌ No user found when creating organization owner member')
    return doc
  }

  const ownerId = typeof doc.owner === 'object' ? doc.owner.id : doc.owner

  if (!ownerId) {
    console.error('❌ No owner found on organization')
    return doc
  }

  console.log(`👤 Creating owner membership for user ${ownerId} in organization ${doc.id}`)

  try {
    await payload.create({
      collection: 'members',
      data: {
        user: ownerId,
        organization: doc.id,
        role: 'owner',
        status: 'active',
      },
      overrideAccess: true,
      context: {
        isInitialOwner: true,
      },
    })

    console.log(`✅ Created owner membership for organization ${doc.id}`)
  } catch (error) {
    console.error('❌ Failed to create owner membership:', error)
    // Don't throw - organization creation should still succeed
  }

  return doc
}
