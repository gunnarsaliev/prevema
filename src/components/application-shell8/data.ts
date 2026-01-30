import React from 'react'
import { Icon } from '@iconify/react'
import type { Folder, FolderId, SidebarModule, NavItem, MailItem, UserData } from './types'

export const folders: Folder[] = [
  { id: 'inbox', label: 'Inbox', icon: () => React.createElement(Icon, { icon: 'lucide:inbox' }) },
  { id: 'sent', label: 'Sent', icon: () => React.createElement(Icon, { icon: 'lucide:send' }) },
  {
    id: 'junk',
    label: 'Junk',
    icon: () => React.createElement(Icon, { icon: 'lucide:archive-x' }),
  },
  {
    id: 'trash',
    label: 'Trash',
    icon: () => React.createElement(Icon, { icon: 'lucide:trash-2' }),
  },
]

export const navTitleToFolderId: Record<string, FolderId> = {
  Inbox: 'inbox',
  Drafts: 'drafts',
  Sent: 'sent',
  Junk: 'junk',
  Trash: 'trash',
}

export const sidebarModules: SidebarModule[] = [
  {
    id: 'emails',
    label: 'Emails',
    icon: () => React.createElement(Icon, { icon: 'twemoji:letter-p' }),
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: () => React.createElement(Icon, { icon: 'lucide:dashboard-view' }),
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: () => React.createElement(Icon, { icon: 'lucide:calendar' }),
  },
  {
    id: 'contacts',
    label: 'Contacts',
    icon: () => React.createElement(Icon, { icon: 'lucide:users' }),
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: () => React.createElement(Icon, { icon: 'lucide:file-spreadsheet' }),
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: () => React.createElement(Icon, { icon: 'lucide:sticky-note' }),
  },
]

export const userData: UserData = {
  name: 'Jordan Lee',
  email: 'jordan@acme.io',
  avatar: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar1.webp',
}

export const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Inbox',
      url: '#',
      icon: () => React.createElement(Icon, { icon: 'lucide:inbox' }),
      isActive: true,
    },
    {
      title: 'Drafts',
      url: '#',
      icon: () => React.createElement(Icon, { icon: 'lucide:file' }),
      isActive: false,
    },
    {
      title: 'Sent',
      url: '#',
      icon: () => React.createElement(Icon, { icon: 'lucide:send' }),
      isActive: false,
    },
    {
      title: 'Junk',
      url: '#',
      icon: () => React.createElement(Icon, { icon: 'lucide:archive-x' }),
      isActive: false,
    },
    {
      title: 'Trash',
      url: '#',
      icon: () => React.createElement(Icon, { icon: 'lucide:trash-2' }),
      isActive: false,
    },
  ] as NavItem[],
  mails: [
    {
      id: '1',
      name: 'Sarah Mitchell',
      email: 'sarah.mitchell@acme.io',
      avatar: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar1.webp',
      verified: true,
      subject: 'Q4 Product Roadmap Review',
      date: '09:30 AM',
      teaser:
        "Hey organization, I've put together the draft roadmap for Q4 and would love your input before we finalize it next week...",
      read: false,
      starred: true,
    },
    {
      id: '2',
      name: 'GitHub',
      email: 'noreply@github.com',
      avatar: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar2.webp',
      verified: true,
      subject: '[acme/dashboard] PR #847 merged',
      date: 'Yesterday',
      teaser:
        'Your pull request has been merged into main. The CI/CD pipeline has started and deployment to staging...',
      read: true,
      starred: false,
    },
    {
      id: '3',
      name: 'Alex Thompson',
      email: 'alex.t@designstudio.co',
      avatar: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar3.webp',
      verified: true,
      subject: 'New brand assets ready for review',
      date: 'Yesterday',
      teaser:
        "Hi! The updated brand guidelines and asset library are now available. I've included the new color palette...",
      read: true,
      starred: false,
    },
    {
      id: '4',
      name: 'Stripe',
      email: 'notifications@stripe.com',
      avatar: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar4.webp',
      verified: true,
      subject: 'Your December payout has been initiated',
      date: '2 days ago',
      teaser:
        'A payout of $12,450.00 USD has been initiated to your bank account ending in •••• 4521...',
      read: true,
      starred: true,
    },
    {
      id: '5',
      name: 'Marcus Johnson',
      email: 'marcus@venturecap.fund',
      avatar: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar5.webp',
      verified: false,
      subject: 'Follow-up: Series A discussion',
      date: '3 days ago',
      teaser:
        "Great meeting you at TechCrunch Disrupt last week. I'd love to continue our conversation about your growth...",
      read: true,
      starred: false,
    },
    {
      id: '6',
      name: 'Linear',
      email: 'notifications@linear.app',
      avatar: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar6.webp',
      verified: true,
      subject: 'Weekly project digest',
      date: '3 days ago',
      teaser:
        "Here's your weekly summary: 23 issues completed, 8 in progress, 5 new issues created this week...",
      read: true,
      starred: false,
    },
    {
      id: '7',
      name: 'Emma Watson',
      email: 'emma.w@clientcorp.com',
      avatar: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar7.webp',
      verified: true,
      subject: 'Contract renewal - Action required',
      date: '4 days ago',
      teaser:
        'Our annual contract is coming up for renewal next month. I wanted to discuss the new pricing tiers...',
      read: false,
      starred: false,
    },
    {
      id: '8',
      name: 'Vercel',
      email: 'notifications@vercel.com',
      avatar: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar8.webp',
      verified: true,
      subject: 'Build failed: acme-dashboard',
      date: '4 days ago',
      teaser:
        "The latest deployment for acme-dashboard failed. Error: Module not found: Can't resolve '@/components/ui'...",
      read: true,
      starred: false,
    },
  ] as MailItem[],
}
