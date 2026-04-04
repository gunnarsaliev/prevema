import { TopBar } from '@/components/shared/TopBar'
import { ChartGroup12 } from '@/components//chart-group12'

export default function Analytics() {
  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <TopBar
        title="Analytics"
        description="View insights and performance metrics"
      />
      <div className="flex-1 overflow-auto bg-muted/20">
        <div className="p-6">
          <ChartGroup12 />
        </div>
      </div>
    </div>
  )
}
