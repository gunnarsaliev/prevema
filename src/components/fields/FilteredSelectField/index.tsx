'use client'

import React, { useMemo } from 'react'
import { useField, useFormFields, SelectInput } from '@payloadcms/ui'
import type { SelectFieldClientComponent } from 'payload'
import type { Options } from '@payloadcms/ui'

type FilteredSelectFieldProps = {
  excludeFieldPath?: string
  allOptions?: Array<{ label: string; value: string }>
}

// Helper to get label as string
const getLabelString = (label: unknown): string => {
  if (typeof label === 'string') return label
  if (label && typeof label === 'object' && 'en' in label) {
    return String((label as Record<string, unknown>).en)
  }
  return ''
}

const FilteredSelectField: SelectFieldClientComponent = (props: any) => {
  const { field, path, readOnly } = props
  const excludeFieldPath = props.excludeFieldPath
  const allOptions = props.allOptions || []

  const { value, setValue } = useField<string[]>({ path })

  // Watch the other field's value using useFormFields
  const excludedValues = useFormFields(([fields]) => {
    if (!excludeFieldPath) return []
    const excludeField = fields[excludeFieldPath]
    if (!excludeField) return []
    const excludeValue = excludeField.value
    if (Array.isArray(excludeValue)) {
      return excludeValue as string[]
    }
    return []
  })

  // Filter options to exclude values that are already selected in the other field
  const filteredOptions = useMemo(() => {
    return allOptions
      .filter((opt: any) => !excludedValues.includes(opt.value))
      .map((opt: any) => ({
        label: opt.label,
        value: opt.value,
      }))
  }, [allOptions, excludedValues])

  const handleChange = (selectedOptions: any) => {
    if (Array.isArray(selectedOptions)) {
      setValue(selectedOptions.map((opt: any) => opt.value as string))
    } else if (selectedOptions) {
      setValue([selectedOptions.value as string])
    } else {
      setValue([])
    }
  }

  // Convert current value to string array for SelectInput
  // Only show values that are still valid (not in excluded list)
  const selectedValue: string | string[] = useMemo(() => {
    if (!value || !Array.isArray(value)) return []
    return value.filter(
      (v) =>
        !excludedValues.includes(v) &&
        allOptions.filter((o: any) => o.value !== '').some((o: any) => o.value === v),
    )
  }, [value, allOptions, excludedValues])

  const labelString = getLabelString(field.label)
  const descriptionString =
    typeof field.admin?.description === 'string' ? field.admin.description : undefined

  return (
    <div className="field-type select">
      <label className="field-label">
        {labelString}
        {field.required && <span className="required">*</span>}
      </label>
      {descriptionString && (
        <div
          className="field-description"
          style={{ marginBottom: '8px', fontSize: '12px', color: '#9ca3af' }}
        >
          {descriptionString}
        </div>
      )}
      <SelectInput
        path={path}
        name={path}
        options={filteredOptions}
        value={selectedValue}
        onChange={handleChange}
        hasMany={true}
        readOnly={readOnly}
        isClearable={true}
      />
    </div>
  )
}

export default FilteredSelectField
