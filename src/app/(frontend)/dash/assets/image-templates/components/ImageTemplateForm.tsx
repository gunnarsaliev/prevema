'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import {
  imageTemplateSchema,
  type ImageTemplateFormValues,
} from '@/lib/schemas/imageTemplate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

type Props =
  | { mode: 'create' }
  | { mode: 'edit'; templateId: string; defaultValues: ImageTemplateFormValues }

export function ImageTemplateForm(props: Props) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const defaultValues: Partial<ImageTemplateFormValues> =
    props.mode === 'edit'
      ? props.defaultValues
      : {
          name: '',
          usageType: 'participant',
          isActive: true,
          width: 800,
          height: 600,
          backgroundColor: '#ffffff',
          elements: '[]',
        }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<ImageTemplateFormValues>({
    resolver: zodResolver(imageTemplateSchema),
    defaultValues,
    mode: 'onBlur',
  })

  const onSubmit = async (values: ImageTemplateFormValues) => {
    setServerError(null)
    try {
      const url =
        props.mode === 'edit'
          ? `/api/image-templates/${props.templateId}`
          : '/api/image-templates'
      const method = props.mode === 'edit' ? 'PATCH' : 'POST'

      // Parse elements JSON string to object
      let elementsObject
      try {
        elementsObject = JSON.parse(values.elements)
      } catch {
        setServerError('Elements must be valid JSON')
        return
      }

      const payload = {
        name: values.name,
        usageType: values.usageType,
        isActive: values.isActive,
        width: values.width,
        height: values.height,
        backgroundImage: values.backgroundImage,
        backgroundColor: values.backgroundColor,
        elements: elementsObject,
        previewImage: values.previewImage,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const message =
          data?.errors?.[0]?.message ?? data?.error ?? `Request failed (${res.status})`
        throw new Error(message)
      }

      router.push('/dash/assets/image-templates')
      router.refresh()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Unexpected error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      {serverError && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {serverError}
        </p>
      )}

      {/* Basic Information */}
      <FieldSet>
        <FieldLegend>Basic Information</FieldLegend>
        <FieldGroup>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Template name *</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="bg-background"
                  placeholder="Business Card - Blue Theme"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="usageType"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="usageType">Usage type *</FieldLabel>
                <p className="text-xs text-muted-foreground -mt-1">
                  Who this template is designed for
                </p>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="usageType" ref={field.ref} aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Select usage type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="participant">Participants</SelectItem>
                    <SelectItem value="partner">Partners</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive" className="text-base">
                    Active
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Whether this template is active and can be used
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />
        </FieldGroup>
      </FieldSet>

      {/* Canvas Settings */}
      <FieldSet>
        <FieldLegend>Canvas Settings</FieldLegend>
        <FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="width"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Width (px) *</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    min={1}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-invalid={fieldState.invalid}
                    className="bg-background"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="height"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Height (px) *</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    min={1}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-invalid={fieldState.invalid}
                    className="bg-background"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <Controller
            name="backgroundColor"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Background color</FieldLabel>
                <p className="text-xs text-muted-foreground -mt-1">
                  Hex color code (e.g., #ffffff)
                </p>
                <div className="flex gap-2">
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="bg-background"
                    placeholder="#ffffff"
                  />
                  <Input
                    type="color"
                    value={field.value ?? '#ffffff'}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-20"
                  />
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      {/* Template Data */}
      <FieldSet>
        <FieldLegend>Template Data</FieldLegend>
        <FieldGroup>
          <Controller
            name="elements"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Elements (JSON) *</FieldLabel>
                <p className="text-xs text-muted-foreground -mt-1">
                  Canvas elements array with coordinates, text properties, and image URLs
                </p>
                <Textarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="bg-background font-mono text-sm"
                  placeholder='[{"type": "text", "content": "{{name}}", "x": 100, "y": 100}]'
                  rows={12}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {props.mode === 'edit' ? 'Save changes' : 'Create template'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dash/assets/image-templates')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
