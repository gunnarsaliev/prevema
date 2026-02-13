'use client'

import { Check } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

const Pricing3 = () => {
  const [isYearly, setIsYearly] = useState(false)
  return (
    <section className="bg-background py-32">
      <div className="container">
        <div className="flex flex-col items-center text-center">
          <h2 className="mb-6 text-pretty text-4xl font-bold lg:text-6xl">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground lg:text-xl">
            Choose the perfect plan for your event planning needs. Scale as you grow.
          </p>
          <div className="mt-10 flex items-center gap-3 font-medium">
            <Switch onCheckedChange={() => setIsYearly(!isYearly)} checked={isYearly} />
            Annual billing (save 20%)
          </div>
        </div>
        <div className="mt-20 grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex flex-col justify-between gap-10 rounded-lg border p-6">
              <div>
                <p className="mb-2 text-lg font-semibold">Starter</p>
                <p className="mb-4 text-4xl font-semibold">
                  €29<span className="text-muted-foreground ml-1 text-sm font-normal">/month</span>
                </p>
                <p className="text-muted-foreground text-sm">
                  Perfect for small events and teams getting started. Try free for 14 days.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <a href="/admin">Start Free Trial</a>
              </Button>
            </div>
            <ul className="mt-8 px-6">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0" />
                <p className="text-muted-foreground text-sm">
                  <span className="text-primary mr-1 font-semibold">Up to 3 team members</span>
                </p>
              </li>
              <Separator className="my-4" />
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0" />
                <p className="text-muted-foreground text-sm">
                  <span className="text-primary mr-1 font-semibold">2 active events</span>
                </p>
              </li>
              <Separator className="my-4" />
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0" />
                <p className="text-muted-foreground text-sm">
                  <span className="text-primary mr-1 font-semibold">
                    Custom forms & email campaigns
                  </span>
                </p>
              </li>
              <Separator className="my-4" />
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0" />
                <p className="text-muted-foreground text-sm">
                  <span className="text-primary mr-1 font-semibold">Basic automations</span>
                </p>
              </li>
            </ul>
          </div>
          <div>
            <div className="flex flex-col justify-between gap-10 rounded-lg border p-6">
              <div>
                <p className="mb-2 text-lg font-semibold">Professional</p>
                <p className="mb-4 text-4xl font-semibold">
                  {isYearly ? '€79' : '€99'}
                  <span className="text-muted-foreground ml-1 text-sm font-normal">/month</span>
                </p>
                <p className="text-muted-foreground text-sm">
                  For growing teams managing multiple events. All features included.
                </p>
              </div>
              <Button className="w-full" style={{ backgroundColor: '#cebe06', color: '#000' }}>
                Try for Free
              </Button>
            </div>
            <ul className="mt-8 px-6">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0" />
                <p className="text-muted-foreground text-sm">
                  <span className="text-primary mr-1 font-semibold">Unlimited team members</span>
                </p>
              </li>
              <Separator className="my-4" />
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0" />
                <p className="text-muted-foreground text-sm">
                  <span className="text-primary mr-1 font-semibold">Unlimited events</span>
                </p>
              </li>
              <Separator className="my-4" />
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0" />
                <p className="text-muted-foreground text-sm">
                  <span className="text-primary mr-1 font-semibold">
                    AI-powered email templates
                  </span>
                </p>
              </li>
              <Separator className="my-4" />
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0" />
                <p className="text-muted-foreground text-sm">
                  <span className="text-primary mr-1 font-semibold">
                    Advanced automations & design tools
                  </span>
                </p>
              </li>
              <Separator className="my-4" />
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0" />
                <p className="text-muted-foreground text-sm">
                  <span className="text-primary mr-1 font-semibold">Custom domain emails</span>
                </p>
              </li>
              <Separator className="my-4" />
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0" />
                <p className="text-muted-foreground text-sm">
                  <span className="text-primary mr-1 font-semibold">Priority support</span>
                </p>
              </li>
            </ul>
          </div>
          <div>
            <div className="flex flex-col justify-between gap-10 rounded-lg border p-6">
              <div>
                <p className="mb-2 text-lg font-semibold">Enterprise</p>
                <p className="mb-4 text-4xl font-semibold">Custom</p>
                <p className="text-muted-foreground text-sm">
                  For large organizations and agencies managing multiple teams and events.
                </p>
              </div>
              <Button variant="outline" className="w-full">
                Contact Sales
              </Button>
            </div>
            <ul className="mt-8 px-6">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0" />
                <p className="text-muted-foreground text-sm">
                  <span className="text-primary mr-1 font-semibold">
                    Everything in Professional
                  </span>
                </p>
              </li>
              <Separator className="my-4" />
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0" />
                <p className="text-muted-foreground text-sm">
                  <span className="text-primary mr-1 font-semibold">Multi-team management</span>
                </p>
              </li>
              <Separator className="my-4" />
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0" />
                <p className="text-muted-foreground text-sm">
                  <span className="text-primary mr-1 font-semibold">Dedicated account manager</span>
                </p>
              </li>
              <Separator className="my-4" />
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0" />
                <p className="text-muted-foreground text-sm">
                  <span className="text-primary mr-1 font-semibold">
                    Custom integrations & API access
                  </span>
                </p>
              </li>
              <Separator className="my-4" />
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0" />
                <p className="text-muted-foreground text-sm">
                  <span className="text-primary mr-1 font-semibold">24/7 priority support</span>
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export { Pricing3 }
