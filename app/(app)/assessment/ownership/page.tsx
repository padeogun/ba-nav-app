import { createClient } from '@/lib/supabase/server'
import { db } from '@/src/prisma/db'
import OwnershipForm from './Form'

export default async function OwnershipPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let initialScores: Record<string, number> = {}
  let initialCompleted = false
  try {
    const existing = await db.orm.public.OwnershipStyle.where({ userId: user.id }).first()
    if (existing) {
      initialScores = (existing.scores ?? {}) as Record<string, number>
      initialCompleted = existing.completed
    }
  } catch {}

  return <OwnershipForm initialScores={initialScores} initialCompleted={initialCompleted} />
}
