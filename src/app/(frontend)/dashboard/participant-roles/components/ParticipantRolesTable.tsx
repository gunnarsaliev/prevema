import Link from 'next/link'
import { CheckCircle2, XCircle, Tag } from 'lucide-react'

import type { ParticipantRole } from '@/payload-types'
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
  roles: ParticipantRole[]
}

export function ParticipantRolesTable({ roles }: Props) {
  if (roles.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-8 text-center">
          <Tag className="size-10 text-muted-foreground" aria-hidden />
          <h3 className="text-lg font-semibold">No participant roles yet</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Participant roles define what information is collected during registration.
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
          {roles.map((role) => {
            const fieldCount = Array.isArray(role.requiredFields)
              ? role.requiredFields.length
              : 0

            return (
              <TableRow key={role.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/dash/participant-roles/${role.id}/edit`}
                    className="hover:underline underline-offset-4"
                  >
                    {role.name}
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
                  {role.isActive ? (
                    <CheckCircle2 className="size-4 text-green-500" aria-label="Active" />
                  ) : (
                    <XCircle className="size-4 text-muted-foreground" aria-label="Inactive" />
                  )}
                </TableCell>
                <TableCell className="max-w-[220px]">
                  {role.publicFormLink ? (
                    <a
                      href={role.publicFormLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate block text-xs text-muted-foreground hover:underline underline-offset-4"
                    >
                      {role.publicFormLink}
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
