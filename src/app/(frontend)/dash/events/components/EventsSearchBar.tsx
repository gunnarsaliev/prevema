'use client'

import { useState, useCallback, useMemo } from 'react'

interface Props {
  onSearchChange: (query: string) => void
}

export function EventsSearchBar({ onSearchChange }: Props) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchQuery(value)
      onSearchChange(value)
    },
    [onSearchChange],
  )

  return (
    <div className="flex items-center gap-4">
      <input
        type="text"
        placeholder="Search events..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-w-sm"
      />
    </div>
  )
}
