'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/src/prisma/db'
import { scoreOpportunity, type BuyBoxDraft } from '@/lib/scoring'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  try {
    const existing = await db.orm.public.User.where({ id: user.id }).first()
    if (!existing) await db.orm.public.User.create({ id: user.id, email: user.email!, name: user.user_metadata?.name ?? null })
  } catch (e) { console.error('[getAuthUser]', String(e)) }
  return user
}

async function loadBuyBoxDraft(userId: string): Promise<BuyBoxDraft | null> {
  try {
    const bb = await db.orm.public.BuyBox.where({ userId }).first()
    if (!bb) return null
    return {
      geography: bb.geography,
      maxDistance: bb.maxDistance,
      sectorsPreferred: bb.sectorsPreferred ? bb.sectorsPreferred.split(',').filter(Boolean) : [],
      sectorsExcluded: bb.sectorsExcluded ? bb.sectorsExcluded.split(',').filter(Boolean) : [],
      revenueMin: bb.revenueMin, revenueMax: bb.revenueMax,
      ebitdaMin: bb.ebitdaMin, ebitdaMax: bb.ebitdaMax,
      priceMin: bb.priceMin, priceMax: bb.priceMax,
      employeeMin: bb.employeeMin, employeeMax: bb.employeeMax,
      minMargin: bb.minMargin, minRecurring: bb.minRecurring,
      maxCustomerConcentration: bb.maxCustomerConcentration,
      maxSupplierConcentration: bb.maxSupplierConcentration,
      minYearsTrading: bb.minYearsTrading,
      cashConversion: bb.cashConversion,
      maxCapex: bb.maxCapex,
      maxSellerDependency: bb.maxSellerDependency,
      maxOwnerHours: bb.maxOwnerHours,
      dealTypes: bb.dealTypes ? bb.dealTypes.split(',').filter(Boolean) : [],
      ownershipModel: bb.ownershipModel,
    }
  } catch { return null }
}

export type OppFields = {
  title: string
  url: string
  sector: string
  askingPrice: string
  ebitda: string
  revenue: string
  employees: string
  yearsTrading: string
  location: string
  notes: string
  chCompanyNumber: string
  chCompanyName: string
  chStatus: string
  chSicCodes: string
  chIncorporatedOn: string
}

export async function createOpportunity(fields: OppFields) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated', id: null }
  try {
    const bb = await loadBuyBoxDraft(user.id)
    const { score, flags } = bb ? scoreOpportunity(fields, bb) : { score: 0, flags: [] }
    const id = crypto.randomUUID()
    await db.orm.public.Opportunity.create({
      id, userId: user.id, stage: 'saved',
      ...fields,
      score: score > 0 ? String(score) : '',
      scoreFlags: flags.join('|||'),
    })
    revalidatePath('/pipeline')
    return { error: null, id }
  } catch (e) { return { error: String(e), id: null } }
}

export async function updateOpportunity(id: string, fields: Partial<OppFields>) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }
  try {
    const existing = await db.orm.public.Opportunity.where({ id, userId: user.id }).first()
    if (!existing) return { error: 'Not found' }
    const merged = { ...existing, ...fields } as OppFields
    const bb = await loadBuyBoxDraft(user.id)
    const { score, flags } = bb ? scoreOpportunity(merged, bb) : { score: 0, flags: [] }
    await db.orm.public.Opportunity.where({ id, userId: user.id }).update({
      ...fields,
      score: score > 0 ? String(score) : '',
      scoreFlags: flags.join('|||'),
    })
    revalidatePath('/pipeline')
    revalidatePath(`/pipeline/${id}`)
    return { error: null }
  } catch (e) { return { error: String(e) } }
}

export async function moveStage(id: string, stage: string) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }
  try {
    await db.orm.public.Opportunity.where({ id, userId: user.id }).update({ stage })
    revalidatePath('/pipeline')
    revalidatePath(`/pipeline/${id}`)
    return { error: null }
  } catch (e) { return { error: String(e) } }
}

export async function saveAnalysis(id: string, updates: {
  qualityScores?: string
  ownerDepScores?: string
  redFlags?: string
  fitScores?: string
}): Promise<{ error?: string }> {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }
  try {
    const existing = await db.orm.public.Opportunity.where({ id, userId: user.id }).first()
    if (!existing) return { error: 'Opportunity not found' }
    await db.orm.public.Opportunity.where({ id, userId: user.id }).update(updates)
    revalidatePath(`/pipeline/${id}`)
    return {}
  } catch (e) { return { error: String(e) } }
}

export async function deleteOpportunity(id: string) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }
  try {
    await db.orm.public.Opportunity.where({ id, userId: user.id }).delete()
    revalidatePath('/pipeline')
    return { error: null }
  } catch (e) { return { error: String(e) } }
}
