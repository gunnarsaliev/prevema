'use client'

import React, { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FormError } from '@/components/forms/FormError'
import Image from 'next/image'

type ImageUploadPreviewProps = {
  id: string
  label: string
  required?: boolean
  register: any
  errors?: any
  accept?: string
  maxSizeMB?: number
}

export const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({
  id,
  label,
  required = false,
  register,
  errors,
  accept = 'image/jpeg,image/png,image/webp,image/svg+xml',
  maxSizeMB = 5,
}) => {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setValidationError(null)

    if (!file) {
      setPreview(null)
      setFileInfo(null)
      return
    }

    // Validate file type
    const acceptedTypes = accept.split(',').map((t) => t.trim())
    const fileType = file.type
    if (!acceptedTypes.includes(fileType)) {
      setValidationError('Please select a valid image file (JPEG, PNG, WebP, or SVG)')
      setPreview(null)
      setFileInfo(null)
      e.target.value = ''
      return
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setValidationError(`File size must be less than ${maxSizeMB}MB`)
      setPreview(null)
      setFileInfo(null)
      e.target.value = ''
      return
    }

    // Set file info
    setFileInfo({
      name: file.name,
      size: file.size,
    })

    // Generate preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Image
        src="https://media.motivationalbio.com/photo%20guide.jpg"
        width={1000}
        height={1000}
        alt="Profile photo guidelines"
        className="w-full rounded-md"
      />
      <div className="flex flex-col gap-4">
        <Input
          id={id}
          {...register(id, {
            required: required ? `${label} is required` : false,
            onChange: handleFileChange,
          })}
          type="file"
          accept={accept}
          className="cursor-pointer"
        />

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Accepted formats: JPEG, PNG, WebP, SVG • Max size: {maxSizeMB}MB
        </p>

        {validationError && <FormError message={validationError} />}
        {errors && <FormError message={errors.message} />}

        {preview && fileInfo && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {fileInfo.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatFileSize(fileInfo.size)}
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Ready to upload
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
