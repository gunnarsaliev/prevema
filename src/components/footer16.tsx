import { Facebook, Github, Linkedin, Twitter } from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

const SOCIAL_LINKS = [
  {
    icon: Github,
    href: '#',
  },
  {
    icon: Linkedin,
    href: '#',
  },
  {
    icon: Facebook,
    href: '#',
  },
  {
    icon: Twitter,
    href: '#',
  },
]

const NAVIGATION = [
  {
    title: 'Features',
    links: [
      { name: 'Custom Forms', href: '#' },
      { name: 'Email Campaigns', href: '#' },
      { name: 'Smart Automations', href: '#' },
      { name: 'AI Templates', href: '#' },
      { name: 'Design Tools', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Help Center', href: '#' },
      { name: 'Documentation', href: '#' },
      { name: 'Tutorials', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Updates', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'Security', href: '#' },
    ],
  },
]

const Footer16 = () => {
  return (
    <section className="pt-32">
      <footer className="container">
        <div className="grid gap-10 pb-6 md:grid-cols-2 md:pb-0">
          <div className="flex flex-col justify-start gap-8">
            {/* Logo */}
            <a href="/" className="flex flex-col gap-2">
              <img src="https://asset.cooksa.com/prevema.svg" alt="Prevema" className="h-8 w-8" />
              <p className="text-muted-foreground text-sm">
                Your All-in-One Event Planning Powerhouse
              </p>
            </a>
            <div className="flex items-center justify-start gap-4 md:flex-row">
              {SOCIAL_LINKS.map((item, i) => (
                <Button key={`social-link-${i}`} size="icon" variant="secondary">
                  <a href={item.href}>
                    <item.icon className="size-4 lg:size-5" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
          <div>
            <div className="hidden md:flex md:gap-10 lg:gap-24 xl:gap-32">
              {NAVIGATION.map((section) => (
                <div className="flex flex-col gap-4" key={section.title}>
                  <h6 className="text-foreground mb-2 text-sm font-semibold uppercase">
                    {section.title}
                  </h6>
                  {section.links.map((link) => (
                    <a
                      className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors duration-200 ease-in-out"
                      key={link.name}
                      href={link.href}
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              ))}
            </div>
            <div className="md:hidden">
              <Accordion type="single" collapsible className="w-full">
                {NAVIGATION.map((section, i) => (
                  <AccordionItem value={`item-${i}`} key={section.title}>
                    <AccordionTrigger className="text-foreground py-4 text-sm uppercase hover:no-underline">
                      {section.title}
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-2">
                      {section.links.map((link) => (
                        <a
                          className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors duration-200 ease-in-out"
                          key={link.name}
                          href={link.href}
                        >
                          {link.name}
                        </a>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
        <div className="border-border mt-8 border-t pt-6 mb-20">
          <p className="text-muted-foreground text-center text-sm">
            © {new Date().getFullYear()} Prevema. All rights reserved.
          </p>
        </div>
      </footer>
    </section>
  )
}

export { Footer16 }
