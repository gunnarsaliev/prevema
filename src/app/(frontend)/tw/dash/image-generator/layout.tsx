import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Image Template Generator',
  description: 'Create personalized images with custom templates',
}

export default function ImageGeneratorLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
