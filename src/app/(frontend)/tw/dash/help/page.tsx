'use client'

import { Mail, MessageSquare, Phone, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface FAQ {
  question: string
  answer: string
  category: string
}

interface Help2Props {
  title?: string
  description?: string
  faqs?: FAQ[]
  contactTitle?: string
  contactDescription?: string
  className?: string
}

const DEFAULT_FAQS: FAQ[] = [
  {
    category: 'Orders',
    question: 'How can I track my order?',
    answer:
      "You can track your order by logging into your account and viewing your order history. You'll also receive tracking updates via email once your order ships.",
  },
  {
    category: 'Orders',
    question: 'Can I modify or cancel my order?',
    answer:
      "Orders can be modified or cancelled within 1 hour of placement. After that, please contact our support team and we'll do our best to help.",
  },
  {
    category: 'Shipping',
    question: 'What are your shipping options?',
    answer:
      'We offer standard shipping (5-7 business days), express shipping (2-3 business days), and next-day delivery in select areas.',
  },
  {
    category: 'Shipping',
    question: 'Do you ship internationally?',
    answer:
      'Yes! We ship to over 50 countries worldwide. International shipping rates and delivery times vary by location.',
  },
  {
    category: 'Returns',
    question: 'What is your return policy?',
    answer:
      'We offer free returns within 30 days of delivery. Items must be unworn, unwashed, and in original condition with tags attached.',
  },
  {
    category: 'Returns',
    question: 'How do I start a return?',
    answer:
      "Log into your account, go to Order History, select the item you want to return, and follow the prompts. You'll receive a prepaid shipping label via email.",
  },
]

const Help2 = ({
  title = 'How Can We Help?',
  description = 'Find answers to common questions or contact our support team.',
  faqs = DEFAULT_FAQS,
  contactTitle = 'Still need help?',
  contactDescription = 'Our support team is here for you.',
  className,
}: Help2Props) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs
    const query = searchQuery.toLowerCase()
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query),
    )
  }, [faqs, searchQuery])

  return (
    <section className={cn('py-32', className)}>
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <h1 className="mb-4 text-4xl font-medium tracking-tight md:text-5xl">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>

          <div className="relative mb-8">
            <Search className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Accordion type="single" collapsible className="mb-16">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                No results found for "{searchQuery}"
              </p>
            )}
          </Accordion>

          <div className="rounded-xl bg-muted/50 p-8">
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-xl font-semibold">{contactTitle}</h2>
              <p className="text-sm text-muted-foreground">{contactDescription}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Button variant="outline" className="w-full bg-background">
                <MessageSquare className="mr-2 size-4" />
                Live Chat
              </Button>
              <Button variant="outline" className="w-full bg-background">
                <Mail className="mr-2 size-4" />
                Email Us
              </Button>
              <Button variant="outline" className="w-full bg-background">
                <Phone className="mr-2 size-4" />
                Call Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export { Help2 }
export default Help2
