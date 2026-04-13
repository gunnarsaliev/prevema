'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Mail } from 'lucide-react'
import { handleEntityDelete } from '@/lib/entity-actions'
import { AssetCard } from '@/components/shared/AssetCard'

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

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <Mail className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-lg font-medium">No email templates yet</p>
        <p className="text-sm text-muted-foreground">
          Create your first email template to get started
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {templates.map((template) => (
        <AssetCard
          key={template.id}
          asset={template}
          variant="manage"
          assetType="email-template"
          onDelete={handleDelete}
          isDeleting={deletingId === template.id}
          editUrl={`/dash/assets/email-templates/${template.id}/edit`}
          duplicateUrl={`/dash/assets/email-templates/create?clone=${template.id}`}
        />
      ))}
    </div>
  )
}
