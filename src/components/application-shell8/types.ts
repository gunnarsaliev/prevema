import React from 'react'

export type FolderId = 'inbox' | 'sent' | 'drafts' | 'junk' | 'trash'

export type Folder = {
  id: FolderId
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  count?: number
}

export type SidebarModule = {
  id: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export type NavItem = {
  title: string
  url: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  isActive: boolean
}

export type MailItem = {
  id: string
  name: string
  email: string
  avatar: string
  verified: boolean
  subject: string
  date: string
  teaser: string
  read: boolean
  starred: boolean
}

export type UserData = {
  name: string
  email: string
  avatar: string
}
