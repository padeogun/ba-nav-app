import { createClient } from '@/lib/supabase/server'
import { db } from '@/src/prisma/db'
import TemperamentForm from './Form'

export default async function TemperamentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let initialScores: Record<string, number> = {}
  let initialCompleted = false
  try {
    const existing = await db.orm.public.Temperament.where({ userId: user.id }).first()
    if (existing) {
      initialScores = (existing.scores ?? {}) as Record<string, number>
      initialCompleted = existing.completed
    }
  } catch {}

  return <TemperamentForm initialScores={initialScores} initialCompleted={initialCompleted} />
}
