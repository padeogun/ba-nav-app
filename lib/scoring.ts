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

export type OpportunityInput = {
  askingPrice: string
  ebitda: string
  revenue: string
  employees: string
  yearsTrading: string
  sector: string
}

export function scoreOpportunity(opp: OpportunityInput, bb: BuyBoxDraft): { score: number; flags: string[] } {
  const p = (s: string) => { const n = parseFloat(s); return isNaN(n) ? null : n }
  const flags: string[] = []
  let score = 100

  const price = p(opp.askingPrice)
  const priceMax = p(bb.priceMax)
  const priceMin = p(bb.priceMin)
  if (price !== null && priceMax !== null && price > priceMax) {
    score -= 30
    flags.push(`Asking price £${price.toLocaleString()} exceeds your Buy Box maximum of £${priceMax.toLocaleString()}`)
  } else if (price !== null && priceMin !== null && price < priceMin) {
    flags.push(`Asking price is below your minimum — may indicate thin margins`)
  }

  const ebitda = p(opp.ebitda)
  const ebitdaMin = p(bb.ebitdaMin)
  const ebitdaMax = p(bb.ebitdaMax)
  if (ebitda !== null && ebitdaMin !== null && ebitda < ebitdaMin) {
    score -= 25
    flags.push(`EBITDA £${ebitda.toLocaleString()} is below your target minimum of £${ebitdaMin.toLocaleString()}`)
  } else if (ebitda !== null && ebitdaMax !== null && ebitda > ebitdaMax) {
    score -= 5
    flags.push(`EBITDA £${ebitda.toLocaleString()} exceeds your target maximum — may be outside price range`)
  }

  const years = p(opp.yearsTrading)
  const minYears = p(bb.minYearsTrading)
  if (years !== null && minYears !== null && years < minYears) {
    score -= 20
    flags.push(`${years} years trading — below your Buy Box minimum of ${minYears}`)
  }

  if (opp.sector) {
    if (bb.sectorsExcluded.includes(opp.sector)) {
      score -= 10
      flags.push('You excluded this sector from your Buy Box')
    } else if (bb.sectorsPreferred.length > 0 && !bb.sectorsPreferred.includes(opp.sector)) {
      score -= 5
      flags.push('Sector is not in your Buy Box preferred list')
    }
  }

  return { score: Math.max(0, score), flags }
}

// ── Analysis module types ────────────────────────────────────────────────────

export type QualityScores = {
  rq: number[]; pq: number[]; oq: number[]; sq: number[]; rkq: number[]
}
export type OwnerDepScores = Record<string, number>
export type FlagRating = '' | 'green' | 'amber' | 'red' | 'breaker'
export type RedFlags = Record<string, FlagRating>
export type FitScores = Record<string, number>

export function emptyQuality(): QualityScores {
  return { rq: [0,0,0,0,0], pq: [0,0,0,0,0], oq: [0,0,0,0,0], sq: [0,0,0,0,0], rkq: [0,0,0,0,0] }
}
export const OWNER_DEP_KEYS = [
  'sells','managesStaff','pricesWork','managesCustomers','approvesPurchasing',
  'knowsSuppliers','understandsSystems','solvesTechnical','managesCash',
  'holdsLicences','ownsRelationships','knowsEverything',
] as const
export const RED_FLAG_KEYS = [
  'unclearAccounts','profitCashMismatch','excessiveAdjustments','customerConcentration',
  'keyPersonDependency','sellerControlledSales','revenueDeclining','highTurnover',
  'deferredCapex','supplierConcentration','litigation','regulatoryIssues','taxUncertainty',
  'workingCapitalProblems','forecastDependentValuation','ddResistance',
  'unconvincingReasonForSale','underpaidOwner','revenueMultipleNoEarnings','dealFever',
] as const
export const FIT_KEYS = [
  'personalInterest','skillsFit','managementFit','financialFit','lifestyleFit',
  'riskFit','strategicFit','abilityToAddValue','longTermWealthPotential',
] as const

