import { Footer16 } from '@/components/footer16'
import { Navbar17 } from '@/components/navbar17'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="max-w-7xl mx-auto mx-4">
      <Navbar17 />
      {children}
      <Footer16 />
    </main>
  )
}
