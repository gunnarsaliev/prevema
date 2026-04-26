import Link from 'next/link'
import { Handshake } from 'lucide-react'

import type { Partner } from '@/payload-types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  contacted: 'default',
  confirmed: 'default',
  declined: 'destructive',
}

function relationName(rel: unknown): string {
  if (!rel) return '—'
  if (typeof rel === 'object' && rel !== null && 'name' in rel) {
    return (rel as { name: string }).name ?? '—'
  }
  return '—'
}

interface Props {
  partners: Partner[]
  canEdit: boolean
}

export function PartnersTable({ partners, canEdit }: Props) {
  if (partners.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-8 text-center">
          <Handshake className="size-10 text-muted-foreground" aria-hidden />
          <h3 className="text-lg font-semibold">No partners yet</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {canEdit
              ? 'Partners will appear here once they are added.'
              : 'No partners have been added yet.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Event</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partners.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/dashboard/partners/${p.id}`}
                  className="hover:underline underline-offset-4"
                >
                  {p.companyName}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {p.contactPerson || p.contactEmail || '—'}
              </TableCell>
              <TableCell>
                {p.status ? (
                  <Badge variant={STATUS_VARIANT[p.status] ?? 'secondary'} className="capitalize">
                    {p.status}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {relationName(p.partnerType)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {relationName(p.event)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
