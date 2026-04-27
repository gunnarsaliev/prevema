import '@/app/(frontend)/styles.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s - Catalyst',
    default: 'Catalyst',
  },
  description: '',
}

export default async function TwLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
