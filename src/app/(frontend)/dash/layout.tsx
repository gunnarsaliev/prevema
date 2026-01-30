import { ApplicationShell10 } from '@/components/application-shell10'

export default function DashLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ApplicationShell10 />
      {children}
    </>
  )
}
