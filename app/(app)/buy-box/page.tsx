import { createClient } from '@/lib/supabase/server'
import { db } from '@/src/prisma/db'
import {
  type FullProfile, type BuyBoxDraft,
  type MotivationData, type TemperamentData, type OwnershipStyleData,
  type CapabilityData, type CapabilitySkills, type FinancialData,
  type RiskData, type LifestyleData,
} from '@/lib/scoring'
import BuyBoxForm from './Form'

const defaultMotivation: MotivationData = { scores: {}, why: '', changes: '', twoYears: '', failureDespiteProfit: '', completed: false }
const defaultTemperament: TemperamentData = { scores: {}, completed: false }
const defaultOwnershipStyle: OwnershipStyleData = { scores: {}, completed: false }
const defaultCapability: CapabilityData = { skills: {}, completed: false }
const defaultFinancial: FinancialData = { capitalAvailable: '', riskCapital: '', existingDebt: '', additionalCapital: '', desiredSize: '', minHouseholdIncome: '', desiredDrawings: '', maxGuarantee: '', reserveMonths: '6', maxLeverage: 'moderate', completed: false }
const defaultRisk: RiskData = { scores: {}, completed: false }
const defaultLifestyle: LifestyleData = { weeklyHours: 45, maxCommute: 45, weekendTolerance: 'occasional', emergencyTolerance: 'sometimes', travelTolerance: 'regional', customerFacing: 'yes', relocate: 'no', remotePref: 'hybrid', longTermInvolvement: 'owner-manager', minPersonalIncome: 0, completed: false }

export default async function BuyBoxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const name = user.user_metadata?.name ?? user.email ?? 'Navigator'

  let profile: FullProfile = {
    name,
    motivation: defaultMotivation,
    temperament: defaultTemperament,
    ownershipStyle: defaultOwnershipStyle,
    capability: defaultCapability,
    financial: defaultFinancial,
    risk: defaultRisk,
    lifestyle: defaultLifestyle,
    interests: [],
  }
  let initialBuyBox: BuyBoxDraft | null = null

  try {
    const [mot, tem, own, fin, life, capRows, riskRows, interestRows, buyBoxRow] = await Promise.all([
      db.orm.public.Motivation.where({ userId: user.id }).first(),
      db.orm.public.Temperament.where({ userId: user.id }).first(),
      db.orm.public.OwnershipStyle.where({ userId: user.id }).first(),
      db.orm.public.FinancialReadiness.where({ userId: user.id }).first(),
      db.orm.public.Lifestyle.where({ userId: user.id }).first(),
      db.orm.public.CapabilityRating.where({ userId: user.id }).all(),
      db.orm.public.RiskRating.where({ userId: user.id }).all(),
      db.orm.public.SectorInterest.where({ userId: user.id }).all(),
      db.orm.public.BuyBox.where({ userId: user.id }).first(),
    ])

    const skills: CapabilitySkills = {}
    capRows.forEach((r) => { skills[r.skillKey] = { rating: r.rating, enjoy: r.enjoy } })

    const riskScores: Record<number, number> = {}
    riskRows.forEach((r) => { riskScores[parseInt(r.riskKey)] = r.tolerance })

    profile = {
      name,
      motivation: mot ? {
        scores: (mot.scores as Record<number, number>) || {},
        why: mot.why || '', changes: mot.changes || '',
        twoYears: mot.twoYears || '', failureDespiteProfit: mot.failureDespiteProfit || '',
        completed: mot.completed,
      } : defaultMotivation,
      temperament: tem ? {
        scores: (tem.scores as Record<string, number>) || {},
        completed: tem.completed,
      } : defaultTemperament,
      ownershipStyle: own ? {
        scores: (own.scores as Record<string, number>) || {},
        completed: own.completed,
      } : defaultOwnershipStyle,
      capability: { skills, completed: capRows.length >= 24 },
      financial: fin ? {
        capitalAvailable: fin.capitalAvailable != null ? String(fin.capitalAvailable) : '',
        riskCapital: fin.riskCapital != null ? String(fin.riskCapital) : '',
        existingDebt: fin.existingDebt != null ? String(fin.existingDebt) : '',
        additionalCapital: fin.additionalCapital != null ? String(fin.additionalCapital) : '',
        desiredSize: fin.desiredSize != null ? String(fin.desiredSize) : '',
        minHouseholdIncome: fin.minHouseholdIncome != null ? String(fin.minHouseholdIncome) : '',
        desiredDrawings: fin.desiredDrawings != null ? String(fin.desiredDrawings) : '',
        maxGuarantee: fin.maxGuarantee != null ? String(fin.maxGuarantee) : '',
        reserveMonths: fin.reserveMonths,
        maxLeverage: fin.maxLeverage,
        completed: fin.completed,
      } : defaultFinancial,
      risk: { scores: riskScores, completed: riskRows.length >= 15 },
      lifestyle: life ? {
        weeklyHours: life.weeklyHours,
        maxCommute: life.maxCommute,
        weekendTolerance: life.weekendTolerance,
        emergencyTolerance: life.emergencyTolerance,
        travelTolerance: life.travelTolerance,
        customerFacing: life.customerFacing,
        relocate: life.relocate,
        remotePref: life.remotePref,
        longTermInvolvement: life.longTermInvolvement,
        minPersonalIncome: life.minPersonalIncome,
        completed: life.completed,
      } : defaultLifestyle,
      interests: interestRows.map((r) => r.sectorId),
    }

    if (buyBoxRow) {
      initialBuyBox = {
        geography: buyBoxRow.geography,
        maxDistance: buyBoxRow.maxDistance,
        sectorsPreferred: buyBoxRow.sectorsPreferred ? buyBoxRow.sectorsPreferred.split(',').filter(Boolean) : [],
        sectorsExcluded: buyBoxRow.sectorsExcluded ? buyBoxRow.sectorsExcluded.split(',').filter(Boolean) : [],
        revenueMin: buyBoxRow.revenueMin, revenueMax: buyBoxRow.revenueMax,
        ebitdaMin: buyBoxRow.ebitdaMin, ebitdaMax: buyBoxRow.ebitdaMax,
        priceMin: buyBoxRow.priceMin, priceMax: buyBoxRow.priceMax,
        employeeMin: buyBoxRow.employeeMin, employeeMax: buyBoxRow.employeeMax,
        minMargin: buyBoxRow.minMargin, minRecurring: buyBoxRow.minRecurring,
        maxCustomerConcentration: buyBoxRow.maxCustomerConcentration,
        maxSupplierConcentration: buyBoxRow.maxSupplierConcentration,
        minYearsTrading: buyBoxRow.minYearsTrading,
        cashConversion: buyBoxRow.cashConversion, maxCapex: buyBoxRow.maxCapex,
        maxSellerDependency: buyBoxRow.maxSellerDependency,
        maxOwnerHours: buyBoxRow.maxOwnerHours,
        dealTypes: buyBoxRow.dealTypes ? buyBoxRow.dealTypes.split(',').filter(Boolean) : [],
        ownershipModel: buyBoxRow.ownershipModel,
      }
    }
  } catch {}

  return <BuyBoxForm profile={profile} initialBuyBox={initialBuyBox} />
}
