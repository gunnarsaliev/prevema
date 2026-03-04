'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Contact2Props {
  title?: string
  description?: string
  phone?: string
  email?: string
  web?: { label: string; url: string }
}

const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message is too long'),
})

type ContactFormData = z.infer<typeof contactFormSchema>

const Contact2 = ({
  title = 'Get in Touch',
  description = "Have questions about Prevema? Want to see a demo or discuss your event communication needs? We're here to help you level up your pre-event communication.",
  phone = '+359 88 221 5870',
  email = 'info@prevema.com',
  web = { label: 'prevema.com', url: 'https://prevema.com' },
}: Contact2Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Message sent successfully!', {
          description: "We'll get back to you as soon as possible.",
        })
        reset()
      } else {
        toast.error('Failed to send message', {
          description: result.error || 'Please try again later.',
        })
      }
    } catch (error) {
      console.error('Contact form error:', error)
      toast.error('Failed to send message', {
        description: 'Please try again later or contact us directly.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-32">
      <div className="container">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 lg:flex-row lg:gap-20">
          <div className="mx-auto flex max-w-sm flex-col justify-between gap-10">
            <div className="text-center lg:text-left">
              <h1 className="mb-2 text-5xl font-semibold lg:mb-1 lg:text-6xl">{title}</h1>
              <p className="text-muted-foreground">{description}</p>
            </div>
            <div className="mx-auto w-fit lg:mx-0">
              <h3 className="mb-6 text-center text-2xl font-semibold lg:text-left">
                Contact Details
              </h3>
              <ul className="ml-4 list-disc">
                <li>
                  <span className="font-bold">Phone: </span>
                  {phone}
                </li>
                <li>
                  <span className="font-bold">Email: </span>
                  <a href={`mailto:${email}`} className="underline">
                    {email}
                  </a>
                </li>
                <li>
                  <span className="font-bold">Web: </span>
                  <a href={web.url} target="_blank" className="underline">
                    {web.label}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto flex max-w-3xl flex-col gap-6 rounded-lg border p-10"
          >
            <div className="flex gap-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  id="firstName"
                  placeholder="First Name"
                  {...register('firstName')}
                  className={errors.firstName ? 'border-destructive' : ''}
                />
                {errors.firstName && (
                  <span className="text-destructive text-xs">{errors.firstName.message}</span>
                )}
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  id="lastName"
                  placeholder="Last Name"
                  {...register('lastName')}
                  className={errors.lastName ? 'border-destructive' : ''}
                />
                {errors.lastName && (
                  <span className="text-destructive text-xs">{errors.lastName.message}</span>
                )}
              </div>
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                type="email"
                id="email"
                placeholder="Email"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <span className="text-destructive text-xs">{errors.email.message}</span>
              )}
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="subject">
                Subject <span className="text-destructive">*</span>
              </Label>
              <Input
                type="text"
                id="subject"
                placeholder="Subject"
                {...register('subject')}
                className={errors.subject ? 'border-destructive' : ''}
              />
              {errors.subject && (
                <span className="text-destructive text-xs">{errors.subject.message}</span>
              )}
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="message">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder="Type your message here."
                id="message"
                rows={6}
                {...register('message')}
                className={errors.message ? 'border-destructive' : ''}
              />
              {errors.message && (
                <span className="text-destructive text-xs">{errors.message.message}</span>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              style={{ backgroundColor: '#cebe06', color: '#000' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}

export { Contact2 }
