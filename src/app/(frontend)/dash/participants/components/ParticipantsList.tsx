'use client'

import { useState, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Pencil, Trash2, Loader2, MoreHorizontal, Mail, Image, Eye } from 'lucide-react'

import type { Participant } from '@/payload-types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createSelectColumn, BulkAction } from '@/components/ui/data-table'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import { EntityList, EntityListConfig } from '@/components/shared/EntityList'
import { handleEntityDelete, handleEntityBulkDelete, getRelationName } from '@/lib/entity-actions'
import { BulkEmailModal } from '@/components/BulkEmailModal'
import { GenerationModal } from '@/components/GenerationModal'
import { StatusSelect } from '@/components/shared/StatusSelect'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { ParticipantRoleForm } from '../../participant-roles/components/ParticipantRoleForm'

const ParticipantQuickView = lazy(() =>
  import('./ParticipantQuickView').then((module) => ({ default: module.ParticipantQuickView })),
)

interface EventOption {
  id: number
  name: string
}

interface OrgOption {
  id: number
  name: string
}

interface RoleOption {
  id: number
  name: string
}

interface Props {
  participants: Participant[]
  events: EventOption[]
  organizations: OrgOption[]
  roles: RoleOption[]
  eventId?: string
  createHref: string
}

export function ParticipantsList({
  participants,
  events,
  organizations,
  roles,
  eventId,
  createHref,
}: Props) {
  const router = useRouter()
  const [roleDrawerOpen, setRoleDrawerOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string>(eventId || 'all')
  const [selectedRoleId, setSelectedRoleId] = useState<string>('all')
  const [sortField, setSortField] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([])
  const [organizationId, setOrganizationId] = useState<string>('')
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [imageParticipantIds, setImageParticipantIds] = useState<string[]>([])
  const [quickViewParticipantId, setQuickViewParticipantId] = useState<number | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  const handleQuickView = (id: number) => {
    setQuickViewParticipantId(id)
    setQuickViewOpen(true)
  }

  const handleDelete = async (id: number, name: string) => {
    await handleEntityDelete(
      { id, name } as any,
      {
        apiEndpoint: '/api/participants',
        entityName: 'participant',
        getEntityName: (entity) => entity.name,
      },
      {
        onStart: () => setDeletingId(id),
        onSuccess: () => {
          router.refresh()
          setDeletingId(null)
        },
        onError: () => setDeletingId(null),
      },
    )
  }

  const handleBulkDelete = async (rows: Row<Participant>[]) => {
    await handleEntityBulkDelete(
      rows,
      {
        apiEndpoint: '/api/participants',
        entityName: 'participant',
      },
      {
        onStart: () => setBulkDeleting(true),
        onSuccess: () => {
          router.refresh()
          setBulkDeleting(false)
        },
        onError: () => setBulkDeleting(false),
      },
    )
  }

  const handleBulkEmail = async (rows: Row<Participant>[]) => {
    setLoadingEmail(true)

    try {
      // Extract participant IDs from selected rows
      const ids = rows.map((row) => String(row.original.id))

      if (ids.length === 0) {
        alert('No participants selected')
        setLoadingEmail(false)
        return
      }

      // Fetch the first participant to get organization ID
      const response = await fetch(`/api/participants/${ids[0]}?depth=1`)

      if (!response.ok) {
        throw new Error(`Failed to fetch participant: ${response.status} ${response.statusText}`)
      }

      const participant = await response.json()

      const participantOrganizationId =
        typeof participant.organization === 'object'
          ? participant.organization.id
          : participant.organization

      setSelectedParticipantIds(ids)
      setOrganizationId(String(participantOrganizationId))
      setIsEmailModalOpen(true)
    } catch (error) {
      console.error('Failed to prepare bulk email:', error)
      alert(
        `Failed to prepare bulk email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    } finally {
      setLoadingEmail(false)
    }
  }

  const handleCloseEmailModal = () => {
    setIsEmailModalOpen(false)
    setSelectedParticipantIds([])
    setOrganizationId('')
  }

  const handleBulkGenerateImages = (rows: Row<Participant>[]) => {
    // Extract participant IDs from selected rows
    const ids = rows.map((row) => String(row.original.id))

    if (ids.length === 0) {
      alert('No participants selected')
      return
    }

    setImageParticipantIds(ids)
    setIsImageModalOpen(true)
  }

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false)
    setImageParticipantIds([])
  }

  const bulkActions: BulkAction<Participant>[] = [
    {
      label: 'Generate Images',
      icon: <Image className="mr-2 h-4 w-4" />,
      variant: 'default',
      onClick: handleBulkGenerateImages,
    },
    {
      label: 'Send Email',
      icon: loadingEmail ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Mail className="mr-2 h-4 w-4" />
      ),
      variant: 'default',
      onClick: handleBulkEmail,
    },
    {
      label: 'Delete',
      icon: bulkDeleting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="mr-2 h-4 w-4" />
      ),
      variant: 'destructive',
      onClick: handleBulkDelete,
      confirmation: {
        title: 'Delete participants',
        description: (count) =>
          `Are you sure you want to delete ${count} participant${count > 1 ? 's' : ''}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    },
  ]

  const getImageUrl = (media: unknown): string | null => {
    if (!media) return null
    if (typeof media === 'object' && media !== null && 'url' in media) {
      return (media as { url: string }).url
    }
    return null
  }

  const columns: ColumnDef<Participant>[] = [
    createSelectColumn<Participant>(),
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <Link
          href={`/dash/participants/${row.original.id}`}
          className="font-medium hover:underline text-left"
        >
          {row.getValue('name')}
        </Link>
      ),
    },
    {
      accessorKey: 'participantRole',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Participant role" />,
      cell: ({ row }) => getRelationName(row.getValue('participantRole')),
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <StatusSelect
          entityType="participant"
          entityId={row.original.id}
          currentStatus={row.getValue('status') as string}
          onStatusChange={() => router.refresh()}
        />
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const participant = row.original
        const isDeleting = deletingId === participant.id

        return (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => handleQuickView(participant.id)}>
              <Eye className="mr-2 h-4 w-4" />
              Quick View
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleQuickView(participant.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dash/participants/${participant.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isDeleting}
                  onClick={() => handleDelete(participant.id, participant.name)}
                  className="text-destructive focus:text-destructive"
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  // Convert participant to stacked list item
  const toStackedListItem = (participant: Participant) => {
    const imageUrl = getImageUrl(participant.imageUrl)
    const roleName = getRelationName(participant.participantRole)
    const eventName = getRelationName(participant.event)
    const isDeleting = deletingId === participant.id

    const getStatusVariant = (
      status: string | null | undefined,
    ): 'default' | 'secondary' | 'destructive' | 'outline' => {
      if (status === 'approved') return 'default'
      if (status === 'cancelled') return 'destructive'
      if (status === 'need-info') return 'outline'
      return 'secondary'
    }

    return {
      id: participant.id,
      title: participant.name,
      href: `/dash/participants/${participant.id}`,
      subtitle: participant.email,
      imageUrl,
      status: participant.status
        ? {
            label:
              participant.status === 'not-approved'
                ? 'Not Approved'
                : participant.status === 'need-info'
                  ? 'Need Info'
                  : participant.status.charAt(0).toUpperCase() + participant.status.slice(1),
            variant: getStatusVariant(participant.status),
          }
        : undefined,
      meta: [
        ...(roleName ? [{ label: 'Role', value: roleName }] : []),
        ...(eventName ? [{ label: 'Event', value: eventName }] : []),
      ],
      onQuickView: () => handleQuickView(participant.id),
      onDelete: () => handleDelete(participant.id, participant.name),
      isDeleting,
    }
  }

  // Filter and sort participants
  const filteredAndSortedParticipants = participants
    .filter((participant) => {
      // Filter by event
      if (selectedEventId !== 'all') {
        const participantEventId =
          typeof participant.event === 'object' ? participant.event?.id : participant.event
        if (String(participantEventId) !== selectedEventId) return false
      }

      // Filter by role
      if (selectedRoleId !== 'all') {
        const participantRoleId =
          typeof participant.participantRole === 'object'
            ? participant.participantRole?.id
            : participant.participantRole
        if (String(participantRoleId) !== selectedRoleId) return false
      }

      return true
    })
    .sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1

      switch (sortField) {
        case 'name':
          return multiplier * (a.name || '').localeCompare(b.name || '')
        case 'email':
          return multiplier * (a.email || '').localeCompare(b.email || '')
        case 'status':
          return multiplier * (a.status || '').localeCompare(b.status || '')
        case 'role': {
          const roleA = getRelationName(a.participantRole)
          const roleB = getRelationName(b.participantRole)
          return multiplier * roleA.localeCompare(roleB)
        }
        case 'event': {
          const eventA = getRelationName(a.event)
          const eventB = getRelationName(b.event)
          return multiplier * eventA.localeCompare(eventB)
        }
        default:
          return 0
      }
    })

  const config: EntityListConfig<Participant> = {
    columns,
    data: filteredAndSortedParticipants,
    searchKey: 'name',
    searchPlaceholder: 'Search participants...',
    emptyTitle: 'No participants yet',
    emptyDescription: eventId
      ? 'No participants found for this event.'
      : 'Add your first participant to get started.',
    emptyActionHref: createHref,
    emptyActionLabel: 'Add participant',
    bulkActions,
    toStackedListItem,
    enableViewToggle: true,
    defaultViewMode: 'stacked',
    filters: [
      {
        label: 'Event',
        value: selectedEventId,
        options: [
          { value: 'all', label: 'All Events' },
          ...events.map((e) => ({ value: String(e.id), label: e.name })),
        ],
        onChange: setSelectedEventId,
      },
      {
        label: 'Role',
        value: selectedRoleId,
        options: [
          { value: 'all', label: 'All Roles' },
          ...roles.map((r) => ({ value: String(r.id), label: r.name })),
        ],
        onChange: setSelectedRoleId,
      },
    ],
    sort: {
      label: 'Sort by',
      value: sortField,
      options: [
        { value: 'name', label: 'Name' },
        { value: 'email', label: 'Email' },
        { value: 'status', label: 'Status' },
        { value: 'role', label: 'Role' },
        { value: 'event', label: 'Event' },
      ],
      onChange: setSortField,
      sortDirection,
      onDirectionChange: () => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc')),
    },
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-auto bg-muted/20 dark:bg-background">
        <div className="px-8 py-8">
          <EntityList config={config} />
        </div>
      </div>

      <Drawer open={roleDrawerOpen} onOpenChange={setRoleDrawerOpen} direction="right">
        <DrawerContent className="w-[500px] max-w-full flex flex-col">
          <DrawerHeader>
            <DrawerTitle>Create participant role</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-6 pb-6 flex-1">
            <ParticipantRoleForm
              mode="create"
              organizations={organizations}
              onSuccess={() => {
                setRoleDrawerOpen(false)
                router.refresh()
              }}
              onCancel={() => setRoleDrawerOpen(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {isEmailModalOpen && organizationId && selectedParticipantIds.length > 0 && (
        <BulkEmailModal
          participantIds={selectedParticipantIds}
          organizationId={organizationId}
          onClose={handleCloseEmailModal}
          entityType="participant"
        />
      )}

      {isImageModalOpen && imageParticipantIds.length > 0 && (
        <GenerationModal
          participantIds={imageParticipantIds}
          onClose={handleCloseImageModal}
          entityType="participant"
        />
      )}

      <Suspense fallback={null}>
        <ParticipantQuickView
          participantId={quickViewParticipantId}
          open={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
          onDelete={handleDelete}
        />
      </Suspense>
    </div>
  )
}
