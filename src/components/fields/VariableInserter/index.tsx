'use client'

import React, { useState } from 'react'
import { getAllVariables } from '@/services/emailVariables'

/**
 * Variable Inserter Component
 * Provides quick-insert buttons for ALL variables above the rich text editor
 * Users can click to copy variables to clipboard for pasting into the editor
 */
export const VariableInserterField: React.FC = () => {
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null)

  // Show ALL variables (complete reference for quick insertion)
  const variableGroups = getAllVariables()

  // Flatten all variables with unique keys by combining group label and variable key
  const allVariables = variableGroups.flatMap((group) =>
    group.variables.map((variable) => ({
      ...variable,
      uniqueKey: `${group.label}-${variable.key}`,
    })),
  )

  const copyToClipboard = (variableKey: string) => {
    const variableText = `{{${variableKey}}}`
    navigator.clipboard.writeText(variableText).then(() => {
      setCopiedVariable(variableKey)
      setTimeout(() => setCopiedVariable(null), 2000)
    })
  }

  return (
    <div className="mb-6 p-6 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center mb-5">
        <span className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-lg">📋</span>
          Quick Insert Variables
        </span>
        <span className="ml-3 text-xs text-gray-500 italic">
          Click to copy, then paste into content
        </span>
      </div>

      {/* All Variables */}
      <div className="flex flex-wrap gap-3">
        {allVariables.map((variable) => {
          const isCopied = copiedVariable === variable.key
          return (
            <button
              key={variable.uniqueKey}
              type="button"
              onClick={() => copyToClipboard(variable.key)}
              className={`group relative px-5 py-3 rounded-xl text-sm font-mono font-medium transition-all duration-300 ${
                isCopied
                  ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-200/50 scale-105'
                  : 'bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 text-gray-700 hover:from-blue-50 hover:to-blue-100 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-200/50 hover:scale-105 hover:-translate-y-0.5 active:scale-100 active:translate-y-0'
              }`}
              title={variable.description}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                {isCopied && <span className="text-emerald-600">✓</span>}
                <span className={isCopied ? 'font-semibold' : ''}>
                  {'{{' + variable.key + '}}'}
                </span>
              </span>
              {!isCopied && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/10 group-hover:to-purple-400/10 transition-all duration-300" />
              )}
            </button>
          )
        })}
      </div>

      {/* Help Text */}
      <div className="mt-5 pt-4 border-t border-gray-200 text-xs text-gray-600 leading-relaxed">
        <span className="inline-flex items-center gap-1.5">
          <span className="text-sm">💡</span>
          <strong className="font-semibold">Tip:</strong>
        </span>{' '}
        Click a variable to copy it, then paste it anywhere in your subject or email content. You
        can also type variables manually using the{' '}
        <code className="bg-gray-200 px-2 py-1 rounded text-[11px] font-mono">
          {'{{variableName}}'}
        </code>{' '}
        syntax.
      </div>
    </div>
  )
}