export function emptyOwnerDep(): OwnerDepScores {
  return Object.fromEntries(OWNER_DEP_KEYS.map(k => [k, 0]))
}
export function emptyRedFlags(): RedFlags {
  return Object.fromEntries(RED_FLAG_KEYS.map(k => [k, ''])) as RedFlags
}
export function emptyFitScores(): FitScores {
  return Object.fromEntries(FIT_KEYS.map(k => [k, 0]))
}
export function parseAnalysis<T>(json: string, fallback: T): T {
  try { const v = JSON.parse(json); return v ?? fallback } catch { return fallback }
}

export type DecisionResult = {
  recommendation: 'reject' | 'park' | 'gather-info' | 'investigate' | 'due-diligence' | 'offer'
  personalFitScore: number
  businessQualityScore: number
  ownerDependencyScore: number
  redFlagCounts: { breakers: number; reds: number; ambers: number }
  blendedScore: number
  reasons: string[]
  risks: string[]
  missingInfo: string[]
  nextActions: string[]
}

export function computeDecision(opts: {
  qualityScores: QualityScores
  ownerDepScores: OwnerDepScores
  redFlags: RedFlags
  fitScores: FitScores
  buyBoxScore: number
}): DecisionResult {
  const { qualityScores, ownerDepScores, redFlags, fitScores, buyBoxScore } = opts

  const flagValues = Object.values(redFlags) as FlagRating[]
  const breakers = flagValues.filter(f => f === 'breaker').length
  const reds = flagValues.filter(f => f === 'red').length
  const ambers = flagValues.filter(f => f === 'amber').length
  const unassessed = flagValues.filter(f => f === '').length

  const allQ = [...qualityScores.rq, ...qualityScores.pq, ...qualityScores.oq, ...qualityScores.sq, ...qualityScores.rkq]
  const ratedQ = allQ.filter(v => v > 0)
  const businessQualityScore = ratedQ.length ? Math.round(ratedQ.reduce((a,b)=>a+b,0)/ratedQ.length*20) : 0

  const depVals = Object.values(ownerDepScores) as number[]
  const ratedDep = depVals.filter(v => v > 0)
  const ownerDependencyScore = ratedDep.length ? Math.round(ratedDep.reduce((a,b)=>a+b,0)/ratedDep.length*20) : 0

  const fitVals = Object.values(fitScores) as number[]
  const ratedFit = fitVals.filter(v => v > 0)
  const personalFitScore = ratedFit.length ? Math.round(ratedFit.reduce((a,b)=>a+b,0)/ratedFit.length*10) : 0

  const blendedScore = Math.round(
    personalFitScore * 0.40 + businessQualityScore * 0.30 +
    buyBoxScore * 0.20 + ownerDependencyScore * 0.10
  )

  let recommendation: DecisionResult['recommendation']
  if (breakers > 0) recommendation = 'reject'
  else if (reds >= 3 || (blendedScore < 30 && ratedFit.length >= 5)) recommendation = 'reject'
  else if (reds >= 1 || (blendedScore < 45 && ratedFit.length >= 5)) recommendation = 'park'
  else if (unassessed > 10 || ratedQ.length < 10 || ratedFit.length < 5) recommendation = 'gather-info'
  else if (blendedScore < 55) recommendation = 'park'
  else if (blendedScore < 65) recommendation = 'investigate'
  else if (blendedScore < 78) recommendation = 'due-diligence'
  else recommendation = 'offer'

  const reasons: string[] = []
  const risks: string[] = []
  const missingInfo: string[] = []
  const nextActions: string[] = []

  if (breakers > 0) reasons.push(`${breakers} deal-breaker flag${breakers > 1 ? 's' : ''} — immediate disqualifier`)
  if (reds > 0) reasons.push(`${reds} red flag${reds > 1 ? 's' : ''} requiring serious investigation`)
  if (buyBoxScore >= 80) reasons.push(`Strong Buy Box alignment (${buyBoxScore}/100)`)
  else if (buyBoxScore >= 60) reasons.push(`Reasonable Buy Box alignment (${buyBoxScore}/100)`)
  else if (buyBoxScore > 0 && buyBoxScore < 60) reasons.push(`Weak Buy Box alignment (${buyBoxScore}/100)`)
  if (personalFitScore >= 70) reasons.push(`Strong personal fit (${personalFitScore}/100)`)
  else if (personalFitScore > 0 && personalFitScore < 50) reasons.push(`Low personal fit (${personalFitScore}/100)`)
  if (businessQualityScore >= 70) reasons.push(`Good business quality indicators (${businessQualityScore}/100)`)
  else if (businessQualityScore > 0 && businessQualityScore < 50) reasons.push(`Below-average business quality (${businessQualityScore}/100)`)
  if (ownerDependencyScore >= 70 && ratedDep.length >= 8) reasons.push('Business appears operationally independent of the seller')

  if (ownerDependencyScore < 50 && ratedDep.length >= 6) risks.push(`High owner dependency risk (${ownerDependencyScore}/100) — business relies heavily on the seller`)
  if (ambers >= 3) risks.push(`${ambers} amber flags require detailed explanation before advancing`)
  if (reds > 0) risks.push(`${reds} red flag${reds > 1 ? 's' : ''} identified — material concerns`)
  const rkqR = qualityScores.rkq.filter(v=>v>0)
  if (rkqR.length >= 3 && rkqR.reduce((a,b)=>a+b,0)/rkqR.length < 3) risks.push('Risk profile indicators are below average — elevated structural risk')
  const rqR = qualityScores.rq.filter(v=>v>0)
  if (rqR.length >= 3 && rqR.reduce((a,b)=>a+b,0)/rqR.length < 3) risks.push('Revenue quality is below average — income may be unpredictable or non-recurring')

  if (ratedQ.length < 15) missingInfo.push(`Business quality incomplete (${ratedQ.length}/25 items rated)`)
  if (ratedDep.length < 8) missingInfo.push(`Owner dependency incomplete (${ratedDep.length}/12 items rated)`)
  if (unassessed > 8) missingInfo.push(`${unassessed} red flag categories not yet assessed`)
  if (ratedFit.length < 7) missingInfo.push(`Personal fit incomplete (${ratedFit.length}/9 items scored)`)
  if (buyBoxScore === 0) missingInfo.push('No Buy Box defined — define yours to improve recommendation accuracy')

  switch (recommendation) {
    case 'reject':
      nextActions.push('Do not advance this opportunity')
      if (breakers > 0) nextActions.push('Document the deal-breaker finding for reference when screening similar opportunities')
      break
    case 'park':
      nextActions.push('Set a review date 3–6 months out — circumstances may change')
      nextActions.push('Clarify red flag concerns before revisiting')
      nextActions.push('Continue pipeline search — do not hold capacity for a parked opportunity')
      break
    case 'gather-info':
      nextActions.push('Complete the business quality and owner dependency assessments')
      nextActions.push('Assess all outstanding red flag categories')
      nextActions.push('Request an information memorandum or management accounts from the broker')
      break
    case 'investigate':
      nextActions.push('Schedule a preliminary call with the broker or seller')
      nextActions.push('Request last 3 years\' accounts and recent management accounts')
      nextActions.push('Prepare targeted questions on each amber and red flag')
      nextActions.push('Engage an accountant for a preliminary financial review')
      break
    case 'due-diligence':
      nextActions.push('Request the full information memorandum')
      nextActions.push('Appoint a corporate finance adviser and solicitor')
      nextActions.push('Commission financial, legal, and commercial due diligence')
      nextActions.push('Draft indicative heads of terms')
      break
    case 'offer':
      nextActions.push('Consider submitting a letter of intent or indicative offer')
      nextActions.push('Appoint a corporate finance adviser to structure and model the deal')
      nextActions.push('Instruct a solicitor to review all legal documentation')
      nextActions.push('Engage a commercial lender or finance broker to model acquisition finance')
      break
  }

  return {
    recommendation, personalFitScore, businessQualityScore, ownerDependencyScore,
    redFlagCounts: { breakers, reds, ambers },
    blendedScore,
    reasons: reasons.slice(0, 6),
    risks: risks.slice(0, 5),
    missingInfo,
    nextActions,
  }
}

// ────────────────────────────────────────────────────────────────────────────

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
