import React from 'react'
import './styles.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Navbar17 } from '@/components/navbar17'
import { Footer16 } from '@/components/footer16'

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
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Navbar17 />
            {children}
            <Footer16 />
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
