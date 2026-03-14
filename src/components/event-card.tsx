import Image from 'next/image'
import { MapPin } from 'lucide-react'

interface EventCardProps {
  image: string
  day: number
  month: string
  location: string
  title: string
  description: string
  startingPrice: string
}

export function EventCard({
  image,
  day,
  month,
  location,
  title,
  description,
  startingPrice,
}: EventCardProps) {
  return (
    <div className="w-full h-[500px] md:rounded-3xl md:px-0 overflow-hidden bg-white dark:bg-zinc-800 flex flex-col">
      {/* Image Container */}
      <div className="relative w-full h-48 md:rounded-3xl overflow-hidden flex-shrink-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Content Container */}
      <div className="px-4 md:px-6 py-5 md:py-6 flex flex-col flex-1">
        {/* Date and Location Row */}
        <div className="flex items-start justify-between gap-4 mb-3 flex-shrink-0">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {month}
            </span>
            <div className="w-px h-8 bg-gray-300"></div>
            <span className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {day}
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span className="text-sm md:text-base">{location.split(',').pop()?.trim()}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 flex-shrink-0 line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-1">
          {description}
        </p>

        {/* Starting Price */}
        <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
          <span>🎫</span>
          <span>{startingPrice}</span>
        </div>
      </div>
    </div>
  )
}
