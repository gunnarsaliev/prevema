'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/16/solid'
import { Button } from '@/components/catalyst/button'
import { Divider } from '@/components/catalyst/divider'
import { Field, Label } from '@/components/catalyst/fieldset'
import { Heading, Subheading } from '@/components/catalyst/heading'
import { Select } from '@/components/catalyst/select'
import { Text } from '@/components/catalyst/text'

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt', label: 'Português' },
  { value: 'it', label: 'Italiano' },
  { value: 'ja', label: '日本語' },
  { value: 'zh', label: '中文' },
  { value: 'ar', label: 'العربية' },
] as const

const TIMEZONES = [
  { value: 'Pacific/Honolulu', label: 'Hawaii (HST, UTC−10)' },
  { value: 'America/Anchorage', label: 'Alaska (AKST, UTC−9)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT, UTC−8)' },
  { value: 'America/Denver', label: 'Mountain Time (MT, UTC−7)' },
  { value: 'America/Chicago', label: 'Central Time (CT, UTC−6)' },
  { value: 'America/New_York', label: 'Eastern Time (ET, UTC−5)' },
  { value: 'America/Sao_Paulo', label: 'Brasília (BRT, UTC−3)' },
  { value: 'Europe/London', label: 'London (GMT, UTC+0)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET, UTC+1)' },
  { value: 'Europe/Helsinki', label: 'Eastern European Time (EET, UTC+2)' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK, UTC+3)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST, UTC+4)' },
  { value: 'Asia/Karachi', label: 'Pakistan (PKT, UTC+5)' },
  { value: 'Asia/Kolkata', label: 'India (IST, UTC+5:30)' },
  { value: 'Asia/Dhaka', label: 'Bangladesh (BST, UTC+6)' },
  { value: 'Asia/Bangkok', label: 'Indochina (ICT, UTC+7)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT, UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Japan (JST, UTC+9)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST, UTC+10)' },
  { value: 'Pacific/Auckland', label: 'New Zealand (NZST, UTC+12)' },
] as const

type ThemeValue = 'light' | 'dark' | 'system'

const THEME_OPTIONS: { value: ThemeValue; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon },
  { value: 'system', label: 'System', Icon: ComputerDesktopIcon },
]

export function PreferencesForm() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState('Europe/London')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setMounted(true)
    setLanguage(localStorage.getItem('pref:language') ?? 'en')
    setTimezone(
      localStorage.getItem('pref:timezone') ??
        Intl.DateTimeFormat().resolvedOptions().timeZone ??
        'Europe/London',
    )
  }, [])

  const handleSave = () => {
    localStorage.setItem('pref:language', language)
    localStorage.setItem('pref:timezone', timezone)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    const savedLang = localStorage.getItem('pref:language') ?? 'en'
    const savedTz =
      localStorage.getItem('pref:timezone') ??
      Intl.DateTimeFormat().resolvedOptions().timeZone ??
      'Europe/London'
    setLanguage(savedLang)
    setTimezone(savedTz)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Heading>Preferences</Heading>
      <Divider className="my-10 mt-6" />

      {/* Appearance */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Appearance</Subheading>
          <Text>Choose how the interface looks for you.</Text>
        </div>
        <div>
          {mounted ? (
            <div className="grid grid-cols-3 gap-3">
              {THEME_OPTIONS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={[
                    'flex flex-col items-center gap-2 rounded-lg border px-4 py-3 text-sm transition-colors',
                    theme === value
                      ? 'border-zinc-950 bg-zinc-950/5 text-zinc-950 dark:border-white dark:bg-white/10 dark:text-white'
                      : 'border-zinc-950/10 text-zinc-500 hover:border-zinc-950/30 hover:text-zinc-700 dark:border-white/10 dark:text-zinc-400 dark:hover:border-white/30 dark:hover:text-zinc-200',
                  ].join(' ')}
                >
                  <Icon className="size-5" />
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {THEME_OPTIONS.map(({ label, Icon }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 rounded-lg border border-zinc-950/10 px-4 py-3 text-sm text-zinc-400 dark:border-white/10"
                >
                  <Icon className="size-5" />
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Language */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Language</Subheading>
          <Text>Select the language used throughout the interface.</Text>
        </div>
        <div>
          <Field>
            <Label>Interface language</Label>
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={!mounted}
            >
              {LANGUAGES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </section>

      <Divider className="my-10" soft />

      {/* Timezone */}
      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Timezone</Subheading>
          <Text>Used for displaying dates and scheduling.</Text>
        </div>
        <div>
          <Field>
            <Label>Timezone</Label>
            <Select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              disabled={!mounted}
            >
              {TIMEZONES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </section>

      <Divider className="my-10" soft />

      <div className="flex items-center justify-end gap-4">
        {saved && <Text className="text-green-600 dark:text-green-400">Preferences saved</Text>}
        <Button type="button" plain onClick={handleReset} disabled={!mounted}>
          Reset
        </Button>
        <Button type="button" onClick={handleSave} disabled={!mounted}>
          Save changes
        </Button>
      </div>
    </div>
  )
}
