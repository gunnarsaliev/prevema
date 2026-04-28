'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import * as Headless from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/16/solid'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'
import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/catalyst/button'
import { Skeleton } from '@/components/ui/skeleton'

export type BadgeColor =
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose'
  | 'zinc'

export interface QuickViewField {
  icon: React.ReactNode
  text: string
}

export interface QuickViewSection {
  title: string
  content: string
}

export interface QuickViewItem {
  id: string | number
  title: string
  subtitle?: string
  imageUrl?: string | null
  badges?: Array<{ label: string; color: BadgeColor; icon?: React.ReactNode }>
  fields?: QuickViewField[]
  sections?: QuickViewSection[]
  detailHref: string
}

interface QuickViewDrawerProps {
  item: QuickViewItem | null
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

export function QuickViewDrawer({ item, onClose }: QuickViewDrawerProps) {
  const isOpen = item !== null

  const [displayItem, setDisplayItem] = useState<QuickViewItem | null>(null)
  useEffect(() => {
    if (item) setDisplayItem(item)
  }, [item])

  const [imageLoaded, setImageLoaded] = useState(false)
  useEffect(() => {
    setImageLoaded(false)
  }, [displayItem?.imageUrl])

  return (
    <AnimatePresence>
      {isOpen && (
        <Headless.Dialog key="quick-view-drawer" open onClose={onClose}>
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
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={panelSpring}
                    className="flex h-full flex-col overflow-y-auto bg-white shadow-xl dark:bg-zinc-900"
                  >
                    {displayItem && (
                      <>
                        {/* Header */}
                        <div className="flex items-start gap-4 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                          <div className="min-w-0 flex-1 space-y-1">
                            <Headless.DialogTitle className="text-sm/5 font-semibold text-zinc-950 dark:text-white">
                              {displayItem.title}
                            </Headless.DialogTitle>
                            {(displayItem.badges?.length || displayItem.subtitle) && (
                              <div className="flex flex-wrap items-center gap-2">
                                {displayItem.badges?.map((badge, i) => (
                                  <Badge key={i} color={badge.color}>
                                    {badge.icon}
                                    {badge.label}
                                  </Badge>
                                ))}
                                {displayItem.subtitle && (
                                  <span className="text-xs italic text-zinc-500 dark:text-zinc-400">
                                    {displayItem.subtitle}
                                  </span>
                                )}
                              </div>
                            )}
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

                        {/* Cover image */}
                        {displayItem.imageUrl && (
                          <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                            {!imageLoaded && <Skeleton className="absolute inset-0" />}
                            <img
                              src={displayItem.imageUrl}
                              alt=""
                              onLoad={() => setImageLoaded(true)}
                              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                            />
                          </div>
                        )}

                        {/* Body */}
                        <div className="flex flex-1 flex-col gap-5 px-5 py-5">
                          {displayItem.fields && displayItem.fields.length > 0 && (
                            <dl className="space-y-2.5">
                              {displayItem.fields.map((field, i) => (
                                <div
                                  key={i}
                                  className="flex items-start gap-2.5 text-sm/6 text-zinc-600 dark:text-zinc-400"
                                >
                                  <span className="mt-0.5 shrink-0">{field.icon}</span>
                                  <dd>{field.text}</dd>
                                </div>
                              ))}
                            </dl>
                          )}

                          {displayItem.sections && displayItem.sections.length > 0 && (
                            <>
                              <hr className="border-zinc-100 dark:border-zinc-800" />
                              <div className="space-y-4">
                                {displayItem.sections.map((section, i) => (
                                  <Section key={i} title={section.title}>
                                    {section.content}
                                  </Section>
                                ))}
                              </div>
                            </>
                          )}

                          <div className="mt-auto pt-2">
                            <Button href={displayItem.detailHref} className="w-full">
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
