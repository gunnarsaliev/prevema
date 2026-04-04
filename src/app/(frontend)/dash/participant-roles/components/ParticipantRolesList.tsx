'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ColumnDef, Row } from '@tanstack/react-table'
import {
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  MoreHorizontal,
  Plus,
} from 'lucide-react'

import type { ParticipantRole } from '@/payload-types'
import { TopBar } from '@/components/shared/TopBar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createSelectColumn, BulkAction } from '@/components/ui/data-table'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import { EntityList, EntityListConfig } from '@/components/shared/EntityList'
import {
  handleEntityDelete,
  handleEntityBulkDelete,
  handleCopyToClipboard,
  getRelationName,
} from '@/lib/entity-actions'

interface Props {
  participantRoles: ParticipantRole[]
}

export function ParticipantRolesList({ participantRoles }: Props) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const handleCopy = async (id: number, url: string) => {
    await handleCopyToClipboard(
      { id } as any,
      {
        getCopyText: () => url,
      },
      {
        onStart: () => {},
        onSuccess: () => setCopiedId(id),
        onError: () => setCopiedId(null),
      }
    )
  }

  const handleDelete = async (id: number, name: string) => {
    await handleEntityDelete(
      { id, name } as any,
      {
        apiEndpoint: '/api/participant-roles',
        entityName: 'participant role',
        getEntityName: (entity) => entity.name,
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

  const handleBulkDelete = async (rows: Row<ParticipantRole>[]) => {
    await handleEntityBulkDelete(
      rows,
      {
        apiEndpoint: '/api/participant-roles',
        entityName: 'participant role',
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

  const bulkActions: BulkAction<ParticipantRole>[] = [
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
        title: 'Delete participant roles',
        description: (count) =>
          `Are you sure you want to delete ${count} participant role${count > 1 ? 's' : ''}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    },
  ]

  const columns: ColumnDef<ParticipantRole>[] = [
    createSelectColumn<ParticipantRole>(),
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'event',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Event" />,
      cell: ({ row }) => getRelationName(row.getValue('event')),
      enableSorting: false,
    },
    {
      accessorKey: 'requiredFields',
      header: 'Required fields',
      cell: ({ row }) => {
        const fields = row.getValue('requiredFields') as string[]
        return Array.isArray(fields) && fields.length > 0 ? (
          <Badge variant="secondary">{fields.length} fields</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">None</span>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Active" />,
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean
        return isActive ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-muted-foreground" />
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const participantRole = row.original
        const isDeleting = deletingId === participantRole.id
        const isCopied = copiedId === participantRole.id

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
                {participantRole.publicFormLink && (
                  <>
                    <DropdownMenuItem
                      onClick={() =>
                        handleCopy(participantRole.id, participantRole.publicFormLink!)
                      }
                    >
                      {isCopied ? (
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="mr-2 h-4 w-4" />
                      )}
                      {isCopied ? 'Copied!' : 'Copy public form URL'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href={`/dash/participant-roles/${participantRole.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={isDeleting}
                  onClick={() => handleDelete(participantRole.id, participantRole.name)}
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

  const config: EntityListConfig<ParticipantRole> = {
    columns,
    data: participantRoles,
    searchKey: 'name',
    searchPlaceholder: 'Search participant roles...',
    emptyTitle: 'No participant roles yet',
    emptyDescription: 'Create your first participant role to get started.',
    emptyActionHref: '/dash/participant-roles/create',
    emptyActionLabel: 'Create participant role',
    bulkActions,
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <TopBar
        title="Participant Roles"
        description="Manage attendee categories and registration forms"
        actions={
          <Button asChild>
            <Link href="/dash/participant-roles/create">
              <Plus className="mr-2 h-4 w-4" />
              New participant role
            </Link>
          </Button>
        }
      />
      <div className="flex-1 overflow-auto bg-muted/20 dark:bg-background">
        <div className="px-8 py-8">
          <EntityList config={config} />
        </div>
      </div>
    </div>
  )
}
