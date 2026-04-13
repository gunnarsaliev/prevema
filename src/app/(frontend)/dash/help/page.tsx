import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { TopBar } from '@/components/shared/TopBar'
import {
  HelpCircle,
  Users,
  Handshake,
  Calendar,
  Settings,
  Mail,
  Image,
  BookOpen,
  MessageCircle,
  ChevronDown,
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const helpCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of using Prevema',
    icon: BookOpen,
    href: '#getting-started',
  },
  {
    id: 'events',
    title: 'Events',
    description: 'Managing your events and event settings',
    icon: Calendar,
    href: '#events',
  },
  {
    id: 'participants',
    title: 'Participants',
    description: 'Managing event attendees and roles',
    icon: Users,
    href: '#participants',
  },
  {
    id: 'partners',
    title: 'Partners',
    description: 'Managing sponsors and partners',
    icon: Handshake,
    href: '#partners',
  },
  {
    id: 'email',
    title: 'Email & Communication',
    description: 'Email templates and bulk messaging',
    icon: Mail,
    href: '#email',
  },
  {
    id: 'image-generator',
    title: 'Image Generator',
    description: 'Create promotional images and assets',
    icon: Image,
    href: '#image-generator',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Account, organization and preferences',
    icon: Settings,
    href: '#settings',
  },
]

const faqs = [
  {
    question: 'How do I create a new event?',
    answer:
      'Navigate to the Events page from the sidebar, then click the "New Event" button in the top right. Fill in the event details including name, description, dates, and location, then save.',
  },
  {
    question: 'How do I add participants to an event?',
    answer:
      'Go to the Participants page, click "New participant" and fill in their details. You can also import participants in bulk or assign them to specific events and roles.',
  },
  {
    question: 'What are participant roles?',
    answer:
      'Participant roles define the type of attendee (e.g., Speaker, Attendee, VIP). You can create custom roles with specific permissions and attributes for your event.',
  },
  {
    question: 'How do I manage partners and sponsors?',
    answer:
      'Use the Partners page to add sponsors and partners. You can categorize them by type and tier, track their status, and generate promotional materials for them.',
  },
  {
    question: 'Can I send bulk emails to participants?',
    answer:
      'Yes! Select multiple participants using the checkboxes, then choose "Send Email" from the bulk actions menu. You can use email templates for consistent messaging.',
  },
  {
    question: 'How does the image generator work?',
    answer:
      'The image generator creates promotional graphics using your event branding and participant/partner data. Select the people you want to include, choose a template, and generate customized images.',
  },
  {
    question: 'How do I change my organization settings?',
    answer:
      'Click on your avatar in the top right corner, then select "Organization" from the dropdown menu. Here you can manage organization details, members, and billing.',
  },
  {
    question: 'What are the different user roles?',
    answer:
      'Prevema has several roles: Owner (full control), Admin (can manage most things), Editor (can create and edit content), and Viewer (read-only access).',
  },
]

async function HelpPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <TopBar
        title="Help Center"
        description="Find answers and get support"
      />

      <div className="flex-1 overflow-auto bg-muted/20 dark:bg-background">
        <div className="px-8 py-8 max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8 text-center">
            <HelpCircle className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="text-3xl font-bold mb-2">How can we help you?</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Browse our help categories or search through frequently asked questions to find the
              information you need.
            </p>
          </div>

          {/* Help Categories Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {helpCategories.map((category) => {
              const Icon = category.icon
              return (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                    </div>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link href={category.href}>Learn more</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* FAQ Section */}
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Contact Support Card */}
            <div>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Need more help?</CardTitle>
                  </div>
                  <CardDescription>
                    Can&apos;t find what you&apos;re looking for? Contact our support team.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link href="/dash/contact">Contact Support</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dash/about">About Prevema</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpPage
