import { createClient } from '@/lib/supabase/server'
import { db } from '@/src/prisma/db'
import MotivationForm from './Form'

export default async function MotivationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let initialData = {
    scores: {} as Record<string, number>,
    why: '', changes: '', twoYears: '', failureDespiteProfit: '',
    completed: false,
  }
  try {
    const existing = await db.orm.public.Motivation.where({ userId: user.id }).first()
    if (existing) {
      initialData = {
        scores: (existing.scores ?? {}) as Record<string, number>,
        why: existing.why ?? '',
        changes: existing.changes ?? '',
        twoYears: existing.twoYears ?? '',
        failureDespiteProfit: existing.failureDespiteProfit ?? '',
        completed: existing.completed,
      }
    }
  } catch {}

  return <MotivationForm initialData={initialData} />
}
