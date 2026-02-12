'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CompaniesList2 } from '@/components/companies-list2'
import { Loader2 } from 'lucide-react'

interface Partner {
  id: string
  companyName: string
  companyLogoUrl?: string
  companyLogo?: {
    url: string
  }
  contactEmail: string
  email?: string
  companyWebsiteUrl?: string
  partnerType?:
    | {
        name: string
      }
    | string
  tier?:
    | {
        name: string
      }
    | string
  contactPerson: string
  fieldOfExpertise?: string
  sponsorshipLevel?: string
}

interface Company {
  name: string
  logo: string
  email: string
  url: string
  typeOfPartner: string
  tier: string
  mainContact: string
  employees: number
  revenue: string
  industry: string
}

const transformPartnerToCompany = (partner: Partner): Company => {
  // Get logo URL
  const logo =
    partner.companyLogoUrl ||
    (typeof partner.companyLogo === 'object' ? partner.companyLogo?.url : '') ||
    'https://via.placeholder.com/40'

  // Get partner type name
  const typeOfPartner =
    typeof partner.partnerType === 'object' ? partner.partnerType?.name || 'Partner' : 'Partner'

  // Get tier name
  const tier =
    typeof partner.tier === 'object'
      ? partner.tier?.name || 'Standard'
      : partner.sponsorshipLevel || 'Standard'

  return {
    name: partner.companyName,
    logo,
    email: partner.contactEmail || partner.email || '',
    url: partner.companyWebsiteUrl || '#',
    typeOfPartner,
    tier,
    mainContact: partner.contactPerson,
    employees: 0, // Not available in partner data
    revenue: '', // Not available in partner data
    industry: partner.fieldOfExpertise || 'General',
  }
}

export default function PartnersPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId')
  const [partners, setPartners] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPartners = async () => {
      if (!eventId) {
        setError('No event selected')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const url = `/api/partners?where[event][equals]=${eventId}&depth=2&limit=1000&sort=companyName`
        console.log('[Partners Page] Fetching:', url)

        const response = await fetch(url)

        console.log('[Partners Page] Response status:', response.status)
        const data = await response.json()
        console.log('[Partners Page] Response data:', data)

        if (!response.ok) {
          throw new Error('Failed to fetch partners')
        }

        const partnersList = (data.docs || []) as Partner[]
        console.log('[Partners Page] Partners list:', partnersList)

        // Transform partners to match Company interface
        const transformedPartners = partnersList.map(transformPartnerToCompany)
        setPartners(transformedPartners)
      } catch (err) {
        console.error('Failed to fetch partners:', err)
        setError(err instanceof Error ? err.message : 'Failed to load partners')
      } finally {
        setLoading(false)
      }
    }

    fetchPartners()
  }, [eventId])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading partners...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-destructive">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please select an event to view partners
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-4">
      <CompaniesList2 title="Event Partners" data={partners} className="py-8" />
    </div>
  )
}
