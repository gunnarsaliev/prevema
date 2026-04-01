import React from 'react'
import './styles.css'
import { ThemeProvider } from '@/components/theme-provider'
import { HeroUIProvider } from '@heroui/react'
import { AuthProvider } from '@/providers/Auth'
import { Toaster } from '@/components/ui/sonner'
import { GoogleTagManager } from '@next/third-parties/google'

export const metadata = {
  description: 'Event communication platform',
  title: 'Prevema',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning>
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || ''} />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <HeroUIProvider>
            <AuthProvider>{children}</AuthProvider>
          </HeroUIProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
