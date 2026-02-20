'use client'

import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Eye, Copy, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'

type ImageTemplate = {
  id: number
  name: string
  usageType?: 'participant' | 'partner' | 'both'
  isActive?: boolean
  width: number
  height: number
  updatedAt: string
}

interface ImageTemplatesListProps {
  templates: ImageTemplate[]
}

export function ImageTemplatesList({ templates }: ImageTemplatesListProps) {
  const formatUsageType = (type: string) => {
    const map: Record<string, string> = {
      participant: 'Participants',
      partner: 'Partners',
      both: 'Both',
    }
    return map[type] || type
  }

  const columns: ColumnDef<ImageTemplate>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const template = row.original
        return (
          <Link
            href={`/dash/assets/image-templates/${template.id}`}
            className="font-medium hover:underline"
          >
            {row.getValue('name')}
          </Link>
        )
      },
    },
    {
      accessorKey: 'usageType',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Usage Type" />,
      cell: ({ row }) => {
        const type = row.getValue('usageType') as string | undefined
        return (
          <span className="text-sm text-muted-foreground">
            {type ? formatUsageType(type) : 'Participant'}
          </span>
        )
      },
    },
    {
      id: 'dimensions',
      accessorFn: (row) => `${row.width}x${row.height}`,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Dimensions" />,
      cell: ({ row }) => {
        const template = row.original
        return (
          <span className="text-sm text-muted-foreground font-mono">
            {template.width} × {template.height}
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
                  <Link href={`/dash/assets/image-templates/${template.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dash/assets/image-templates/${template.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dash/assets/image-templates/create?clone=${template.id}`}>
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
          <h1 className="text-2xl font-semibold">Image Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage saved canvas templates for bulk image generation
          </p>
        </div>
        <Button asChild>
          <Link href="/dash/assets/image-templates/create">Create template</Link>
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No image templates yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Create your first image template to get started
          </p>
          <Button asChild>
            <Link href="/dash/assets/image-templates/create">Create template</Link>
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={templates}
          searchKey="name"
          searchPlaceholder="Search image templates..."
        />
      )}
    </div>
  )
}
