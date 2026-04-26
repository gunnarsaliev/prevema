import Link from 'next/link'
import { CheckCircle2, XCircle, Layers } from 'lucide-react'

import type { PartnerType } from '@/payload-types'
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

interface Props {
  types: PartnerType[]
}

export function PartnerTypesTable({ types }: Props) {
  if (types.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-8 text-center">
          <Layers className="size-10 text-muted-foreground" aria-hidden />
          <h3 className="text-lg font-semibold">No partner types yet</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Partner types define what information is collected during partner registration.
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
            <TableHead>Name</TableHead>
            <TableHead>Required fields</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Public form</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {types.map((type) => {
            const fieldCount = Array.isArray(type.requiredFields)
              ? type.requiredFields.length
              : 0

            return (
              <TableRow key={type.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/dash/partner-types/${type.id}/edit`}
                    className="hover:underline underline-offset-4"
                  >
                    {type.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {fieldCount > 0 ? (
                    <Badge variant="secondary">{fieldCount} fields</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell>
                  {type.isActive ? (
                    <CheckCircle2 className="size-4 text-green-500" aria-label="Active" />
                  ) : (
                    <XCircle className="size-4 text-muted-foreground" aria-label="Inactive" />
                  )}
                </TableCell>
                <TableCell className="max-w-[220px]">
                  {type.publicFormLink ? (
                    <a
                      href={type.publicFormLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate block text-xs text-muted-foreground hover:underline underline-offset-4"
                    >
                      {type.publicFormLink}
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
