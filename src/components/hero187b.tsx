'use client'
import Autoplay from 'embla-carousel-autoplay'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import type { CarouselApi } from '@/components/ui/carousel'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'

const SLIDES = [
  {
    image: 'https://asset.cooksa.com/calendar.gif',
    label: 'Event Dashboard',
  },
  {
    image: 'https://asset.cooksa.com/organize.gif',
    label: 'Participant Management',
  },
  {
    image: 'https://asset.cooksa.com/click.gif',
    label: 'Email Campaigns',
  },
]

const Hero187b = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [api, setApi] = useState<CarouselApi>()
  const autoplayPlugin = useRef(Autoplay({ delay: 6000, stopOnInteraction: true }))

  useEffect(() => {
    if (!api) {
      return
    }

    api.on('select', () => {
      setCurrentSlide(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <section className="relative overflow-hidden py-12">
      <div className="container">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          {/* Left side - Carousel */}
          <div className="relative order-2 lg:order-1">
            <Carousel
              className="size-full"
              setApi={setApi}
              opts={{
                loop: true,
              }}
              plugins={[autoplayPlugin.current]}
            >
              <CarouselContent>
                {SLIDES.map((slide, index) => (
                  <CarouselItem
                    key={index}
                    className="flex h-[450px] items-center justify-center overflow-hidden rounded-2xl lg:h-[600px]"
                  >
                    <img
                      src={slide.image}
                      alt={`Streamline product interface showing ${slide.label}`}
                      className="h-full w-full object-cover object-center"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            <SlideIndicator
              currentSlide={currentSlide}
              slides={SLIDES}
              className="mt-6 lg:hidden"
              api={api}
            />
          </div>

          {/* Right side - Content */}
          <div className="order-1 space-y-8 lg:order-2 lg:space-y-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Your All-in-One Event Planning Powerhouse
              </h1>

              <p className="text-muted-foreground mt-6 text-xl font-medium leading-relaxed">
                Prevema is the ultimate all-in-one event planning software designed to help you
                orchestrate flawless events with ease. Whether you're organizing conferences,
                webinars, workshops, or corporate gatherings, Prevema streamlines every step—from
                team setup to seamless execution.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                aria-label="Get started"
                style={{ backgroundColor: '#cebe06', color: '#000' }}
                className="hover:opacity-90"
              >
                <a href="/admin">Get started</a>
              </Button>
              <a href="/docs">
                <Button aria-label="Documentation" variant="outline" size="lg">
                  <span className="flex items-center gap-2">
                    Documentation
                    <ArrowRight className="size-4" />
                  </span>
                </Button>
              </a>
            </div>

            <SlideIndicator
              currentSlide={currentSlide}
              slides={SLIDES}
              className="max-lg:hidden"
              api={api}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

interface SlideIndicatorProps {
  currentSlide: number
  slides: Array<{ label: string }>
  className?: string
  api: CarouselApi | null
}

const SlideIndicator = ({ currentSlide, slides, className, api }: SlideIndicatorProps) => {
  return (
    <div className={cn('flex flex-col items-start gap-2 font-medium', className)}>
      <div className="">
        <span className="text-foreground-700">{currentSlide + 1} of 3 — </span>
        <span className="text-primary">{slides[currentSlide].label}</span>
      </div>
      <div className="flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={cn(
              'h-0.5 w-6 rounded-full transition-colors',
              index === currentSlide ? 'bg-primary' : 'bg-primary/20 hover:bg-primary/40',
            )}
          />
        ))}
      </div>
    </div>
  )
}

export { Hero187b }
