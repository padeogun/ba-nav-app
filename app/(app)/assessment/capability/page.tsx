import { createClient } from '@/lib/supabase/server'
import { db } from '@/src/prisma/db'
import CapabilityForm from './Form'

export default async function CapabilityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let initialSkills: Record<string, { rating: number; enjoy: boolean }> = {}
  try {
    const rows = await db.orm.public.CapabilityRating.where({ userId: user.id }).all()
    for (const row of rows) {
      initialSkills[row.skillKey] = { rating: row.rating, enjoy: row.enjoy }
    }
  } catch {}

  return <CapabilityForm initialSkills={initialSkills} />
}
