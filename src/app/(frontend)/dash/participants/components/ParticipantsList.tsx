'use client'

import { useState, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Pencil, Trash2, Loader2, MoreHorizontal, Mail, Image, Eye } from 'lucide-react'

import type { Participant } from '@/payload-types'
import { TopBar } from '@/components/shared/TopBar'
import { EventSwitcher } from '@/components/event-switcher'
import { NewButtonDropdown } from '@/components/shared/NewButtonDropdown'
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

interface Props {
  participants: Participant[]
  events: EventOption[]
  organizations: OrgOption[]
  eventId?: string
  createHref: string
}

export function ParticipantsList({
  participants,
  events,
  organizations,
  eventId,
  createHref,
}: Props) {
  const router = useRouter()
  const [roleDrawerOpen, setRoleDrawerOpen] = useState(false)

  const newButtonItems = [
    {
      label: 'New participant',
      href: createHref,
    },
    {
      label: 'New participant role',
      onClick: () => setRoleDrawerOpen(true),
    },
  ]
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

  const config: EntityListConfig<Participant> = {
    columns,
    data: participants,
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
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <TopBar
        title="Participants"
        description="Manage event attendees and roles"
        centerContent={<EventSwitcher />}
        actions={<NewButtonDropdown items={newButtonItems} />}
      />
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
              events={events}
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
