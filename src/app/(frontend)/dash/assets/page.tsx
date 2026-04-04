import Link from 'next/link'
import { Mail, Image } from 'lucide-react'
import { TopBar } from '@/components/shared/TopBar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Assets() {
  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <TopBar
        title="Assets"
        description="Manage your email and image templates"
      />
      <div className="flex-1 overflow-auto bg-muted/20">
        <div className="p-6 space-y-6">
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
  )
}
