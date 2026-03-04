import { Icon } from '@iconify/react'

const navigation = [
  // {
  //   name: 'Facebook',
  //   href: '#',
  //   icon: 'mdi:facebook',
  // },
  // {
  //   name: 'Instagram',
  //   href: '#',
  //   icon: 'mdi:instagram',
  // },
  // {
  //   name: 'X',
  //   href: '#',
  //   icon: 'mdi:twitter',
  // },
  // {
  //   name: 'GitHub',
  //   href: '#',
  //   icon: 'mdi:github',
  // },
  // {
  //   name: 'YouTube',
  //   href: '#',
  //   icon: 'mdi:youtube',
  // },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/prevema-ai/about/',
    icon: 'mdi:linkedin',
  },
]

export default function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
      <div className="flex justify-center gap-x-6 md:order-2">
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="text-gray-400 hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sr-only">{item.name}</span>
            <Icon icon={item.icon} aria-hidden="true" className="size-6" />
          </a>
        ))}
      </div>
      <p className="mt-8 text-center text-sm/6 text-gray-400 md:order-1 md:mt-0">
        &copy; {new Date().getFullYear()} Prevema. Your AI Powered Event Communication Assistant.
      </p>
    </footer>
  )
}
