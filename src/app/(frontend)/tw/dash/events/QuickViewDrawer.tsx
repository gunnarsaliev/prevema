'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import * as Headless from '@headlessui/react'
import {
  XMarkIcon,
  CalendarIcon,
  MapPinIcon,
  GlobeAltIcon,
  BuildingOffice2Icon,
  ClockIcon,
} from '@heroicons/react/16/solid'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'
import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/catalyst/button'
import type { CatalystEvent } from './data'

interface EventDrawerProps {
  event: CatalystEvent | null
  onClose: () => void
}

const panelSpring = { type: 'spring' as const, damping: 30, stiffness: 280 }
const fadeTransition = { duration: 0.2 }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        {title}
      </p>
      <div className="text-sm/6 text-zinc-700 dark:text-zinc-300">{children}</div>
    </div>
  )
}

export function QuickViewDrawer({ event, onClose }: EventDrawerProps) {
  const isOpen = event !== null

  // Keep a copy so content doesn't vanish during the exit spring animation
  const [displayEvent, setDisplayEvent] = useState<CatalystEvent | null>(null)
  useEffect(() => {
    if (event) setDisplayEvent(event)
  }, [event])

  return (
    <AnimatePresence>
      {isOpen && (
        <Headless.Dialog key="quick-view-drawer" open onClose={onClose}>
          {/* Backdrop — fade in/out */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeTransition}
            className="fixed inset-0 bg-zinc-950/25 dark:bg-zinc-950/50"
            aria-hidden="true"
          />

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Headless.DialogPanel className="pointer-events-auto w-screen max-w-sm">
                  {/* Panel — spring slide from right */}
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={panelSpring}
                    className="flex h-full flex-col overflow-y-auto bg-white shadow-xl dark:bg-zinc-900"
                  >
                    {displayEvent && (
                      <>
                        {/* Header row: thumbnail + title + close */}
                        <div className="flex items-start gap-4 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                          {displayEvent.imgUrl && (
                            <img
                              src={displayEvent.imgUrl}
                              alt=""
                              className="size-14 shrink-0 rounded-lg object-cover shadow-sm"
                            />
                          )}
                          <div className="min-w-0 flex-1 space-y-1">
                            <Headless.DialogTitle className="text-sm/5 font-semibold text-zinc-950 dark:text-white">
                              {displayEvent.name}
                            </Headless.DialogTitle>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge color={displayEvent.status === 'On Sale' ? 'lime' : 'zinc'}>
                                {displayEvent.status}
                              </Badge>
                              {displayEvent.eventType && (
                                <Badge color="blue" className="capitalize">
                                  {displayEvent.eventType === 'online' ? (
                                    <GlobeAltIcon className="size-3" />
                                  ) : (
                                    <BuildingOffice2Icon className="size-3" />
                                  )}
                                  {displayEvent.eventType}
                                </Badge>
                              )}
                              {displayEvent.theme && (
                                <span className="text-xs italic text-zinc-500 dark:text-zinc-400">
                                  {displayEvent.theme}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={onClose}
                            className="shrink-0 rounded-md p-1 text-zinc-400 hover:text-zinc-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:hover:text-zinc-300"
                            aria-label="Close"
                          >
                            <XMarkIcon className="size-5" />
                          </button>
                        </div>

                        {/* Body */}
                        <div className="flex flex-1 flex-col gap-5 px-5 py-5">
                          {/* Date / timezone / location */}
                          <dl className="space-y-2.5">
                            {displayEvent.date && (
                              <div className="flex items-start gap-2.5 text-sm/6 text-zinc-600 dark:text-zinc-400">
                                <CalendarIcon className="mt-0.5 size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                                <dd>
                                  {displayEvent.date}
                                  {displayEvent.endDate &&
                                    displayEvent.endDate !== displayEvent.date && (
                                      <> → {displayEvent.endDate}</>
                                    )}
                                </dd>
                              </div>
                            )}
                            {displayEvent.timezone && (
                              <div className="flex items-center gap-2.5 text-sm/6 text-zinc-600 dark:text-zinc-400">
                                <ClockIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                                <dd>{displayEvent.timezone}</dd>
                              </div>
                            )}
                            {displayEvent.location && (
                              <div className="flex items-start gap-2.5 text-sm/6 text-zinc-600 dark:text-zinc-400">
                                <MapPinIcon className="mt-0.5 size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                                <dd>{displayEvent.location}</dd>
                              </div>
                            )}
                          </dl>

                          <hr className="border-zinc-100 dark:border-zinc-800" />

                          {/* Rich detail sections */}
                          <div className="space-y-4">
                            {displayEvent.description && (
                              <Section title="About">{displayEvent.description}</Section>
                            )}
                            {displayEvent.why && <Section title="Why">{displayEvent.why}</Section>}
                            {displayEvent.what && (
                              <Section title="What">{displayEvent.what}</Section>
                            )}
                            {displayEvent.who && <Section title="Who">{displayEvent.who}</Section>}
                          </div>

                          {/* Action */}
                          <div className="mt-auto pt-2">
                            <Button href={displayEvent.url} className="w-full">
                              <ArrowTopRightOnSquareIcon className="size-4" />
                              View full details
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                </Headless.DialogPanel>
              </div>
            </div>
          </div>
        </Headless.Dialog>
      )}
    </AnimatePresence>
  )
}
