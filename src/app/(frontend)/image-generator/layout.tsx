import type { Metadata } from 'next'
import { ThemeProvider } from './components/theme-provider'

export const metadata: Metadata = {
  title: 'Image Template Generator',
  description: 'Create personalized images with custom templates',
}

export default function ImageGeneratorLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </ThemeProvider>
  )
}
