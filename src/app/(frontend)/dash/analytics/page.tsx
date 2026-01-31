import { SidebarInset } from '@/components/ui/sidebar'
import { ChartGroup12 } from '@/components//chart-group12'

export default function Analytics() {
  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Analytics</h1>
            <ChartGroup12 />
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
