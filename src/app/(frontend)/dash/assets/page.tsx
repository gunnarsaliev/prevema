import Link from 'next/link'
import { Mail, Image } from 'lucide-react'
import { SidebarInset } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Assets() {
  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Assets</h1>
              <p className="text-muted-foreground">Manage your email and image templates</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Link href="/dash/assets/email-templates">
                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Mail className="size-5" />
                      <CardTitle>Email Templates</CardTitle>
                    </div>
                    <CardDescription>
                      Create and manage email templates for your events
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/dash/assets/image-templates">
                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Image className="size-5" />
                      <CardTitle>Image Templates</CardTitle>
                    </div>
                    <CardDescription>
                      Design and manage image templates for social media
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
