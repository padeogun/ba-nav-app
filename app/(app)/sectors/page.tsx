import { createClient } from '@/lib/supabase/server'
import { db } from '@/src/prisma/db'
import type { CapabilityData, CapabilitySkills, LifestyleData } from '@/lib/scoring'
import SectorsForm from './Form'

const defaultLifestyle: LifestyleData = {
  weeklyHours: 45, maxCommute: 45, weekendTolerance: 'occasional',
  emergencyTolerance: 'sometimes', travelTolerance: 'regional',
  customerFacing: 'yes', relocate: 'no', remotePref: 'hybrid',
  longTermInvolvement: 'owner-manager', minPersonalIncome: 0, completed: false,
}

export default async function SectorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let capability: CapabilityData = { skills: {}, completed: false }
  let lifestyle: LifestyleData = defaultLifestyle
  let interests: string[] = []
  let buyBoxExcluded: string[] = []

  try {
    const [capRows, lifestyleRow, interestRows, buyBox] = await Promise.all([
      db.orm.public.CapabilityRating.where({ userId: user.id }).all(),
      db.orm.public.Lifestyle.where({ userId: user.id }).first(),
      db.orm.public.SectorInterest.where({ userId: user.id }).all(),
      db.orm.public.BuyBox.where({ userId: user.id }).first(),
    ])

    const skills: CapabilitySkills = {}
    capRows.forEach((r) => { skills[r.skillKey] = { rating: r.rating, enjoy: r.enjoy } })
    capability = { skills, completed: capRows.length >= 24 }

    if (lifestyleRow) {
      lifestyle = {
        weeklyHours: lifestyleRow.weeklyHours,
        maxCommute: lifestyleRow.maxCommute,
        weekendTolerance: lifestyleRow.weekendTolerance,
        emergencyTolerance: lifestyleRow.emergencyTolerance,
        travelTolerance: lifestyleRow.travelTolerance,
        customerFacing: lifestyleRow.customerFacing,
        relocate: lifestyleRow.relocate,
        remotePref: lifestyleRow.remotePref,
        longTermInvolvement: lifestyleRow.longTermInvolvement,
        minPersonalIncome: lifestyleRow.minPersonalIncome,
        completed: lifestyleRow.completed,
      }
    }

    interests = interestRows.map((r) => r.sectorId)
    buyBoxExcluded = buyBox?.sectorsExcluded ? buyBox.sectorsExcluded.split(',').filter(Boolean) : []
  } catch {}

  return (
    <SectorsForm
      capability={capability}
      lifestyle={lifestyle}
      initialInterests={interests}
      buyBoxExcluded={buyBoxExcluded}
    />
  )
}
