'use client'

import { useState } from 'react'
import { ImageIcon, Mail, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageTemplateCard } from '@/components/shared/ImageTemplateCard'
import { TemplateCard } from './TemplateCard'

interface Template {
  id: number
  name: string
  previewImage?: any
  updatedAt: string
  organization?: any
  isPremium?: boolean
}

interface LibraryContentProps {
  imageTemplates: Template[]
  emailTemplates: Template[]
  copiedImageIds: (number | string)[]
  copiedEmailIds: (number | string)[]
  hasOrganizations: boolean
}

export function LibraryContent({
  imageTemplates,
  emailTemplates,
  copiedImageIds,
  copiedEmailIds,
  hasOrganizations,
}: LibraryContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('images')

  const filteredImageTemplates = imageTemplates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredEmailTemplates = emailTemplates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="images" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Image Templates
            {imageTemplates.length > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">({imageTemplates.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="emails" className="gap-2">
            <Mail className="h-4 w-4" />
            Email Templates
            {emailTemplates.length > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">({emailTemplates.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="mt-0">
          {!hasOrganizations && (
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              You need to be a member of an organization to copy templates.
            </div>
          )}

          {filteredImageTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
              <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium">No image templates found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Public image templates will appear here when available'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredImageTemplates.map((template) => (
                <ImageTemplateCard
                  key={template.id}
                  template={template}
                  variant="library"
                  isAlreadyAdded={copiedImageIds.includes(template.id)}
                  hasOrganizations={hasOrganizations}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="emails" className="mt-0">
          {!hasOrganizations && (
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              You need to be a member of an organization to copy templates.
            </div>
          )}

          {filteredEmailTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
              <Mail className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium">No email templates found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Public email templates will appear here when available'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredEmailTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  type="email"
                  isAlreadyAdded={copiedEmailIds.includes(template.id)}
                  hasOrganizations={hasOrganizations}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
