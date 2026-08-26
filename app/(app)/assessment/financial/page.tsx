import { createClient } from '@/lib/supabase/server'
import { db } from '@/src/prisma/db'
import FinancialForm from './Form'

export default async function FinancialPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let initialData = {
    capitalAvailable: '', riskCapital: '', existingDebt: '',
    additionalCapital: '', desiredSize: '', minHouseholdIncome: '',
    desiredDrawings: '', maxGuarantee: '',
    reserveMonths: '6', maxLeverage: 'moderate', completed: false,
  }
  try {
    const existing = await db.orm.public.FinancialReadiness.where({ userId: user.id }).first()
    if (existing) {
      initialData = {
        capitalAvailable: existing.capitalAvailable != null ? String(existing.capitalAvailable) : '',
        riskCapital: existing.riskCapital != null ? String(existing.riskCapital) : '',
        existingDebt: existing.existingDebt != null ? String(existing.existingDebt) : '',
        additionalCapital: existing.additionalCapital != null ? String(existing.additionalCapital) : '',
        desiredSize: existing.desiredSize != null ? String(existing.desiredSize) : '',
        minHouseholdIncome: existing.minHouseholdIncome != null ? String(existing.minHouseholdIncome) : '',
        desiredDrawings: existing.desiredDrawings != null ? String(existing.desiredDrawings) : '',
        maxGuarantee: existing.maxGuarantee != null ? String(existing.maxGuarantee) : '',
        reserveMonths: existing.reserveMonths,
        maxLeverage: existing.maxLeverage,
        completed: existing.completed,
      }
    }
  } catch {}

  return <FinancialForm initialData={initialData} />
}
