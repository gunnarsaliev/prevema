'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { ParticipantRoleForm } from '@/app/(frontend)/dash/participant-roles/components/ParticipantRoleForm'
import type { ParticipantRoleFormValues } from '@/lib/schemas/participant-role'

type OrgOption = { id: number; name: string }
type EventOption = { id: number; name: string }

type ParticipantRoleItem = {
  id: number
  name: string
  description?: string | null
  isActive?: boolean | null
  requiredFields?: string[] | null
  publicFormLink?: string | null
  organization: number
  event?: number | null
  showOptionalFields?: boolean | null
  optionalFields?: string[] | null
}

type Props = {
  items: ParticipantRoleItem[]
  eventId: number
  orgId: number
  organizations: OrgOption[]
  events: EventOption[]
}

export function ParticipantRolesSection({ items, eventId, orgId, organizations, events }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ParticipantRoleItem | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const handleClose = () => {
    setOpen(false)
    setEditing(null)
  }

  const handleSuccess = () => {
    handleClose()
    router.refresh()
  }

  const openCreate = () => {
    setEditing(null)
    setOpen(true)
  }

  const openEdit = (item: ParticipantRoleItem) => {
    setEditing(item)
    setOpen(true)
  }

  const isCreate = open && editing === null
  const isEdit = open && editing !== null

  const editDefaultValues: ParticipantRoleFormValues | undefined = editing
    ? {
        organization: typeof editing.organization === 'number' ? editing.organization : undefined,
        name: editing.name,
        description: editing.description ?? null,
        event: editing.event ?? null,
        isActive: editing.isActive ?? true,
        requiredFields: (editing.requiredFields ??
          []) as ParticipantRoleFormValues['requiredFields'],
        showOptionalFields: editing.showOptionalFields ?? false,
        optionalFields: (editing.optionalFields ??
          []) as ParticipantRoleFormValues['optionalFields'],
      }
    : undefined

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Participant roles
        </h2>
        <Button variant="outline" size="sm" onClick={openCreate}>
          Add
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          No participant roles linked to this event yet.
        </p>
      ) : (
        <div className="divide-y rounded-md border">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 px-4 py-3 shadow-sm rounded-lg bg-slate-50"
            >
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.name}</span>
                  {item.isActive ? (
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                  {Array.isArray(item.requiredFields) && item.requiredFields.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {item.requiredFields.length} required fields
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground truncate max-w-md">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.publicFormLink && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const url = `${window.location.origin}/participant-register/${item.id}`
                        navigator.clipboard.writeText(url)
                        setCopiedId(item.id)
                        setTimeout(() => setCopiedId(null), 2000)
                      }}
                    >
                      <Copy className="h-4 w-4" />
                      {copiedId === item.id && <span className="ml-1 text-xs">Copied!</span>}
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`/participant-register/${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open
                        <ExternalLink className="h-4 w-4 mr-1" />
                      </a>
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={open}
        onOpenChange={(v) => {
          if (!v) handleClose()
        }}
        direction="right"
      >
        <DrawerContent className="overflow-hidden sm:max-w-lg!">
          <DrawerHeader className="border-b shrink-0">
            <DrawerTitle>
              {isCreate ? 'Add participant role' : `Edit: ${editing?.name}`}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 flex-1 overflow-y-auto overflow-x-hidden min-h-0">
            {isCreate && (
              <ParticipantRoleForm
                key="create"
                mode="create"
                organizations={organizations}
                events={events}
                lockedValues={{ event: eventId, organization: orgId }}
                onSuccess={handleSuccess}
                onCancel={handleClose}
              />
            )}
            {isEdit && editDefaultValues && (
              <ParticipantRoleForm
                key={`edit-${editing!.id}`}
                mode="edit"
                participantRoleId={String(editing!.id)}
                defaultValues={editDefaultValues}
                organizations={organizations}
                events={events}
                lockedValues={{ event: eventId, organization: orgId }}
                onSuccess={handleSuccess}
                onCancel={handleClose}
              />
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
