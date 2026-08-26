'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/src/prisma/db'
import type { BuyBoxDraft } from '@/lib/scoring'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function toggleSectorInterest(sectorId: string) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }
  try {
    const existing = await db.orm.public.SectorInterest.where({ userId: user.id, sectorId }).first()
    if (existing) {
      await db.orm.public.SectorInterest.where({ userId: user.id, sectorId }).delete()
    } else {
      await db.orm.public.SectorInterest.create({ id: crypto.randomUUID(), userId: user.id, sectorId })
    }
    revalidatePath('/sectors')
    return { error: null }
  } catch (e) {
    return { error: String(e) }
  }
}

export async function saveBuyBox(draft: BuyBoxDraft) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }
  try {
    const payload = {
      geography: draft.geography,
      maxDistance: String(draft.maxDistance),
      sectorsPreferred: draft.sectorsPreferred.join(','),
      sectorsExcluded: draft.sectorsExcluded.join(','),
      revenueMin: draft.revenueMin,
      revenueMax: draft.revenueMax,
      ebitdaMin: draft.ebitdaMin,
      ebitdaMax: draft.ebitdaMax,
      priceMin: draft.priceMin,
      priceMax: draft.priceMax,
      employeeMin: draft.employeeMin,
      employeeMax: draft.employeeMax,
      minMargin: draft.minMargin,
      minRecurring: draft.minRecurring,
      maxCustomerConcentration: draft.maxCustomerConcentration,
      maxSupplierConcentration: draft.maxSupplierConcentration,
      minYearsTrading: draft.minYearsTrading,
      cashConversion: draft.cashConversion,
      maxCapex: draft.maxCapex,
      maxSellerDependency: draft.maxSellerDependency,
      maxOwnerHours: draft.maxOwnerHours,
      dealTypes: draft.dealTypes.join(','),
      ownershipModel: draft.ownershipModel,
      completed: true,
    }
    const existing = await db.orm.public.BuyBox.where({ userId: user.id }).first()
    if (existing) {
      await db.orm.public.BuyBox.where({ userId: user.id }).update(payload)
    } else {
      await db.orm.public.BuyBox.create({ id: crypto.randomUUID(), userId: user.id, ...payload })
    }
    revalidatePath('/buy-box')
    revalidatePath('/dashboard')
    return { error: null }
  } catch (e) {
    return { error: String(e) }
  }
}
