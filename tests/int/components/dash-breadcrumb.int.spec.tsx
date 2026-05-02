import { render, screen } from '@testing-library/react'
import { DashBreadcrumb } from '@/components/dash-breadcrumb'

describe('DashBreadcrumb', () => {
  it('renders the home link', () => {
    render(<DashBreadcrumb items={[]} />)
    const homeLink = screen.getByRole('link', { name: /home/i })
    expect(homeLink).toHaveAttribute('href', '/tw/dash')
  })

  it('renders a linked item', () => {
    render(<DashBreadcrumb items={[{ label: 'Events', href: '/tw/dash/events' }]} />)
    const link = screen.getByRole('link', { name: 'Events' })
    expect(link).toHaveAttribute('href', '/tw/dash/events')
  })

  it('renders the last item without a link', () => {
    render(
      <DashBreadcrumb
        items={[
          { label: 'Events', href: '/tw/dash/events' },
          { label: 'My Event' },
        ]}
      />,
    )
    const lastItem = screen.getByText('My Event')
    expect(lastItem.tagName).not.toBe('A')
    expect(lastItem).not.toHaveAttribute('href')
  })
})
