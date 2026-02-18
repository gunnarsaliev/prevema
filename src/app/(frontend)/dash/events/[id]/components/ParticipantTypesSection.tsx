'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { ParticipantTypeForm } from '@/app/(frontend)/dash/participant-types/components/ParticipantTypeForm'
import type { ParticipantTypeFormValues } from '@/lib/schemas/participant-type'

type OrgOption = { id: number; name: string }
type EventOption = { id: number; name: string }

type ParticipantTypeItem = {
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
  items: ParticipantTypeItem[]
  eventId: number
  orgId: number
  organizations: OrgOption[]
  events: EventOption[]
}

export function ParticipantTypesSection({ items, eventId, orgId, organizations, events }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ParticipantTypeItem | null>(null)

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

  const openEdit = (item: ParticipantTypeItem) => {
    setEditing(item)
    setOpen(true)
  }

  const isCreate = open && editing === null
  const isEdit = open && editing !== null

  const editDefaultValues: ParticipantTypeFormValues | undefined = editing
    ? {
        organization: typeof editing.organization === 'number' ? editing.organization : undefined,
        name: editing.name,
        description: editing.description ?? null,
        event: editing.event ?? null,
        isActive: editing.isActive ?? true,
        requiredFields: (editing.requiredFields ?? []) as ParticipantTypeFormValues['requiredFields'],
        showOptionalFields: editing.showOptionalFields ?? false,
        optionalFields: (editing.optionalFields ?? []) as ParticipantTypeFormValues['optionalFields'],
      }
    : undefined

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Participant types
        </h2>
        <Button variant="outline" size="sm" onClick={openCreate}>
          Add
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          No participant types linked to this event yet.
        </p>
      ) : (
        <div className="divide-y rounded-md border">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.name}</span>
                  {item.isActive ? (
                    <Badge variant="default" className="text-xs">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
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
                  <Button variant="outline" size="sm" asChild>
                    <a href={item.publicFormLink} target="_blank" rel="noopener noreferrer">
                      Form link
                    </a>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer open={open} onOpenChange={(v) => { if (!v) handleClose() }} direction="right">
        <DrawerContent className="overflow-hidden sm:max-w-lg!">
          <DrawerHeader className="border-b shrink-0">
            <DrawerTitle>
              {isCreate ? 'Add participant type' : `Edit: ${editing?.name}`}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 flex-1 overflow-y-auto overflow-x-hidden min-h-0">
            {isCreate && (
              <ParticipantTypeForm
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
              <ParticipantTypeForm
                key={`edit-${editing!.id}`}
                mode="edit"
                participantTypeId={String(editing!.id)}
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
