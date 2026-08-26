import { createClient } from '@/lib/supabase/server'
import { db } from '@/src/prisma/db'
import RiskForm from './Form'

export default async function RiskPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let initialScores: Record<string, number> = {}
  try {
    const rows = await db.orm.public.RiskRating.where({ userId: user.id }).all()
    for (const row of rows) {
      initialScores[row.riskKey] = row.tolerance
    }
  } catch {}

  return <RiskForm initialScores={initialScores} />
}
