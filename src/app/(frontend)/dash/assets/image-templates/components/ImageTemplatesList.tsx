'use client'

import Link from 'next/link'
import { MoreHorizontal, Pencil, Eye, Copy, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

type ImageTemplate = {
  id: number
  name: string
  usageType: 'participant' | 'partner' | 'both'
  isActive: boolean
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Usage Type</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/dash/assets/image-templates/${template.id}`}
                      className="hover:underline"
                    >
                      {template.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatUsageType(template.usageType)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground font-mono">
                      {template.width} × {template.height}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.isActive ? 'default' : 'secondary'}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(template.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
