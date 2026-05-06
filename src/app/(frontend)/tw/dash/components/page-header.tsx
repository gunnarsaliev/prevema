import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { ReactNode } from 'react'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface BreadcrumbItem {
  label: string
  href: string
  isCurrent?: boolean
}

interface ActionButton {
  label: string
  href?: string
  onClick?: () => void
  disabled?: boolean
  tooltip?: string
}

interface PageHeaderProps {
  title: string
  breadcrumbs?: BreadcrumbItem[]
  backLink?: { label: string; href: string }
  actions?: ReactNode
  primaryAction?: ActionButton
  secondaryAction?: ActionButton
}

export default function PageHeader({
  title,
  breadcrumbs,
  backLink,
  actions,
  primaryAction,
  secondaryAction,
}: PageHeaderProps) {
  const showBreadcrumbs = breadcrumbs && breadcrumbs.length > 0
  const hasDefaultActions = primaryAction || secondaryAction

  const secondaryButtonClass =
    'inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20'

  const renderActionButton = (action: ActionButton, isPrimary: boolean) => {
    if (isPrimary) {
      if (action.disabled) {
        const button = (
          <RainbowButton disabled aria-disabled="true" onClick={(e) => e.preventDefault()}>
            <Icon icon="mingcute:ai-fill" className="mr-2 size-4" />
            {action.label}
          </RainbowButton>
        )
        if (!action.tooltip) return button
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="inline-block">
                  {button}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">{action.tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }
      if (action.href) {
        return (
          <RainbowButton asChild>
            <Link href={action.href}>
              <Icon icon="mingcute:ai-fill" className="mr-2 size-4" />
              {action.label}
            </Link>
          </RainbowButton>
        )
      }
      return (
        <RainbowButton onClick={action.onClick}>
          <Icon icon="mingcute:ai-fill" className="mr-2 size-4" />
          {action.label}
        </RainbowButton>
      )
    }
    // Secondary action
    if (action.href) {
      return (
        <Link href={action.href} className={secondaryButtonClass}>
          {action.label}
        </Link>
      )
    }
    return (
      <button type="button" onClick={action.onClick} className={secondaryButtonClass}>
        {action.label}
      </button>
    )
  }

  return (
    <div>
      <div>
        {backLink && (
          <nav aria-label="Back" className="sm:hidden">
            <Link
              href={backLink.href}
              className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ChevronLeftIcon
                aria-hidden="true"
                className="mr-1 -ml-1 size-5 shrink-0 text-gray-400 dark:text-gray-500"
              />
              {backLink.label}
            </Link>
          </nav>
        )}
        {showBreadcrumbs && (
          <nav aria-label="Breadcrumb" className="hidden sm:flex">
            <ol role="list" className="flex items-center space-x-4">
              {breadcrumbs.map((item, index) => (
                <li key={item.href + item.label}>
                  <div className="flex items-center">
                    {index > 0 && (
                      <ChevronRightIcon
                        aria-hidden="true"
                        className="size-5 shrink-0 text-gray-400 dark:text-gray-500"
                      />
                    )}
                    <Link
                      href={item.href}
                      aria-current={item.isCurrent ? 'page' : undefined}
                      className={`text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 ${
                        index > 0 ? 'ml-4' : ''
                      }`}
                    >
                      {item.label}
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
      <div className="mt-2 md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight dark:text-white">
            {title}
          </h2>
        </div>
        {actions && <div className="mt-4 flex shrink-0 md:mt-0 md:ml-4">{actions}</div>}
        {hasDefaultActions && !actions && (
          <div className="mt-4 flex shrink-0 md:mt-0 md:ml-4">
            {secondaryAction && (
              <span className={primaryAction ? 'mr-3' : ''}>
                {renderActionButton(secondaryAction, false)}
              </span>
            )}
            {primaryAction && renderActionButton(primaryAction, true)}
          </div>
        )}
      </div>
    </div>
  )
}
