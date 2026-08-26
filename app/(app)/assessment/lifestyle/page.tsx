import { createClient } from '@/lib/supabase/server'
import { db } from '@/src/prisma/db'
import LifestyleForm from './Form'

export default async function LifestylePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let initialData = {
    weeklyHours: 45, maxCommute: 45,
    weekendTolerance: 'occasional', emergencyTolerance: 'sometimes',
    travelTolerance: 'regional', customerFacing: 'yes', relocate: 'no',
    remotePref: 'hybrid', longTermInvolvement: 'owner-manager',
    minPersonalIncome: 0, completed: false,
  }
  try {
    const existing = await db.orm.public.Lifestyle.where({ userId: user.id }).first()
    if (existing) {
      initialData = {
        weeklyHours: existing.weeklyHours,
        maxCommute: existing.maxCommute,
        weekendTolerance: existing.weekendTolerance,
        emergencyTolerance: existing.emergencyTolerance,
        travelTolerance: existing.travelTolerance,
        customerFacing: existing.customerFacing,
        relocate: existing.relocate,
        remotePref: existing.remotePref,
        longTermInvolvement: existing.longTermInvolvement,
        minPersonalIncome: existing.minPersonalIncome,
        completed: existing.completed,
      }
    }
  } catch {}

  return <LifestyleForm initialData={initialData} />
}
