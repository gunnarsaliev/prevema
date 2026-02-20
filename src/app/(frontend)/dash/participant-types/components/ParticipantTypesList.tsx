'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Pencil, Trash2, Plus, Loader2, CheckCircle2, XCircle, Copy, Check, MoreHorizontal } from 'lucide-react'

import type { ParticipantType } from '@/payload-types'
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
import { DataTable, createSelectColumn } from '@/components/ui/data-table'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'

interface Props {
  participantTypes: ParticipantType[]
}

export function ParticipantTypesList({ participantTypes }: Props) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const handleCopy = async (id: number, url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      alert('Failed to copy URL.')
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/participant-types/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      router.refresh()
    } catch {
      alert('Failed to delete participant type.')
    } finally {
      setDeletingId(null)
    }
  }

  const getEventName = (rel: unknown): string => {
    if (!rel) return '—'
    if (typeof rel === 'object' && rel !== null && 'name' in rel) return (rel as { name: string }).name
    return '—'
  }

  const columns: ColumnDef<ParticipantType>[] = [
    createSelectColumn<ParticipantType>(),
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'event',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Event" />,
      cell: ({ row }) => getEventName(row.getValue('event')),
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
        const participantType = row.original
        const isDeleting = deletingId === participantType.id
        const isCopied = copiedId === participantType.id

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
                {participantType.publicFormLink && (
                  <>
                    <DropdownMenuItem
                      onClick={() => handleCopy(participantType.id, participantType.publicFormLink!)}
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
                  <Link href={`/dash/participant-types/${participantType.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={isDeleting}
                  onClick={() => handleDelete(participantType.id, participantType.name)}
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Participant types</h1>
        <Button asChild>
          <Link href="/dash/participant-types/create">
            <Plus className="mr-2 h-4 w-4" />
            New participant type
          </Link>
        </Button>
      </div>

      {participantTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <p className="text-lg font-medium">No participant types yet</p>
          <p className="text-sm mt-1">Create your first participant type to get started.</p>
          <Button asChild className="mt-4">
            <Link href="/dash/participant-types/create">Create participant type</Link>
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={participantTypes}
          searchKey="name"
          searchPlaceholder="Search participant types..."
        />
      )}
    </div>
  )
}
