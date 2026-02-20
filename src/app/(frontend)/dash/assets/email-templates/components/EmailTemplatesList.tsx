'use client'

import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Eye, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { DataTable, createSelectColumn } from '@/components/ui/data-table'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'

type EmailTemplate = {
  id: number
  name: string
  subject: string
  description?: string | null
  isActive?: boolean
  automationTriggers?: {
    triggerEvent?: string | null
  }
  updatedAt: string
}

interface EmailTemplatesListProps {
  templates: EmailTemplate[]
}

export function EmailTemplatesList({ templates }: EmailTemplatesListProps) {
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
              <p className="text-sm text-muted-foreground mt-0.5">
                {template.description}
              </p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'subject',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
      cell: ({ row }) => (
        <div className="max-w-xs truncate">{row.getValue('subject')}</div>
      ),
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
                  <Link
                    href={`/dash/assets/email-templates/create?clone=${template.id}`}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </Link>
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
        <div>
          <h1 className="text-2xl font-semibold">Email Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage email templates for automated communications
          </p>
        </div>
        <Button asChild>
          <Link href="/dash/assets/email-templates/create">Create template</Link>
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg font-medium">No email templates yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Create your first email template to get started
          </p>
          <Button asChild>
            <Link href="/dash/assets/email-templates/create">Create template</Link>
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={templates}
          searchKey="name"
          searchPlaceholder="Search email templates..."
        />
      )}
    </div>
  )
}
