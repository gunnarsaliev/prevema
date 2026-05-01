import { SidebarHeading, SidebarItem, SidebarSection } from '@/components/catalyst/sidebar'

interface UpcomingEventsProps {
  events: { name: string; url: string }[]
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <SidebarSection className="max-lg:hidden">
      <SidebarHeading>Upcoming Events</SidebarHeading>
      {events.map((event) => (
        <SidebarItem key={event.url} href={event.url}>
          {event.name}
        </SidebarItem>
      ))}
    </SidebarSection>
  )
}
