import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/src/prisma/db'
import { type BuyBoxDraft } from '@/lib/scoring'
import OpportunityDetail from './Detail'

export default async function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let opp: any = null
  let buyBox: BuyBoxDraft | null = null

  try {
    const [o, bb] = await Promise.all([
      db.orm.public.Opportunity.where({ id, userId: user.id }).first(),
      db.orm.public.BuyBox.where({ userId: user.id }).first(),
    ])
    opp = o
    if (bb) {
      buyBox = {
        geography: bb.geography, maxDistance: bb.maxDistance,
        sectorsPreferred: bb.sectorsPreferred ? bb.sectorsPreferred.split(',').filter(Boolean) : [],
        sectorsExcluded: bb.sectorsExcluded ? bb.sectorsExcluded.split(',').filter(Boolean) : [],
        revenueMin: bb.revenueMin, revenueMax: bb.revenueMax,
        ebitdaMin: bb.ebitdaMin, ebitdaMax: bb.ebitdaMax,
        priceMin: bb.priceMin, priceMax: bb.priceMax,
        employeeMin: bb.employeeMin, employeeMax: bb.employeeMax,
        minMargin: bb.minMargin, minRecurring: bb.minRecurring,
        maxCustomerConcentration: bb.maxCustomerConcentration,
        maxSupplierConcentration: bb.maxSupplierConcentration,
        minYearsTrading: bb.minYearsTrading, cashConversion: bb.cashConversion,
        maxCapex: bb.maxCapex, maxSellerDependency: bb.maxSellerDependency,
        maxOwnerHours: bb.maxOwnerHours,
        dealTypes: bb.dealTypes ? bb.dealTypes.split(',').filter(Boolean) : [],
        ownershipModel: bb.ownershipModel,
      }
    }
  } catch {}

  if (!opp) notFound()

  return <OpportunityDetail opp={opp} buyBox={buyBox} />
}
