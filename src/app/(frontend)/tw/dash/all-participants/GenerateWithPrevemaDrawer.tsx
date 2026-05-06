'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Image as ImageIcon, Loader2, Mail, XCircle } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface EmailTemplate {
  id: number | string
  name: string
  subject?: string
  description?: string
}

interface ImageTemplate {
  id: number | string
  name: string
  width?: number
  height?: number
  previewImage?: string | null
  elements?: any[]
}

interface EmailProgress {
  sentCount: number
  totalCount: number
  successCount: number
  failureCount: number
  currentEmail?: string
}

interface ImageProgress {
  current: number
  total: number
}

type RunResult =
  | { kind: 'success'; message: string; details?: string }
  | { kind: 'partial'; message: string; details?: string }
  | { kind: 'error'; message: string; details?: string }

interface GenerateWithPrevemaDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  participantIds: string[]
  organizationId: string | null
}

export function GenerateWithPrevemaDrawer({
  open,
  onOpenChange,
  participantIds,
  organizationId,
}: GenerateWithPrevemaDrawerProps) {
  const [tab, setTab] = useState<'email' | 'image'>('email')

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [imageTemplates, setImageTemplates] = useState<ImageTemplate[]>([])
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [loadingImage, setLoadingImage] = useState(false)

  const [busyTemplateId, setBusyTemplateId] = useState<string | null>(null)
  const [emailProgress, setEmailProgress] = useState<EmailProgress | null>(null)
  const [imageProgress, setImageProgress] = useState<ImageProgress | null>(null)
  const [result, setResult] = useState<RunResult | null>(null)

  // Reset state when drawer closes
  useEffect(() => {
    if (!open) {
      setBusyTemplateId(null)
      setEmailProgress(null)
      setImageProgress(null)
      setResult(null)
    }
  }, [open])

  // Fetch templates on open
  useEffect(() => {
    if (!open || !organizationId) return

    const fetchEmail = async () => {
      setLoadingEmail(true)
      try {
        const res = await fetch(
          `/api/email-templates?where[organization][equals]=${organizationId}&where[isActive][equals]=true&limit=100`,
          { credentials: 'include' },
        )
        const data = (await res.json()) as { docs?: EmailTemplate[] }
        setEmailTemplates(data.docs ?? [])
      } catch (err) {
        console.error('Failed to load email templates', err)
        setEmailTemplates([])
      } finally {
        setLoadingEmail(false)
      }
    }

    const fetchImage = async () => {
      setLoadingImage(true)
      try {
        const res = await fetch(
          `/api/load-image-templates?organization=${organizationId}`,
          { credentials: 'include' },
        )
        const data = (await res.json()) as { templates?: ImageTemplate[] }
        setImageTemplates(data.templates ?? [])
      } catch (err) {
        console.error('Failed to load image templates', err)
        setImageTemplates([])
      } finally {
        setLoadingImage(false)
      }
    }

    void fetchEmail()
    void fetchImage()
  }, [open, organizationId])

  const isBusy = busyTemplateId !== null

  const handleSendEmail = async (template: EmailTemplate) => {
    if (!organizationId) return
    setBusyTemplateId(String(template.id))
    setResult(null)
    setEmailProgress(null)

    try {
      const res = await fetch('/api/send-manual-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          organizationId,
          participantIds,
        }),
      })

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'progress') {
              setEmailProgress({
                sentCount: data.sentCount,
                totalCount: data.totalCount,
                successCount: data.successCount,
                failureCount: data.failureCount,
                currentEmail: data.currentEmail,
              })
            } else if (data.type === 'complete') {
              const total = data.summary?.total ?? participantIds.length
              const successful = data.summary?.successful ?? 0
              const failed = data.summary?.failed ?? 0
              if (data.success && failed === 0) {
                setResult({
                  kind: 'success',
                  message: `Sent ${successful} of ${total} email${total !== 1 ? 's' : ''}.`,
                })
              } else if (successful > 0) {
                setResult({
                  kind: 'partial',
                  message: `Sent ${successful} of ${total}; ${failed} failed.`,
                  details: 'Check email logs for details.',
                })
              } else {
                setResult({
                  kind: 'error',
                  message: 'Failed to send emails.',
                  details: data.error || data.results?.[0]?.error,
                })
              }
            }
          } catch (e) {
            console.error('Failed to parse SSE chunk', e)
          }
        }
      }
    } catch (err) {
      setResult({
        kind: 'error',
        message: 'Failed to send emails',
        details: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setBusyTemplateId(null)
    }
  }

  const handleGenerateImage = async (template: ImageTemplate) => {
    setBusyTemplateId(String(template.id))
    setResult(null)
    setImageProgress({ current: 0, total: participantIds.length })

    try {
      const [{ ClientImageGenerationService }, { ClientZipArchiveService }] = await Promise.all([
        import('@/services/clientImageGeneration'),
        import('@/services/clientZipArchive'),
      ])

      // Fetch participants with depth=2 for variable substitution
      const participants = await Promise.all(
        participantIds.map((id) =>
          fetch(`/api/participants/${id}?depth=2`, { credentials: 'include' }).then((r) =>
            r.json(),
          ),
        ),
      )

      const imageService = new ClientImageGenerationService()
      const zipService = new ClientZipArchiveService()

      const generatedImages = await imageService.generateImages(
        participants,
        template as any,
        (current, total) => setImageProgress({ current, total }),
      )

      const successful = generatedImages.filter((img: any) => img.success)
      const failed = generatedImages.filter((img: any) => !img.success)

      if (successful.length === 0) {
        setResult({
          kind: 'error',
          message: 'Failed to generate any images.',
          details: failed[0]?.error,
        })
        return
      }

      // Download
      const triggerDownload = (blob: Blob, fileName: string) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      if (successful.length === 1) {
        triggerDownload(successful[0].blob, successful[0].fileName)
      } else {
        const zipBlob = await zipService.createZip(
          successful.map((img: any) => ({ blob: img.blob, fileName: img.fileName })),
        )
        const zipName = zipService.generateZipFilename(template.name)
        triggerDownload(zipBlob, zipName)
      }

      if (failed.length === 0) {
        setResult({
          kind: 'success',
          message: `Generated ${successful.length} image${successful.length !== 1 ? 's' : ''}.`,
          details:
            successful.length > 1 ? 'Downloaded as ZIP.' : `Downloaded ${successful[0].fileName}.`,
        })
      } else {
        setResult({
          kind: 'partial',
          message: `Generated ${successful.length} of ${successful.length + failed.length}.`,
          details: `${failed.length} failed.`,
        })
      }
    } catch (err) {
      setResult({
        kind: 'error',
        message: 'Image generation failed',
        details: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setBusyTemplateId(null)
    }
  }

  const count = participantIds.length

  return (
    <Sheet open={open} onOpenChange={(o) => (!isBusy || o ? onOpenChange(o) : null)}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0"
      >
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle>Generate with Prevema</SheetTitle>
          <SheetDescription>
            Generating for {count} participant{count !== 1 ? 's' : ''}.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'email' | 'image')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">
                <Mail className="size-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger value="image">
                <ImageIcon className="size-4 mr-2" />
                Image
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="mt-4 space-y-2">
              {loadingEmail ? (
                <LoadingState label="Loading email templates…" />
              ) : emailTemplates.length === 0 ? (
                <EmptyState message="No active email templates for this organization." />
              ) : (
                emailTemplates.map((t) => (
                  <TemplateRow
                    key={t.id}
                    title={t.name}
                    subtitle={t.subject || t.description}
                    actionLabel="Send"
                    onAction={() => handleSendEmail(t)}
                    disabled={isBusy}
                    busy={busyTemplateId === String(t.id)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="image" className="mt-4 space-y-2">
              {loadingImage ? (
                <LoadingState label="Loading image templates…" />
              ) : imageTemplates.length === 0 ? (
                <EmptyState message="No image templates for this organization." />
              ) : (
                imageTemplates.map((t) => (
                  <TemplateRow
                    key={t.id}
                    title={t.name}
                    subtitle={
                      t.width && t.height ? `${t.width} × ${t.height} px` : undefined
                    }
                    preview={t.previewImage || undefined}
                    actionLabel="Generate"
                    onAction={() => handleGenerateImage(t)}
                    disabled={isBusy}
                    busy={busyTemplateId === String(t.id)}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>

          {emailProgress && (
            <ProgressBlock
              label={`Sending ${emailProgress.sentCount} of ${emailProgress.totalCount}`}
              current={emailProgress.sentCount}
              total={emailProgress.totalCount}
              successCount={emailProgress.successCount}
              failureCount={emailProgress.failureCount}
            />
          )}

          {imageProgress && busyTemplateId && (
            <ProgressBlock
              label={`Generating ${imageProgress.current} of ${imageProgress.total}`}
              current={imageProgress.current}
              total={imageProgress.total}
            />
          )}

          {result && <ResultBlock result={result} />}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
      <Loader2 className="size-4 animate-spin" />
      <span>{label}</span>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/20 dark:text-yellow-200">
      <AlertCircle className="size-4 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

interface TemplateRowProps {
  title: string
  subtitle?: string
  preview?: string
  actionLabel: string
  onAction: () => void
  disabled?: boolean
  busy?: boolean
}

function TemplateRow({
  title,
  subtitle,
  preview,
  actionLabel,
  onAction,
  disabled,
  busy,
}: TemplateRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border p-3">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          className="size-12 shrink-0 rounded object-cover bg-muted"
        />
      ) : (
        <div className="flex size-12 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
          <ImageIcon className="size-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <Button size="sm" onClick={onAction} disabled={disabled}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : actionLabel}
      </Button>
    </div>
  )
}

function ProgressBlock({
  label,
  current,
  total,
  successCount,
  failureCount,
}: {
  label: string
  current: number
  total: number
  successCount?: number
  failureCount?: number
}) {
  const pct = total > 0 ? (current / total) * 100 : 0
  return (
    <div className="space-y-2 rounded-md border bg-secondary/40 p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{Math.round(pct)}%</span>
      </div>
      <Progress value={pct} className="h-2" />
      {(successCount !== undefined || failureCount !== undefined) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {successCount !== undefined && successCount > 0 && (
            <Badge variant="secondary" className="text-green-700 dark:text-green-400">
              {successCount} successful
            </Badge>
          )}
          {failureCount !== undefined && failureCount > 0 && (
            <Badge variant="secondary" className="text-red-700 dark:text-red-400">
              {failureCount} failed
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

function ResultBlock({ result }: { result: RunResult }) {
  const Icon =
    result.kind === 'success'
      ? CheckCircle2
      : result.kind === 'partial'
        ? AlertCircle
        : XCircle
  const cls =
    result.kind === 'success'
      ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/20 dark:text-green-200'
      : result.kind === 'partial'
        ? 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/20 dark:text-yellow-200'
        : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/20 dark:text-red-200'
  return (
    <div className={`flex items-start gap-2 rounded-md border p-3 text-sm ${cls}`}>
      <Icon className="size-4 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="font-medium">{result.message}</p>
        {result.details && <p className="text-xs mt-1 opacity-80">{result.details}</p>}
      </div>
    </div>
  )
}
