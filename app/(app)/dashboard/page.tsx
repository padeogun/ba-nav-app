import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/src/prisma/db'
import {
  motivationScore, temperamentScores, ownershipStyleScores, financialReadiness,
  computeAllSectorScores, buyBoxThesis,
  type MotivationData, type TemperamentData, type OwnershipStyleData,
  type CapabilityData, type CapabilitySkills, type FinancialData,
  type RiskData, type LifestyleData, type BuyBoxDraft,
} from '@/lib/scoring'
import RadarPanel from './RadarPanel'

const MODULES = [
  { key: 'motivation', label: 'Motivation', description: 'Why do you want to own a business?', href: '/assessment/motivation' },
  { key: 'temperament', label: 'Temperament', description: 'Decision-making, accountability, resilience.', href: '/assessment/temperament' },
  { key: 'ownership', label: 'Ownership style', description: 'Operator, manager, or strategic owner?', href: '/assessment/ownership' },
  { key: 'capability', label: 'Capability', description: '24 business skills rated and enjoyed.', href: '/assessment/capability' },
  { key: 'financial', label: 'Financial readiness', description: 'Capital, reserves, leverage comfort.', href: '/assessment/financial' },
  { key: 'risk', label: 'Risk tolerance', description: '15 risk categories rated.', href: '/assessment/risk' },
  { key: 'lifestyle', label: 'Lifestyle', description: 'Hours, travel, involvement preferences.', href: '/assessment/lifestyle' },
]

const defaultMotivation: MotivationData = { scores: {}, why: '', changes: '', twoYears: '', failureDespiteProfit: '', completed: false }
const defaultTemperament: TemperamentData = { scores: {}, completed: false }
const defaultOwnershipStyle: OwnershipStyleData = { scores: {}, completed: false }
const defaultCapability: CapabilityData = { skills: {}, completed: false }
const defaultFinancial: FinancialData = { capitalAvailable: '', riskCapital: '', existingDebt: '', additionalCapital: '', desiredSize: '', minHouseholdIncome: '', desiredDrawings: '', maxGuarantee: '', reserveMonths: '6', maxLeverage: 'moderate', completed: false }
const defaultLifestyle: LifestyleData = { weeklyHours: 45, maxCommute: 45, weekendTolerance: 'occasional', emergencyTolerance: 'sometimes', travelTolerance: 'regional', customerFacing: 'yes', relocate: 'no', remotePref: 'hybrid', longTermInvolvement: 'owner-manager', minPersonalIncome: 0, completed: false }

function scoreColor(pct: number) {
  return pct >= 70 ? 'var(--teal)' : pct >= 45 ? 'var(--amber)' : 'var(--rust)'
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let displayName = user.user_metadata?.name ?? 'Navigator'
  const completedModules = new Set<string>()

  let motivation = defaultMotivation
  let temperament = defaultTemperament
  let ownershipStyle = defaultOwnershipStyle
  let capability = defaultCapability
  let financial = defaultFinancial
  let lifestyle = defaultLifestyle
  let risk: RiskData = { scores: {}, completed: false }
  let interests: string[] = []
  let buyBoxExcluded: string[] = []
  let buyBoxRow: BuyBoxDraft | null = null

  try {
    const [prismaUser, mot, tem, own, fin, life, capRows, riskRows, interestRows, bb] = await Promise.all([
      db.orm.public.User.where({ id: user.id }).first(),
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

    if (!prismaUser) {
      await db.orm.public.User.create({ id: user.id, email: user.email!, name: user.user_metadata?.name ?? null })
    } else {
      displayName = prismaUser.name ?? displayName
    }

    if (mot) {
      motivation = { scores: (mot.scores as Record<number, number>) || {}, why: mot.why || '', changes: mot.changes || '', twoYears: mot.twoYears || '', failureDespiteProfit: mot.failureDespiteProfit || '', completed: mot.completed }
      if (mot.completed) completedModules.add('motivation')
    }
    if (tem) {
      temperament = { scores: (tem.scores as Record<string, number>) || {}, completed: tem.completed }
      if (tem.completed) completedModules.add('temperament')
    }
    if (own) {
      ownershipStyle = { scores: (own.scores as Record<string, number>) || {}, completed: own.completed }
      if (own.completed) completedModules.add('ownership')
    }
    if (fin) {
      financial = {
        capitalAvailable: fin.capitalAvailable != null ? String(fin.capitalAvailable) : '',
        riskCapital: fin.riskCapital != null ? String(fin.riskCapital) : '',
        existingDebt: fin.existingDebt != null ? String(fin.existingDebt) : '',
        additionalCapital: fin.additionalCapital != null ? String(fin.additionalCapital) : '',
        desiredSize: fin.desiredSize != null ? String(fin.desiredSize) : '',
        minHouseholdIncome: fin.minHouseholdIncome != null ? String(fin.minHouseholdIncome) : '',
        desiredDrawings: fin.desiredDrawings != null ? String(fin.desiredDrawings) : '',
        maxGuarantee: fin.maxGuarantee != null ? String(fin.maxGuarantee) : '',
        reserveMonths: fin.reserveMonths, maxLeverage: fin.maxLeverage, completed: fin.completed,
      }
      if (fin.completed) completedModules.add('financial')
    }
    if (life) {
      lifestyle = { weeklyHours: life.weeklyHours, maxCommute: life.maxCommute, weekendTolerance: life.weekendTolerance, emergencyTolerance: life.emergencyTolerance, travelTolerance: life.travelTolerance, customerFacing: life.customerFacing, relocate: life.relocate, remotePref: life.remotePref, longTermInvolvement: life.longTermInvolvement, minPersonalIncome: life.minPersonalIncome, completed: life.completed }
      if (life.completed) completedModules.add('lifestyle')
    }
    const skills: CapabilitySkills = {}
    capRows.forEach((r) => { skills[r.skillKey] = { rating: r.rating, enjoy: r.enjoy } })
    capability = { skills, completed: capRows.length >= 24 }
    if (capRows.length >= 24) completedModules.add('capability')

    const riskScores: Record<number, number> = {}
    riskRows.forEach((r) => { riskScores[parseInt(r.riskKey)] = r.tolerance })
    risk = { scores: riskScores, completed: riskRows.length >= 15 }
    if (riskRows.length >= 15) completedModules.add('risk')

    interests = interestRows.map((r) => r.sectorId)
    buyBoxExcluded = bb?.sectorsExcluded ? bb.sectorsExcluded.split(',').filter(Boolean) : []

    if (bb) {
      buyBoxRow = {
        geography: bb.geography, maxDistance: bb.maxDistance,
        sectorsPreferred: bb.sectorsPreferred ? bb.sectorsPreferred.split(',').filter(Boolean) : [],
        sectorsExcluded: buyBoxExcluded,
        revenueMin: bb.revenueMin, revenueMax: bb.revenueMax,
        ebitdaMin: bb.ebitdaMin, ebitdaMax: bb.ebitdaMax,
        priceMin: bb.priceMin, priceMax: bb.priceMax,
        employeeMin: bb.employeeMin, employeeMax: bb.employeeMax,
        minMargin: bb.minMargin, minRecurring: bb.minRecurring,
        maxCustomerConcentration: bb.maxCustomerConcentration,
        maxSupplierConcentration: bb.maxSupplierConcentration,
        minYearsTrading: bb.minYearsTrading, cashConversion: bb.cashConversion,
        maxCapex: bb.maxCapex, maxSellerDependency: bb.maxSellerDependency,
        maxOwnerHours: bb.maxOwnerHours,
        dealTypes: bb.dealTypes ? bb.dealTypes.split(',').filter(Boolean) : [],
        ownershipModel: bb.ownershipModel,
      }
    }
  } catch {}

  // Compute scores
  const mot = motivationScore(motivation)
  const temp = temperamentScores(temperament)
  const style = ownershipStyleScores(ownershipStyle)
  const dominantStyle = Object.entries(style).sort((a, b) => b[1] - a[1])[0]
  const fin = financialReadiness(financial)

  const allSectorScores = computeAllSectorScores({
    capability, lifestyle, interests, buyBox: { sectorsExcluded: buyBoxExcluded },
  })
  const topSectors = allSectorScores.filter((s) => !s.hardExcluded).slice(0, 3)

  const radarData = Object.entries(temp.cats).map(([cat, v]) => ({ subject: cat, score: v, fullMark: 5 as const }))

  const thesis = buyBoxRow ? buyBoxThesis(buyBoxRow, allSectorScores) : null

  const completedCount = completedModules.size
  const totalModules = MODULES.length

  const summaryCards = [
    {
      label: 'Acquisition readiness',
      value: motivation.completed ? `${mot.total}/${mot.max}` : '—',
      sub: motivation.completed ? `${mot.answered} of ${mot.max / 5} answered` : 'Not yet complete',
      pct: motivation.completed ? (mot.total / mot.max) * 100 : 0,
      done: motivation.completed,
      href: '/assessment/motivation',
    },
    {
      label: 'Ownership style',
      value: ownershipStyle.completed && dominantStyle ? dominantStyle[0] : '—',
      sub: ownershipStyle.completed && dominantStyle ? `${Math.round(dominantStyle[1])}% dominant` : 'Not yet complete',
      pct: ownershipStyle.completed ? 80 : 0,
      done: ownershipStyle.completed,
      href: '/assessment/ownership',
    },
    {
      label: 'Financial readiness',
      value: financial.completed ? `${fin.score}/100` : '—',
      sub: financial.completed ? (fin.warnings.length ? `${fin.warnings.length} warning${fin.warnings.length > 1 ? 's' : ''}` : 'No warnings') : 'Not yet complete',
      pct: financial.completed ? fin.score : 0,
      done: financial.completed,
      href: '/assessment/financial',
    },
    {
      label: 'Temperament',
      value: temperament.completed ? `${temp.overall}/5` : '—',
      sub: temperament.completed ? 'Overall avg across categories' : 'Not yet complete',
      pct: temperament.completed ? (temp.overall / 5) * 100 : 0,
      done: temperament.completed,
      href: '/assessment/temperament',
    },
  ]

  return (
    <div className="ban-fade-in" style={{ padding: '40px', maxWidth: '960px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--brass)', marginBottom: '6px' }}>
          Acquisition Navigator — Dashboard
        </p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '28px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2 }}>
          Welcome back, {displayName.split(' ')[0]}.
        </h1>
        <p style={{ marginTop: '8px', fontSize: '13.5px', color: 'var(--ink-soft)', maxWidth: '560px', lineHeight: 1.6 }}>
          A summary, not a verdict — separate scores by design. Hard exclusions always override a headline number.
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '3px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '6px' }}>
            Profile completeness — {completedCount}/{totalModules} modules
          </div>
          <div className="ban-progress-track">
            <div className="ban-progress-fill" style={{ width: `${(completedCount / totalModules) * 100}%` }} />
          </div>
        </div>
        {completedCount < totalModules && (
          <Link href="/assessment/motivation" style={{ textDecoration: 'none' }}>
            <button type="button" style={{ fontFamily: 'var(--mono)', fontSize: '11px', padding: '8px 14px', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: '2px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Continue assessment →
            </button>
          </Link>
        )}
      </div>

      {/* Summary score cards */}
      <div className="ban-grid-4" style={{ gap: '12px', marginBottom: '20px' }}>
        {summaryCards.map((c) => (
          <Link key={c.label} href={c.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '3px', padding: '16px', cursor: 'pointer' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
                {c.label}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '22px', fontWeight: 700, color: c.done ? scoreColor(c.pct) : 'var(--muted)', marginBottom: '4px' }}>
                {c.value}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{c.sub}</div>
              {c.done && c.pct > 0 && (
                <div className="ban-progress-track" style={{ marginTop: '8px' }}>
                  <div className="ban-progress-fill" style={{ width: `${c.pct}%`, background: scoreColor(c.pct) }} />
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Radar + Top sectors */}
      <div className="ban-grid-2" style={{ gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '3px', padding: '20px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
            Temperament profile
          </div>
          <RadarPanel data={radarData} />
          {temperament.completed && temp.overall > 0 && (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '18px', fontWeight: 700, color: scoreColor((temp.overall / 5) * 100) }}>
                {temp.overall}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Overall avg / 5</span>
            </div>
          )}
        </div>

        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '3px', padding: '20px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
            Top sector matches
          </div>
          {topSectors.length > 0 && capability.completed ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              {topSectors.map((s, i) => {
                const tone = s.scoreOn100 >= 65 ? 'var(--teal)' : s.scoreOn100 >= 45 ? 'var(--amber)' : 'var(--rust)'
                return (
                  <div key={s.sector.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)', marginRight: '8px' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--ink)' }}>{s.sector.name}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '16px', fontWeight: 700, color: tone }}>
                      {s.scoreOn100}
                    </span>
                  </div>
                )
              })}
              <Link href="/sectors" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '6px' }}>
                <button type="button" style={{ fontFamily: 'var(--mono)', fontSize: '11px', padding: '6px 12px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '2px', color: 'var(--muted)', cursor: 'pointer' }}>
                  View full ranking →
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 10px' }}>
              <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '10px' }}>
                Complete the Capability assessment to see your sector matches.
              </p>
              <Link href="/assessment/capability" style={{ textDecoration: 'none' }}>
                <button type="button" style={{ fontFamily: 'var(--mono)', fontSize: '11px', padding: '6px 12px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '2px', color: 'var(--muted)', cursor: 'pointer' }}>
                  Start now →
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Buy Box thesis */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '3px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            My Buy Box
          </div>
          <Link href="/buy-box" style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--brass)', textDecoration: 'none' }}>
            {thesis ? 'Edit →' : 'Define →'}
          </Link>
        </div>
        {thesis ? (
          <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--ink-soft)', margin: 0 }}>{thesis}</p>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '10px' }}>
              Generate your Buy Box once your assessments are complete.
            </p>
            <Link href="/buy-box" style={{ textDecoration: 'none' }}>
              <button type="button" style={{ fontFamily: 'var(--mono)', fontSize: '11px', padding: '6px 12px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '2px', color: 'var(--muted)', cursor: 'pointer' }}>
                Define Buy Box →
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Module cards */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
          Assessment modules
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          {MODULES.map((mod) => {
            const done = completedModules.has(mod.key)
            return (
              <Link key={mod.key} href={mod.href} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'var(--white)', border: `1px solid ${done ? 'var(--teal)' : 'var(--line)'}`, borderRadius: '3px', padding: '14px 16px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: done ? 'var(--teal)' : 'var(--muted)' }}>
                      {mod.label}
                    </span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', background: done ? 'var(--teal-soft)' : 'var(--paper-2)', color: done ? 'var(--teal)' : 'var(--muted)', padding: '2px 6px', borderRadius: '2px', textTransform: 'uppercase' }}>
                      {done ? '✓' : '—'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--ink-soft)', margin: 0 }}>{mod.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* MVP2 pipeline placeholder */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '3px', padding: '18px 20px', marginBottom: '20px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
          Opportunity pipeline
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {['Saved', 'Initial Screen', 'Investigating', 'Seller Contact', 'Financial Review', 'Due Diligence', 'Offer', 'Negotiation'].map((s) => (
            <span key={s} style={{ fontFamily: 'var(--mono)', fontSize: '10px', padding: '3px 8px', background: 'var(--paper-2)', color: 'var(--muted)', borderRadius: '2px' }}>
              {s} · 0
            </span>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
          Opportunity logging, screening and stress-testing arrive in MVP2 — your Buy Box will drive rapid screening once available.
        </p>
      </div>

      {/* Safety banner */}
      <div style={{ background: 'var(--ink)', color: 'var(--white)', borderRadius: '3px', padding: '16px 20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <span style={{ color: 'var(--brass-soft)', flexShrink: 0, marginTop: '1px', fontSize: '16px' }}>⚠</span>
        <p style={{ fontSize: '12px', lineHeight: 1.6, opacity: 0.9, margin: 0 }}>
          This tool provides educational, decision-support analysis only — it is not regulated financial, legal or tax advice.
          Involve an accountant, solicitor, tax adviser and other relevant professionals before any binding offer, personal guarantee, or borrowing decision.
        </p>
      </div>
    </div>
  )
}
