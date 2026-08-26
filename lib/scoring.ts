import {
  MOTIVATION_ITEMS, TEMPERAMENT_ITEMS, OWNERSHIP_STYLE_ITEMS,
  RISK_ITEMS, SKILLS, SECTOR_DB, CRITERIA_WEIGHTS, TOTAL_WEIGHT,
} from './constants'

export type SkillEntry = { rating: number; enjoy: boolean }
export type CapabilitySkills = Record<string, SkillEntry>

export type MotivationData = {
  scores: Record<number, number>
  why: string
  changes: string
  twoYears: string
  failureDespiteProfit: string
  completed: boolean
}

export type TemperamentData = {
  scores: Record<string, number>
  completed: boolean
}

export type OwnershipStyleData = {
  scores: Record<string, number>
  completed: boolean
}

export type CapabilityData = {
  skills: CapabilitySkills
  completed: boolean
}

export type FinancialData = {
  capitalAvailable: string
  riskCapital: string
  existingDebt: string
  additionalCapital: string
  desiredSize: string
  minHouseholdIncome: string
  desiredDrawings: string
  maxGuarantee: string
  reserveMonths: string
  maxLeverage: string
  completed: boolean
}

export type RiskData = {
  scores: Record<number, number>
  completed: boolean
}

export type LifestyleData = {
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
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
export const round1 = (n: number) => Math.round(n * 10) / 10

export function motivationScore(m: MotivationData) {
  const vals = MOTIVATION_ITEMS.map((_, i) => m.scores[i] || 0)
  const answered = vals.filter((v) => v > 0).length
  const total = vals.reduce((a, b) => a + b, 0)
  const redFlags: string[] = []
  if ((m.scores[4] || 0) > 0 && m.scores[4] <= 2) redFlags.push("Low tolerance for a demanding multi-year period of ownership.")
  if ((m.scores[7] || 0) > 0 && m.scores[7] <= 2) redFlags.push("Low tolerance for income uncertainty — worth stress-testing your financial runway.")
  if ((m.scores[9] || 0) > 0 && m.scores[9] <= 2) redFlags.push("Motivation may be narrowly framed around leaving employment rather than ownership itself.")
  return { total, max: MOTIVATION_ITEMS.length * 5, answered, redFlags }
}

export function temperamentScores(t: TemperamentData) {
  const cats: Record<string, number> = {}
  Object.entries(TEMPERAMENT_ITEMS).forEach(([cat, items]) => {
    const vals = items.map((_, i) => t.scores[`${cat}__${i}`] || 0)
    const answered = vals.filter((v) => v > 0)
    cats[cat] = answered.length ? round1(answered.reduce((a, b) => a + b, 0) / answered.length) : 0
  })
  const answeredCats = Object.values(cats).filter((v) => v > 0)
  const overall = answeredCats.length ? round1(answeredCats.reduce((a, b) => a + b, 0) / answeredCats.length) : 0
  return { cats, overall }
}

export function ownershipStyleScores(o: OwnershipStyleData) {
  const raw: Record<string, number> = {}
  Object.entries(OWNERSHIP_STYLE_ITEMS).forEach(([cat, items]) => {
    const vals = items.map((_, i) => o.scores[`${cat}__${i}`] || 0)
    raw[cat] = vals.reduce((a, b) => a + b, 0)
  })
  const sum = Object.values(raw).reduce((a, b) => a + b, 0)
  const pctOut: Record<string, number> = {}
  Object.entries(raw).forEach(([cat, v]) => { pctOut[cat] = sum > 0 ? round1((v / sum) * 100) : 0 })
  return pctOut
}

export function capabilitySummary(c: CapabilityData) {
  const entries = Object.entries(c.skills).filter(([, v]) => v && v.rating > 0)
  const bySkill = entries.map(([key, v]) => ({
    key, label: SKILLS.find((s) => s.key === key)?.label || key,
    rating: v.rating, enjoy: !!v.enjoy,
  }))
  const strengths = [...bySkill].sort((a, b) => (b.rating + (b.enjoy ? 0.5 : 0)) - (a.rating + (a.enjoy ? 0.5 : 0))).slice(0, 5)
  const weaknesses = [...bySkill].filter((s) => s.rating <= 2).sort((a, b) => a.rating - b.rating).slice(0, 5)
  const enjoyedNotStrong = bySkill.filter((s) => s.enjoy && s.rating <= 3)
  const strongDisliked = bySkill.filter((s) => !s.enjoy && s.rating >= 4)
  return { bySkill, strengths, weaknesses, enjoyedNotStrong, strongDisliked, answered: entries.length }
}

export function financialReadiness(f: FinancialData) {
  const capital = parseFloat(f.capitalAvailable) || 0
  const risk = parseFloat(f.riskCapital) || 0
  const debt = parseFloat(f.existingDebt) || 0
  const reserveMonths = parseFloat(f.reserveMonths) || 0
  let score = 0, max = 0
  const warnings: string[] = []
  max += 25
  if (capital > 0 && risk > 0) {
    const riskRatio = risk / capital
    if (riskRatio >= 0.9) { score += 25 }
    else if (riskRatio >= 0.6) { score += 16 }
    else { score += 8; warnings.push("The amount you can genuinely afford to lose is much lower than your available capital — treat any purchase price near your full capital with caution.") }
  }
  max += 25
  if (reserveMonths >= 12) score += 25
  else if (reserveMonths >= 6) score += 18
  else if (reserveMonths >= 3) score += 10
  else warnings.push("Fewer than 3 months of personal reserves is a thin buffer for the uncertainty of a first year of ownership.")
  max += 25
  const leverageMap: Record<string, number> = { low: 25, moderate: 18, high: 8 }
  score += leverageMap[f.maxLeverage] ?? 15
  if (f.maxLeverage === "high") warnings.push("High leverage comfort increases downside risk — make sure debt-service coverage is stress-tested before committing.")
  max += 25
  if (capital > 0) {
    const debtRatio = debt / (capital + 1)
    if (debtRatio < 0.2) score += 25
    else if (debtRatio < 0.5) score += 15
    else { score += 5; warnings.push("Existing debt commitments are significant relative to acquisition capital — factor this into affordability.") }
  } else {
    score += 10
  }
  if (!capital) warnings.unshift("Capital figures are not yet entered — this score is only indicative until you do.")
  return { score: max ? round1((score / max) * 100) : 0, warnings }
}

export function riskSummary(r: RiskData) {
  const entries = RISK_ITEMS.map((label, i) => ({ label, value: r.scores[i] || 0 })).filter((e) => e.value > 0)
  const leastAcceptable = [...entries].sort((a, b) => a.value - b.value).slice(0, 3)
  const manageable = [...entries].sort((a, b) => b.value - a.value).slice(0, 3)
  return { entries, leastAcceptable, manageable, answered: entries.length }
}

export function userDemandCapacity(l: LifestyleData) {
  let cap = 3
  if (l.weeklyHours <= 35) cap -= 1.2; else if (l.weeklyHours >= 55) cap += 1.2; else if (l.weeklyHours >= 45) cap += 0.4
  if (l.weekendTolerance === "never") cap -= 1; else if (l.weekendTolerance === "regular") cap += 1
  if (l.emergencyTolerance === "none") cap -= 0.6; else if (l.emergencyTolerance === "anytime") cap += 0.6
  return clamp(round1(cap), 1, 5)
}

function skillsMatchForSector(sector: typeof SECTOR_DB[number], capability: CapabilityData) {
  const rated = sector.requiredSkills.map((k) => capability.skills[k]?.rating).filter((v): v is number => (v ?? 0) > 0)
  if (!rated.length) return 3
  return rated.reduce((a, b) => a + b, 0) / rated.length
}

export function computeSectorScore(
  sector: typeof SECTOR_DB[number],
  profile: { capability: CapabilityData; lifestyle: LifestyleData; interests: string[]; buyBox?: { sectorsExcluded: string[] } | null }
) {
  const { capability, lifestyle, interests } = profile
  const skillsMatch = skillsMatchForSector(sector, capability)
  const enjoyCount = sector.requiredSkills.filter((k) => capability.skills[k]?.enjoy).length
  const abilityToAddValue = clamp(round1(skillsMatch + (enjoyCount >= sector.requiredSkills.length / 2 ? 0.5 : -0.3)), 1, 5)
  const capacity = userDemandCapacity(lifestyle)
  const lifestyleCompatibility = clamp(round1(5 - Math.abs(sector.lifestyleDemand - capacity)), 1, 5)
  const personalInterest = interests.includes(sector.id) ? 5 : 2.5

  const values: Record<string, number> = {
    personalInterest,
    existingKnowledge: skillsMatch,
    transferableSkills: skillsMatch,
    operationalUnderstanding: skillsMatch,
    abilityToAddValue,
    demandResilience: sector.demandResilience,
    recurringRevenue: sector.recurringRevenue,
    customerDiversification: sector.customerDiversification,
    competitiveFragmentation: sector.competitiveFragmentation,
    marginPotential: sector.marginPotential,
    cashGeneration: sector.cashGeneration,
    capitalIntensity: 6 - sector.capitalIntensity,
    ownerIndependence: sector.ownerIndependence,
    staffAvailability: sector.staffAvailability,
    regulatoryManageability: 6 - sector.regulatoryIntensity,
    technologyOpportunity: sector.techOpportunity,
    growthPotential: sector.growthPotential,
    financingSuitability: sector.financingSuitability,
    exitPotential: sector.exitPotential,
    lifestyleCompatibility,
  }

  let weightedSum = 0
  CRITERIA_WEIGHTS.forEach((c) => { weightedSum += (values[c.key] || 0) * c.weight })
  const scoreOn100 = round1((weightedSum / (TOTAL_WEIGHT * 5)) * 100)

  const hardExcluded = (sector.weekendDependent && lifestyle.weekendTolerance === "never") ||
    (profile.buyBox?.sectorsExcluded || []).includes(sector.id)
  const exclusionReason = hardExcluded
    ? (sector.weekendDependent && lifestyle.weekendTolerance === "never"
      ? "This sector typically requires weekend owner presence, which you've ruled out."
      : "You excluded this sector from your Buy Box.")
    : null

  return { sector, values, scoreOn100, hardExcluded, exclusionReason }
}

export function computeAllSectorScores(profile: Parameters<typeof computeSectorScore>[1]) {
  return SECTOR_DB.map((s) => computeSectorScore(s, profile)).sort((a, b) => b.scoreOn100 - a.scoreOn100)
}

export type BuyBoxDraft = {
  geography: string
  maxDistance: string
  sectorsPreferred: string[]
  sectorsExcluded: string[]
  revenueMin: string; revenueMax: string
  ebitdaMin: string; ebitdaMax: string
  priceMin: string; priceMax: string
  employeeMin: string; employeeMax: string
  minMargin: string; minRecurring: string
  maxCustomerConcentration: string; maxSupplierConcentration: string
  minYearsTrading: string; cashConversion: string; maxCapex: string
  maxSellerDependency: string; maxOwnerHours: string
  dealTypes: string[]
  ownershipModel: string
}

export type FullProfile = {
  name: string
  motivation: MotivationData
  temperament: TemperamentData
  ownershipStyle: OwnershipStyleData
  capability: CapabilityData
  financial: FinancialData
  risk: RiskData
  lifestyle: LifestyleData
  interests: string[]
}

export function draftBuyBox(
  profile: Pick<FullProfile, 'financial' | 'ownershipStyle' | 'lifestyle'> & { buyBox?: { sectorsExcluded: string[] } | null },
  sectorScores: ReturnType<typeof computeAllSectorScores>
): BuyBoxDraft {
  const top = sectorScores.filter((s) => !s.hardExcluded).slice(0, 5).map((s) => s.sector.id)
  const cap = parseFloat(profile.financial.capitalAvailable) || 0
  const desiredSize = profile.financial.desiredSize || ''
  const styleScores = ownershipStyleScores(profile.ownershipStyle)
  const dominantStyle = Object.entries(styleScores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Operator'
  const ownershipModel = dominantStyle.includes('Investor') ? 'Strategic owner' : dominantStyle.includes('Manager') ? 'Owner-manager' : 'Owner/operator'
  return {
    geography: 'United Kingdom',
    maxDistance: String(profile.lifestyle.maxCommute || 45),
    sectorsPreferred: top,
    sectorsExcluded: profile.buyBox?.sectorsExcluded || [],
    revenueMin: '', revenueMax: '',
    ebitdaMin: '', ebitdaMax: desiredSize,
    priceMin: '', priceMax: cap ? String(Math.round(cap)) : '',
    employeeMin: '', employeeMax: '',
    minMargin: '10', minRecurring: '30',
    maxCustomerConcentration: '25', maxSupplierConcentration: '30',
    minYearsTrading: '3', cashConversion: 'moderate-to-high', maxCapex: 'low',
    maxSellerDependency: 'moderate', maxOwnerHours: String(profile.lifestyle.weeklyHours || 45),
    dealTypes: ['Retirement sale', 'Under-managed business'],
    ownershipModel,
  }
}

export function buyBoxThesis(bb: BuyBoxDraft, sectorScores: ReturnType<typeof computeAllSectorScores>): string {
  const topNames = (bb.sectorsPreferred || [])
    .map((id) => SECTOR_DB.find((s) => s.id === id)?.name)
    .filter((n): n is string => !!n)
  const sectorPhrase = topNames.length ? topNames.slice(0, 3).join(', ') : 'sectors matched to your profile'
  const priceRange = bb.priceMax ? `up to roughly £${Number(bb.priceMax).toLocaleString()}` : 'within your available capital'
  return (
    `Seek established UK businesses in ${sectorPhrase}, priced ${priceRange}, with at least ${bb.minRecurring}% recurring or repeat revenue, ` +
    `no more than ${bb.maxCustomerConcentration}% revenue from a single customer, ${bb.minYearsTrading}+ years trading history, ` +
    `${bb.maxSellerDependency} seller dependency, and demands compatible with roughly ${bb.maxOwnerHours} owner hours per week — ` +
    `where process, systems and ${bb.ownershipModel === 'Strategic owner' ? 'professional management' : 'hands-on improvement'} can increase profitability.`
  )
}
