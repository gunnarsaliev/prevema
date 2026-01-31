import { SidebarInset } from '@/components/ui/sidebar'

export default function Assets() {
  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Assets</h1>
            <p className="text-muted-foreground">View your assets and insights here!</p>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
