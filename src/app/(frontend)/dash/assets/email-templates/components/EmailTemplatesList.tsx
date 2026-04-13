'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Eye, Copy, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { createSelectColumn } from '@/components/ui/data-table'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import { EntityList, EntityListConfig } from '@/components/shared/EntityList'
import { handleEntityDelete } from '@/lib/entity-actions'

type EmailTemplate = {
  id: number
  name: string
  subject: string
  description?: string | null
  isActive?: boolean
  isPublic?: boolean
  isPremium?: boolean
  automationTriggers?: {
    triggerEvent?: string | null
  }
  updatedAt: string
}

interface EmailTemplatesListProps {
  templates: EmailTemplate[]
}

export function EmailTemplatesList({ templates }: EmailTemplatesListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    await handleEntityDelete(
      { id, name },
      {
        apiEndpoint: '/api/email-templates',
        entityName: 'email template',
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
  const formatTriggerEvent = (event?: string | null) => {
    if (!event || event === 'none') return 'Manual'
    return event
      .split('.')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const columns: ColumnDef<EmailTemplate>[] = [
    createSelectColumn<EmailTemplate>(),
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const template = row.original
        return (
          <div>
            <Link
              href={`/dash/assets/email-templates/${template.id}`}
              className="font-medium hover:underline"
            >
              {row.getValue('name')}
            </Link>
            {template.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{template.description}</p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'subject',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
      cell: ({ row }) => <div className="max-w-xs truncate">{row.getValue('subject')}</div>,
    },
    {
      accessorKey: 'isPublic',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Public" />,
      cell: ({ row }) => {
        const isPublic = row.getValue('isPublic') as boolean | undefined
        return isPublic ? (
          <Badge variant="outline">Public</Badge>
        ) : (
          <Badge variant="secondary">Private</Badge>
        )
      },
    },
    {
      accessorKey: 'isPremium',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Premium" />,
      cell: ({ row }) => {
        const isPremium = row.getValue('isPremium') as boolean | undefined
        return isPremium ? <Badge variant="default">Premium</Badge> : null
      },
    },
    {
      id: 'trigger',
      accessorFn: (row) => row.automationTriggers?.triggerEvent,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trigger" />,
      cell: ({ row }) => {
        const template = row.original
        return (
          <span className="text-sm text-muted-foreground">
            {formatTriggerEvent(template.automationTriggers?.triggerEvent)}
          </span>
        )
      },
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean | undefined
        return (
          <Badge variant={isActive !== false ? 'default' : 'secondary'}>
            {isActive !== false ? 'Active' : 'Inactive'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
      cell: ({ row }) => {
        const date = row.getValue('updatedAt') as string
        return (
          <span className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString()}
          </span>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const template = row.original

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
                <DropdownMenuItem asChild>
                  <Link href={`/dash/assets/email-templates/${template.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dash/assets/email-templates/${template.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dash/assets/email-templates/create?clone=${template.id}`}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(template.id, template.name)}
                  disabled={deletingId === template.id}
                  className="text-destructive focus:text-destructive"
                >
                  {deletingId === template.id ? (
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

  const config: EntityListConfig<EmailTemplate> = {
    columns,
    data: templates,
    searchKey: 'name',
    searchPlaceholder: 'Search email templates...',
    emptyTitle: 'No email templates yet',
    emptyDescription: 'Create your first email template to get started',
    emptyActionHref: '/dash/assets/email-templates/create',
    emptyActionLabel: 'Create template',
  }

  return <EntityList config={config} />
}
