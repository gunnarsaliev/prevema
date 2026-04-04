'use client'

import { useState, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Pencil, Trash2, Loader2, MoreHorizontal, Mail, Image, Plus, Eye } from 'lucide-react'

import type { Partner } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import {
  handleEntityDelete,
  handleEntityBulkDelete,
  getRelationName,
} from '@/lib/entity-actions'
import { BulkEmailModal } from '@/components/BulkEmailModal'
import { GenerationModal } from '@/components/GenerationModal'
import { StatusSelect } from '@/components/shared/StatusSelect'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { PartnerTypeForm } from '../../partner-types/components/PartnerTypeForm'

const PartnerQuickView = lazy(() =>
  import('./PartnerQuickView').then((module) => ({ default: module.PartnerQuickView }))
)

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  default: 'secondary',
  contacted: 'default',
  confirmed: 'default',
  declined: 'destructive',
}

interface EventOption {
  id: number
  name: string
}

interface OrgOption {
  id: number
  name: string
}

interface Props {
  partners: Partner[]
  events: EventOption[]
  organizations: OrgOption[]
  eventId?: string
  onOpenTypeDrawer?: () => void
}

export function PartnersList({ partners, events, organizations, eventId }: Props) {
  const router = useRouter()
  const [typeDrawerOpen, setTypeDrawerOpen] = useState(false)

  // Expose function to parent via callback
  const openTypeDrawer = () => setTypeDrawerOpen(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([])
  const [organizationId, setOrganizationId] = useState<string>('')
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [imagePartnerIds, setImagePartnerIds] = useState<string[]>([])
  const [quickViewPartnerId, setQuickViewPartnerId] = useState<number | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  const handleQuickView = (id: number) => {
    setQuickViewPartnerId(id)
    setQuickViewOpen(true)
  }

  const handleDelete = async (id: number, companyName: string) => {
    await handleEntityDelete(
      { id, companyName } as any,
      {
        apiEndpoint: '/api/partners',
        entityName: 'partner',
        getEntityName: (entity) => entity.companyName,
      },
      {
        onStart: () => setDeletingId(id),
        onSuccess: () => {
          router.refresh()
          setDeletingId(null)
        },
        onError: () => setDeletingId(null),
      }
    )
  }

  const handleBulkDelete = async (rows: Row<Partner>[]) => {
    await handleEntityBulkDelete(
      rows,
      {
        apiEndpoint: '/api/partners',
        entityName: 'partner',
      },
      {
        onStart: () => setBulkDeleting(true),
        onSuccess: () => {
          router.refresh()
          setBulkDeleting(false)
        },
        onError: () => setBulkDeleting(false),
      }
    )
  }

  const handleBulkEmail = async (rows: Row<Partner>[]) => {
    setLoadingEmail(true)

    try {
      // Extract partner IDs from selected rows
      const ids = rows.map((row) => String(row.original.id))

      if (ids.length === 0) {
        alert('No partners selected')
        setLoadingEmail(false)
        return
      }

      // Fetch the first partner to get organization ID
      const response = await fetch(`/api/partners/${ids[0]}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch partner: ${response.status} ${response.statusText}`)
      }

      const partner = await response.json()

      const partnerOrganizationId =
        typeof partner.organization === 'object'
          ? partner.organization.id
          : partner.organization

      setSelectedPartnerIds(ids)
      setOrganizationId(String(partnerOrganizationId))
      setIsEmailModalOpen(true)
    } catch (error) {
      console.error('Failed to prepare bulk email:', error)
      alert(`Failed to prepare bulk email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoadingEmail(false)
    }
  }

  const handleCloseEmailModal = () => {
    setIsEmailModalOpen(false)
    setSelectedPartnerIds([])
    setOrganizationId('')
  }

  const handleBulkGenerateImages = (rows: Row<Partner>[]) => {
    // Extract partner IDs from selected rows
    const ids = rows.map((row) => String(row.original.id))

    if (ids.length === 0) {
      alert('No partners selected')
      return
    }

    setImagePartnerIds(ids)
    setIsImageModalOpen(true)
  }

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false)
    setImagePartnerIds([])
  }

  const bulkActions: BulkAction<Partner>[] = [
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
        title: 'Delete partners',
        description: (count) =>
          `Are you sure you want to delete ${count} partner${count > 1 ? 's' : ''}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    },
  ]

  const columns: ColumnDef<Partner>[] = [
    createSelectColumn<Partner>(),
    {
      accessorKey: 'companyName',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
      cell: ({ row }) => (
        <button
          onClick={() => handleQuickView(row.original.id)}
          className="font-medium hover:underline text-left"
        >
          {row.getValue('companyName')}
        </button>
      ),
    },
    {
      accessorKey: 'partnerType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Partner type" />
      ),
      cell: ({ row }) => getRelationName(row.getValue('partnerType')),
      enableSorting: false,
    },
    {
      accessorKey: 'tier',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tier" />,
      cell: ({ row }) => getRelationName(row.getValue('tier')),
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <StatusSelect
          entityType="partner"
          entityId={row.original.id}
          currentStatus={row.getValue('status') as string}
          onStatusChange={() => router.refresh()}
        />
      ),
    },
    {
      accessorKey: 'contactPerson',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const partner = row.original
        const isDeleting = deletingId === partner.id

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleQuickView(partner.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dash/partners/${partner.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isDeleting}
                  onClick={() => handleDelete(partner.id, partner.companyName)}
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

  const createHref = eventId
    ? `/dash/partners/create?eventId=${eventId}`
    : '/dash/partners/create'

  const config: EntityListConfig<Partner> = {
    columns,
    data: partners,
    searchKey: 'companyName',
    searchPlaceholder: 'Search partners...',
    emptyTitle: 'No partners yet',
    emptyDescription: eventId
      ? 'No partners found for this event.'
      : 'Add your first partner to get started.',
    emptyActionHref: createHref,
    emptyActionLabel: 'Add partner',
    bulkActions,
  }

  return (
    <>
      <EntityList config={config} />

      <Drawer open={typeDrawerOpen} onOpenChange={setTypeDrawerOpen} direction="right">
        <DrawerContent className="w-[500px] max-w-full flex flex-col">
          <DrawerHeader>
            <DrawerTitle>Create partner type</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-6 pb-6 flex-1">
            <PartnerTypeForm
              mode="create"
              organizations={organizations}
              events={events}
              onSuccess={() => {
                setTypeDrawerOpen(false)
                router.refresh()
              }}
              onCancel={() => setTypeDrawerOpen(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {isEmailModalOpen && organizationId && selectedPartnerIds.length > 0 && (
        <BulkEmailModal
          participantIds={selectedPartnerIds}
          organizationId={organizationId}
          onClose={handleCloseEmailModal}
          entityType="partner"
        />
      )}

      {isImageModalOpen && imagePartnerIds.length > 0 && (
        <GenerationModal
          participantIds={imagePartnerIds}
          onClose={handleCloseImageModal}
          entityType="partner"
        />
      )}

      <Suspense fallback={null}>
        <PartnerQuickView
          partnerId={quickViewPartnerId}
          open={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
          onDelete={handleDelete}
        />
      </Suspense>
    </>
  )
}
