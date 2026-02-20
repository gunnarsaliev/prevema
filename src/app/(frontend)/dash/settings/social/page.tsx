import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SocialLinksPage() {
  return (
    <div>
      <div className="p-6">
        <h2 className="text-lg font-semibold">Social Links</h2>
        <p className="text-sm text-muted-foreground">Connect your social media accounts</p>

        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter / X</Label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                x.com/
              </span>
              <Input id="twitter" className="rounded-l-none" placeholder="username" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                linkedin.com/in/
              </span>
              <Input id="linkedin" className="rounded-l-none" placeholder="username" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="github">GitHub</Label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                github.com/
              </span>
              <Input id="github" className="rounded-l-none" placeholder="username" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
        <Button variant="outline">Cancel</Button>
        <Button>Save changes</Button>
      </div>
    </div>
  )
}
