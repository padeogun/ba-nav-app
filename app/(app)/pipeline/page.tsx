import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/src/prisma/db'
import { scoreOpportunity, type BuyBoxDraft } from '@/lib/scoring'
import { SECTOR_DB } from '@/lib/constants'

const STAGES = [
  { key: 'all', label: 'All' },
  { key: 'saved', label: 'Saved' },
  { key: 'screening', label: 'Screening' },
  { key: 'investigating', label: 'Investigating' },
  { key: 'seller-contact', label: 'Seller contact' },
  { key: 'financial-review', label: 'Financial review' },
  { key: 'due-diligence', label: 'Due diligence' },
  { key: 'offer', label: 'Offer' },
  { key: 'negotiation', label: 'Negotiation' },
]

function scoreColor(s: number) {
  return s >= 80 ? 'var(--teal)' : s >= 60 ? 'var(--brass)' : 'var(--rust)'
}

function fmt(v: string) {
  const n = parseFloat(v)
  return isNaN(n) ? null : `£${n.toLocaleString()}`
}

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { stage: activeStage = 'all' } = await searchParams

  let opportunities: any[] = []
  let buyBox: BuyBoxDraft | null = null

  try {
    const [opps, bb] = await Promise.all([
      db.orm.public.Opportunity.where({ userId: user.id }).all(),
      db.orm.public.BuyBox.where({ userId: user.id }).first(),
    ])
    opportunities = opps.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (bb) {
      buyBox = {
        geography: bb.geography, maxDistance: bb.maxDistance,
        sectorsPreferred: bb.sectorsPreferred ? bb.sectorsPreferred.split(',').filter(Boolean) : [],
        sectorsExcluded: bb.sectorsExcluded ? bb.sectorsExcluded.split(',').filter(Boolean) : [],
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

  const filtered = activeStage === 'all'
    ? opportunities
    : opportunities.filter((o: any) => o.stage === activeStage)

  const scored = filtered.map((o: any) => {
    const { score, flags } = buyBox
      ? scoreOpportunity(o, buyBox)
      : { score: parseInt(o.score) || 0, flags: [] }
    const sectorName = SECTOR_DB.find((s) => s.id === o.sector)?.name ?? o.sector
    return { ...o, liveScore: score, liveFlags: flags, sectorName }
  })

  return (
    <div className="ban-fade-in" style={{ padding: '40px', maxWidth: '960px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--brass)', marginBottom: 6 }}>
            Phase 4 · Pipeline
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 500, color: 'var(--ink)', margin: 0 }}>
            Opportunity pipeline
          </h1>
          <p style={{ marginTop: 8, color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.55, maxWidth: 560 }}>
            {opportunities.length} {opportunities.length === 1 ? 'opportunity' : 'opportunities'} tracked.
            {!buyBox && ' Define your Buy Box to see Buy Box scores.'}
          </p>
        </div>
        <Link href="/pipeline/new" style={{ textDecoration: 'none' }}>
          <button type="button" className="ban-btn ban-btn-primary ban-focus">
            + Add opportunity
          </button>
        </Link>
      </div>

      {/* Stage filter tabs */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 20, borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
        {STAGES.map((s) => {
          const count = s.key === 'all' ? opportunities.length : opportunities.filter((o: any) => o.stage === s.key).length
          const active = activeStage === s.key
          return (
            <Link key={s.key} href={`/pipeline?stage=${s.key}`} style={{ textDecoration: 'none' }}>
              <button
                type="button"
                style={{
                  fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase',
                  padding: '5px 10px', borderRadius: 2, border: '1px solid',
                  borderColor: active ? 'var(--brass)' : 'var(--line)',
                  background: active ? 'var(--brass-soft, #f5f0e8)' : 'transparent',
                  color: active ? 'var(--brass)' : 'var(--muted)',
                  cursor: 'pointer',
                }}
              >
                {s.label} {count > 0 && <span style={{ opacity: .7 }}>· {count}</span>}
              </button>
            </Link>
          )
        })}
      </div>

      {/* Opportunity list */}
      {scored.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
          <p style={{ fontSize: 13.5, marginBottom: 12 }}>
            {activeStage === 'all'
              ? 'No opportunities yet. Add your first one to start tracking.'
              : `No opportunities in the "${STAGES.find(s => s.key === activeStage)?.label}" stage.`}
          </p>
          {activeStage === 'all' && (
            <Link href="/pipeline/new" style={{ textDecoration: 'none' }}>
              <button type="button" className="ban-btn ban-btn-ghost ban-focus">Add first opportunity →</button>
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {scored.map((opp: any) => (
            <Link key={opp.id} href={`/pipeline/${opp.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3,
                padding: '16px 20px', display: 'grid',
                gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center',
                cursor: 'pointer',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{opp.title}</span>
                    {opp.chCompanyNumber && (
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 6px', background: 'var(--teal-soft)', color: 'var(--teal)', borderRadius: 2, textTransform: 'uppercase' }}>
                        CH linked
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {opp.sectorName && (
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                        {opp.sectorName}
                      </span>
                    )}
                    {opp.location && (
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{opp.location}</span>
                    )}
                    {fmt(opp.askingPrice) && (
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-soft)' }}>
                        {fmt(opp.askingPrice)} asking
                      </span>
                    )}
                    {fmt(opp.ebitda) && (
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-soft)' }}>
                        {fmt(opp.ebitda)} EBITDA
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  {buyBox && (
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: scoreColor(opp.liveScore) }}>
                      {opp.liveScore}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--muted)' }}>/100</span>
                    </div>
                  )}
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 9, padding: '3px 8px', borderRadius: 2,
                    textTransform: 'uppercase', letterSpacing: '.06em',
                    background: 'var(--paper-2)', color: 'var(--muted)',
                  }}>
                    {STAGES.find(s => s.key === opp.stage)?.label ?? opp.stage}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
