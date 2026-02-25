'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ScrollArea } from './ui/scroll-area'

const COLLECTION_SLUGS = [
  'users',
  'teams',
  'events',
  'participant-types',
  'participants',
  'partner-types',
  'partner-tiers',
  'partners',
  'invitations',
  'email-templates',
  'email-logs',
  'media',
  'image-templates',
]

export default function CollectionSlugs() {
  useEffect(() => {
    console.log('=== Collection Slugs ===')
    COLLECTION_SLUGS.forEach((slug, index) => {
      console.log(`${index + 1}. ${slug}`)
    })
    console.log('========================')
  }, [])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Collection Slugs</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full">
          <div className="space-y-1">
            {COLLECTION_SLUGS.map((slug, index) => (
              <div
                key={slug}
                className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors"
              >
                <span className="text-xs text-muted-foreground">
                  {index + 1}.
                </span>
                <span className="text-xs font-mono flex-1 ml-2">{slug}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Total: {COLLECTION_SLUGS.length} collections
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
