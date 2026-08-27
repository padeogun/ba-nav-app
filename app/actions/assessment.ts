'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/src/prisma/db'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  try {
    const existing = await db.orm.public.User.where({ id: user.id }).first()
    if (!existing) {
      await db.orm.public.User.create({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name ?? null,
      })
    }
  } catch (e) {
    console.error('[getAuthUser] User upsert failed:', String(e))
  }
  return user
}

export async function saveMotivation(payload: {
  scores: Record<string, number>
  why: string
  changes: string
  twoYears: string
  failureDespiteProfit: string
  completed: boolean
}) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }
  try {
    const existing = await db.orm.public.Motivation.where({ userId: user.id }).first()
    if (existing) {
      await db.orm.public.Motivation.where({ userId: user.id }).update(payload)
    } else {
      await db.orm.public.Motivation.create({ id: crypto.randomUUID(), userId: user.id, ...payload })
    }
    revalidatePath('/dashboard')
    return { error: null }
  } catch (e: any) {
    const detail = JSON.stringify({ msg: e?.message, why: e?.why, code: e?.code, cause: String(e?.cause ?? '') }, null, 0)
    console.error('[saveMotivation]', detail)
    return { error: detail }
  }
}

export async function saveTemperament(payload: {
  scores: Record<string, number>
  completed: boolean
}) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }
  try {
    const existing = await db.orm.public.Temperament.where({ userId: user.id }).first()
    if (existing) {
      await db.orm.public.Temperament.where({ userId: user.id }).update(payload)
    } else {
      await db.orm.public.Temperament.create({ id: crypto.randomUUID(), userId: user.id, ...payload })
    }
    revalidatePath('/dashboard')
    return { error: null }
  } catch (e) {
    return { error: String(e) }
  }
}

export async function saveOwnershipStyle(payload: {
  scores: Record<string, number>
  completed: boolean
}) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }
  try {
    const existing = await db.orm.public.OwnershipStyle.where({ userId: user.id }).first()
    if (existing) {
      await db.orm.public.OwnershipStyle.where({ userId: user.id }).update(payload)
    } else {
      await db.orm.public.OwnershipStyle.create({ id: crypto.randomUUID(), userId: user.id, ...payload })
    }
    revalidatePath('/dashboard')
    return { error: null }
  } catch (e) {
    return { error: String(e) }
  }
}

export async function saveCapability(payload: {
  skills: Record<string, { rating: number; enjoy: boolean }>
  completed: boolean
}) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }
  try {
    for (const [skillKey, v] of Object.entries(payload.skills)) {
      if (v.rating === 0) continue
      const existing = await db.orm.public.CapabilityRating.where({ userId: user.id, skillKey }).first()
      if (existing) {
        await db.orm.public.CapabilityRating.where({ userId: user.id, skillKey }).update({ rating: v.rating, enjoy: v.enjoy })
      } else {
        await db.orm.public.CapabilityRating.create({ id: crypto.randomUUID(), userId: user.id, skillKey, rating: v.rating, enjoy: v.enjoy })
      }
    }
    revalidatePath('/dashboard')
    return { error: null }
  } catch (e) {
    return { error: String(e) }
  }
}

export async function saveFinancial(payload: {
  capitalAvailable: number | null
  riskCapital: number | null
  existingDebt: number | null
  additionalCapital: number | null
  desiredSize: number | null
  minHouseholdIncome: number | null
  desiredDrawings: number | null
  maxGuarantee: number | null
  reserveMonths: string
  maxLeverage: string
  completed: boolean
}) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }
  try {
    const existing = await db.orm.public.FinancialReadiness.where({ userId: user.id }).first()
    if (existing) {
      await db.orm.public.FinancialReadiness.where({ userId: user.id }).update(payload)
    } else {
      await db.orm.public.FinancialReadiness.create({ id: crypto.randomUUID(), userId: user.id, ...payload })
    }
    revalidatePath('/dashboard')
    return { error: null }
  } catch (e) {
    return { error: String(e) }
  }
}

export async function saveRisk(payload: {
  scores: Record<string, number>
  completed: boolean
}) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }
  try {
    for (const [riskKey, tolerance] of Object.entries(payload.scores)) {
      if (tolerance === 0) continue
      const existing = await db.orm.public.RiskRating.where({ userId: user.id, riskKey }).first()
      if (existing) {
        await db.orm.public.RiskRating.where({ userId: user.id, riskKey }).update({ tolerance })
      } else {
        await db.orm.public.RiskRating.create({ id: crypto.randomUUID(), userId: user.id, riskKey, tolerance })
      }
    }
    revalidatePath('/dashboard')
    return { error: null }
  } catch (e) {
    return { error: String(e) }
  }
}

export async function saveLifestyle(payload: {
  weeklyHours: number
  maxCommute: number
  weekendTolerance: string
  emergencyTolerance: string
  travelTolerance: string
  customerFacing: string
  relocate: string
  remotePref: string
  longTermInvolvement: string
  minPersonalIncome: number
  completed: boolean
}) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }
  try {
    const existing = await db.orm.public.Lifestyle.where({ userId: user.id }).first()
    if (existing) {
      await db.orm.public.Lifestyle.where({ userId: user.id }).update(payload)
    } else {
      await db.orm.public.Lifestyle.create({ id: crypto.randomUUID(), userId: user.id, ...payload })
    }
    revalidatePath('/dashboard')
    return { error: null }
  } catch (e) {
    return { error: String(e) }
  }
}
