import type { Metadata } from 'next'
import Link from 'next/link'
import { PreferencesForm } from './PreferencesForm'

export const metadata: Metadata = {
  title: 'Preferences',
}

export default function PreferencesPage() {
  return (
    <>
      <PreferencesForm />
    </>
  )
}
