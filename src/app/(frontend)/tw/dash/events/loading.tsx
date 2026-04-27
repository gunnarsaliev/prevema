import { Button } from '@/components/catalyst/button'
import { Heading } from '@/components/catalyst/heading'
import { Input, InputGroup } from '@/components/catalyst/input'
import { Select } from '@/components/catalyst/select'
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid'
import { EventsListSkeleton } from './EventsListSkeleton'

export default function Loading() {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-sm:w-full sm:flex-1">
          <Heading>Events</Heading>
          <div className="mt-4 flex max-w-xl gap-4">
            <div className="flex-1">
              <InputGroup>
                <MagnifyingGlassIcon />
                <Input name="search" placeholder="Search events\u2026" disabled />
              </InputGroup>
            </div>
            <div>
              <Select name="sort_by" disabled>
                <option value="name">Sort by name</option>
                <option value="date">Sort by date</option>
                <option value="status">Sort by status</option>
              </Select>
            </div>
          </div>
        </div>
        <Button disabled>Create event</Button>
      </div>
      <EventsListSkeleton />
    </>
  )
}
