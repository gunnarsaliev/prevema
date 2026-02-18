'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2, Plus, Loader2, CheckCircle2, XCircle, Copy, Check } from 'lucide-react'

import type { PartnerType } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Props {
  partnerTypes: PartnerType[]
}

export function PartnerTypesList({ partnerTypes }: Props) {
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
      const res = await fetch(`/api/partner-types/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      router.refresh()
    } catch {
      alert('Failed to delete partner type.')
    } finally {
      setDeletingId(null)
    }
  }

  const getEventName = (rel: unknown): string => {
    if (!rel) return '—'
    if (typeof rel === 'object' && rel !== null && 'name' in rel) return (rel as { name: string }).name
    return '—'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Partner types</h1>
        <Button asChild>
          <Link href="/dash/partner-types/create">
            <Plus className="mr-2 h-4 w-4" />
            New partner type
          </Link>
        </Button>
      </div>

      {partnerTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <p className="text-lg font-medium">No partner types yet</p>
          <p className="text-sm mt-1">Create your first partner type to get started.</p>
          <Button asChild className="mt-4">
            <Link href="/dash/partner-types/create">Create partner type</Link>
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Required fields</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partnerTypes.map((pt) => (
              <TableRow key={pt.id}>
                <TableCell className="font-medium">{pt.name}</TableCell>
                <TableCell>{getEventName(pt.event)}</TableCell>
                <TableCell>
                  {Array.isArray(pt.requiredFields) && pt.requiredFields.length > 0 ? (
                    <Badge variant="secondary">{pt.requiredFields.length} fields</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">None</span>
                  )}
                </TableCell>
                <TableCell>
                  {pt.isActive ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {pt.publicFormLink && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(pt.id, pt.publicFormLink!)}
                        title="Copy public form URL"
                      >
                        {copiedId === pt.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="sr-only">Copy public form URL</span>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dash/partner-types/${pt.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deletingId === pt.id}
                      onClick={() => handleDelete(pt.id, pt.name)}
                    >
                      {deletingId === pt.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
