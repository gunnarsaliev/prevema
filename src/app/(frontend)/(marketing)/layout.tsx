import Footer from '@/components/layout/footer'
import { Navbar17 } from '@/components/navbar17'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-4 max-w-7xl">
      <Navbar17 />
      {children}
      {/* <Footer16 /> */}
      <Footer />
    </main>
  )
}
