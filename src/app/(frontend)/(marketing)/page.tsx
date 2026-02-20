import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'
import { Hero187b } from '@/components/hero187b'
import { Feature102 } from '@/components/feature102'
import { Cta7 } from '@/components/cta7'
import config from '@/payload.config'
import '../styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // Redirect authenticated users to dashboard
  if (user) {
    redirect('/dash')
  }

  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  return (
    <>
      <Hero187b />
      <Feature102 />
      <Cta7 />
    </>
  )
}
