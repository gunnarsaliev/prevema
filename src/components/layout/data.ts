import {
  Archive,
  Bug,
  File,
  Inbox,
  Lightbulb,
  MailOpen,
  MessageSquare,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react'

export type NavItemId = 'inbox' | 'unassigned' | 'assigned' | 'drafts' | 'archived' | 'spam'

export type BucketId = 'support' | 'bugs' | 'features' | 'internal'

export type TicketStatus = 'active' | 'pending' | 'closed'

export type NavItem = {
  id: NavItemId
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  count?: number
}

export type Bucket = {
  id: BucketId
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export type User = {
  id: string
  name: string
  email: string
  avatar: string
  role?: string
}

export type Customer = {
  id: string
  name: string
  email: string
  company: string
  role: string
  avatar: string
  isHighValue: boolean
}

export type Message = {
  id: string
  sender: User | Customer
  content: string
  timestamp: string
  date: string
  isStaff: boolean
}

export type Ticket = {
  id: string
  subject: string
  preview: string
  timestamp: string
  read: boolean
  customer: Customer
  assignee?: User
  status: TicketStatus
  messages: Message[]
  respondingUser?: User
}

export type PreviousConversation = {
  id: string
  subject: string
  timestamp: string
}

export const navItems: NavItem[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, count: 6 },
  { id: 'unassigned', label: 'Unassigned', icon: MailOpen, count: 10 },
  { id: 'assigned', label: 'Assigned', icon: UserCheck, count: 3 },
  { id: 'drafts', label: 'Drafts', icon: File, count: 1 },
  { id: 'archived', label: 'Archived', icon: Archive },
  { id: 'spam', label: 'Spam', icon: Trash2 },
]

export const buckets: Bucket[] = [
  { id: 'support', label: 'Support requests', icon: MessageSquare },
  { id: 'bugs', label: 'Bug reports', icon: Bug },
  { id: 'features', label: 'Feature requests', icon: Lightbulb },
  { id: 'internal', label: 'Internal', icon: Users },
]

export const staffUsers: User[] = [
  {
    id: 'peter',
    name: 'Peter Lann',
    email: 'peter.lann@cloudstar.com',
    avatar: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar2.webp',
    role: 'Support Agent',
  },
  {
    id: 'alex',
    name: 'Alex Chen',
    email: 'alex.chen@cloudstar.com',
    avatar: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar3.webp',
    role: 'Support Agent',
  },
]

export const mockCustomers: Customer[] = [
  {
    id: 'sarah',
    name: 'Sarah Tran',
    email: 'sarah.tran@example.com',
    company: 'BrightWave Marketing',
    role: 'Ops Manager',
    avatar: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar1.webp',
    isHighValue: true,
  },
  {
    id: 'mike',
    name: 'Mike Johnson',
    email: 'mike.j@techcorp.io',
    company: 'TechCorp',
    role: 'Developer',
    avatar: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar4.webp',
    isHighValue: false,
  },
]

export const mockTickets: Ticket[] = [
  {
    id: '1',
    subject: 'Trouble connecting Slack integration',
    preview:
      'Our team is trying to connect Slack with CloudStar, but the authorization process fails with...',
    timestamp: '6h ago',
    read: false,
    customer: mockCustomers[0],
    assignee: staffUsers[0],
    status: 'active',
    respondingUser: staffUsers[0],
    messages: [
      {
        id: 'm1',
        sender: mockCustomers[0],
        content: `Hi CloudStar Support,

Our team is trying to connect Slack with CloudStar, but the authorization process fails with the following error message: "OAuth token invalid."

We've tried reconnecting a couple of times and even restarted the workspace, but no luck.

Could you help us get this integration working?

Thanks,
Sarah Tran
Ops Manager, BrightWave Marketing`,
        timestamp: '8:03 AM',
        date: 'Aug 29',
        isStaff: false,
      },
      {
        id: 'm2',
        sender: staffUsers[0],
        content: `Hi Sarah,

Thanks for reaching out — happy to help! That error usually happens when Slack doesn't grant CloudStar the right permissions during the connection step. Here are a few things to try:

1. Make sure you're logged into the correct Slack workspace before starting the connection.
2. When prompted, grant all requested permissions to CloudStar (sometimes "Deny" is clicked accidentally).
3. Try using a private/incognito browser window to rule out cached credentials.

Let me know if that helps or if you're still seeing the error!`,
        timestamp: '12:56 PM',
        date: 'Aug 29',
        isStaff: true,
      },
    ],
  },
  {
    id: '2',
    subject: 'Missing files in shared workspace',
    preview:
      'Yesterday I uploaded a set of project files to our shared workspace. Today, two of the files are no...',
    timestamp: '6h ago',
    read: false,
    customer: mockCustomers[1],
    status: 'active',
    respondingUser: staffUsers[1],
    messages: [],
  },
  {
    id: '3',
    subject: 'Billing discrepancy on latest invoice',
    preview:
      'Our invoice for this month shows 10 Pro licenses, but we only have 8 active users. Can you review...',
    timestamp: '8h ago',
    read: true,
    customer: mockCustomers[0],
    status: 'pending',
    messages: [],
  },
  {
    id: '4',
    subject: "Can't reset my password",
    preview:
      'I tried to reset my CloudStar password using the "Forgot Password" link, but the reset email never...',
    timestamp: '12h ago',
    read: true,
    customer: mockCustomers[1],
    status: 'active',
    messages: [],
  },
  {
    id: '5',
    subject: 'Dashboard analytics not updating',
    preview:
      'The analytics dashboard stopped updating yesterday around 3 PM. All charts are stuck at t...',
    timestamp: '1d ago',
    read: true,
    customer: mockCustomers[0],
    status: 'closed',
    messages: [],
  },
  {
    id: '6',
    subject: 'Request for HIPAA compliance details',
    preview:
      'Before we move forward with onboarding, our legal team would like documentation on CloudSt...',
    timestamp: '2w ago',
    read: true,
    customer: mockCustomers[1],
    status: 'pending',
    messages: [],
  },
]

export const previousConversations: PreviousConversation[] = [
  {
    id: 'prev1',
    subject: 'Trouble connecting Slack integration',
    timestamp: '6h ago',
  },
  {
    id: 'prev2',
    subject: 'API token expiry',
    timestamp: '2w ago',
  },
]
