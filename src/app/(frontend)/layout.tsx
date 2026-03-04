import React from 'react'
import './styles.css'
import { ThemeProvider } from '@/components/theme-provider'
import { HeroUIProvider } from '@heroui/react'
import { AuthProvider } from '@/providers/Auth'
import { Navbar17 } from '@/components/navbar17'
import { Footer16 } from '@/components/footer16'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  description: 'Event communication platform',
  title: 'Prevema',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <HeroUIProvider>
            <AuthProvider>
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* <Navbar17 /> */}
                {children}
                {/* <Footer16 /> */}
              </main>
            </AuthProvider>
          </HeroUIProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
