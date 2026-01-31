import { SidebarInset } from '@/components/ui/sidebar'

export default function Graphics() {
  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Graphics</h1>
            <p className="text-muted-foreground">Manage your graphics and media here!</p>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
