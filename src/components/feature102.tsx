import { Icon } from '@iconify/react'

const Feature102 = () => {
  return (
    <section className="py-32">
      <div className="container">
        <div className="mx-auto flex max-w-3xl flex-col justify-center gap-7 md:text-center">
          <h2 className="text-2xl md:text-4xl">How It Works: Simple Steps to Event Success</h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Prevema's intuitive workflow turns complex planning into a breeze. Follow these simple
            steps to orchestrate flawless events with ease.
          </p>
        </div>
        <div className="mx-auto mt-14 flex max-w-5xl flex-col gap-4 lg:px-16">
          <div className="flex flex-col items-center justify-between min-[960px]:flex-row min-[960px]:gap-10">
            <div className="flex gap-4 min-[960px]:max-w-md">
              <div className="flex flex-col items-center justify-between gap-1">
                <span className="h-20 shrink-0"></span>
                <span className="bg-muted/50 flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-lg">
                  1
                </span>
                <span className="bg-linear-to-b to-primary h-20 w-[3px] shrink-0 from-transparent opacity-70"></span>
              </div>
              <div className="flex flex-col justify-center gap-5 px-0 min-[960px]:gap-6 min-[960px]:px-4 min-[960px]:py-4">
                <h3 className="text-xl min-[960px]:text-2xl">Create Your Event</h3>
                <p className="text-muted-foreground text-sm min-[960px]:text-base">
                  Set up the basics, including date, location, and objectives. Build your team and
                  define attendee types like participants, partners, speakers, sponsors, and
                  moderators.
                </p>
              </div>
            </div>
            <div className="flex w-full justify-center px-8 min-[960px]:w-auto">
              <div className="bg-accent border-border flex aspect-square max-w-xs items-center justify-center rounded-xl border">
                <Icon icon="solar:calendar-add-bold-duotone" className="text-primary size-32" />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between min-[960px]:flex-row min-[960px]:gap-10">
            <div className="flex gap-4 min-[960px]:max-w-md">
              <div className="relative flex flex-col items-center justify-between gap-1">
                <span className="bg-primary absolute -top-8 mx-auto h-8 w-[3px] shrink-0 opacity-70"></span>
                <span className="bg-primary absolute -bottom-8 mx-auto h-8 w-[3px] shrink-0 opacity-70"></span>
                <span className="bg-primary h-20 w-[3px] shrink-0 opacity-70"></span>
                <span className="bg-muted/50 flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-lg">
                  2
                </span>
                <span className="bg-primary h-20 w-[3px] shrink-0 opacity-70"></span>
              </div>
              <div className="flex flex-col justify-center gap-5 px-0 min-[960px]:gap-6 min-[960px]:px-4 min-[960px]:py-4">
                <h3 className="text-xl min-[960px]:text-2xl">
                  Manage Participants and Communications
                </h3>

                <p className="text-muted-foreground text-sm min-[960px]:text-base">
                  Collect data with custom forms, handle correspondence, and curate content—all in
                  one place. Send personalized emails, follow up with updates, and dispatch bulk
                  campaigns to keep everyone engaged.
                </p>
              </div>
            </div>

            <div className="flex w-full justify-center px-8 min-[960px]:w-auto">
              <div className="bg-accent border-border flex aspect-square max-w-xs items-center justify-center rounded-xl border">
                <Icon
                  icon="solar:users-group-two-rounded-bold-duotone"
                  className="text-primary size-32"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between min-[960px]:flex-row min-[960px]:gap-10">
            <div className="flex gap-4 min-[960px]:max-w-md">
              <div className="flex flex-col items-center justify-between gap-1">
                <span className="bg-linear-to-t to-primary h-20 w-[3px] shrink-0 from-transparent opacity-70"></span>
                <span className="bg-muted/50 flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-lg">
                  3
                </span>
                <span className="h-20 shrink-0"></span>
              </div>
              <div className="flex flex-col justify-center gap-5 px-0 min-[960px]:gap-6 min-[960px]:px-4 min-[960px]:py-4">
                <h3 className="text-xl min-[960px]:text-2xl">Launch and Execute</h3>

                <p className="text-muted-foreground text-sm min-[960px]:text-base">
                  Go live with confidence, knowing everything is automated, organized, and ready to
                  impress. Leverage smart automations and AI-powered tools to deliver unforgettable
                  experiences.
                </p>
              </div>
            </div>
            <div className="flex w-full justify-center px-8 min-[960px]:w-auto">
              <div className="bg-accent border-border flex aspect-square max-w-xs items-center justify-center rounded-xl border">
                <Icon icon="solar:rocket-2-bold-duotone" className="text-primary size-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export { Feature102 }
