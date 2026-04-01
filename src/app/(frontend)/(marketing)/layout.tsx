import Footer from '@/components/layout/footer'
import { Navbar17 } from '@/components/navbar17'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Navbar17 />
      {children}
      {/* <Footer16 /> */}
      <Footer />
    </main>
  )
}
