'use client'

import { useState, useTransition } from 'react'
import { saveAnalysis } from '@/app/actions/pipeline'
import { type QualityScores, emptyQuality, parseAnalysis } from '@/lib/scoring'

const CATS = [
  {
    key: 'rq' as const,
    label: 'Revenue Quality',
    desc: 'How reliable, recurring, and diversified is the income?',
    items: [
      { label: 'Recurring revenue', hint: 'Proportion of revenue that repeats without active reselling — subscriptions, contracts, or repeat customers' },
      { label: 'Predictability', hint: 'How reliably can revenue be forecast 12 months ahead?' },
      { label: 'Customer retention', hint: 'Do customers return? High switching costs and long relationships are positive signals' },
      { label: 'Diversification', hint: 'No single customer dominates — spread across 10+ customers is stronger than reliance on 1–3' },
      { label: 'Pricing power', hint: 'Can the business raise prices without losing meaningful volume?' },
    ],
  },
  {
    key: 'pq' as const,
    label: 'Profit Quality',
    desc: 'Are the margins real, sustainable, and converting to cash?',
    items: [
      { label: 'Sustainable margins', hint: 'EBITDA margins are credible and would survive the removal of the seller\'s distorted cost base' },
      { label: 'EBITDA credibility', hint: 'Adjusted earnings reflect realistic ongoing profitability — not inflated by questionable add-backs' },
      { label: 'Cash conversion', hint: 'Profit converts to cash reliably — low debtor days, manageable working capital cycle' },
      { label: 'Owner adjustments', hint: 'Add-backs are few, reasonable, and clearly documented — not stretching credulity' },
      { label: 'No exceptional income', hint: 'No large one-off revenue inflating the most recent period — run-rate is representative' },
    ],
  },
  {
    key: 'oq' as const,
    label: 'Operational Quality',
    desc: 'How well does the business run independently of the seller?',
    items: [
      { label: 'Systematised processes', hint: 'Operations are documented and repeatable — not dependent on the seller\'s tribal knowledge' },
      { label: 'Staff stability', hint: 'The team would survive the ownership transition and is capable without daily seller guidance' },
      { label: 'Management depth', hint: 'There is at least one layer of management between the owner and the frontline' },
      { label: 'Supplier resilience', hint: 'No single supplier is so critical that losing them would materially disrupt operations' },
      { label: 'Technology estate', hint: 'Systems and technology are current, maintained, and not a near-term liability' },
    ],
  },
  {
    key: 'sq' as const,
    label: 'Strategic Quality',
    desc: 'Does this business have a defensible position and a future?',
    items: [
      { label: 'Market attractiveness', hint: 'The addressable market is growing or stable — not in structural decline' },
      { label: 'Competitive position', hint: 'Defensible niche, established reputation, or pricing advantage a new entrant can\'t easily replicate' },
      { label: 'Barriers to entry', hint: 'Licences, relationships, equipment, or brand that make it difficult for a new competitor to enter quickly' },
      { label: 'Expansion potential', hint: 'Clear and credible routes to geographic, service, or customer expansion' },
      { label: 'Exit potential', hint: 'This business would attract other buyers — trade sale, MBO, or PE platform appeal' },
    ],
  },
  {
    key: 'rkq' as const,
    label: 'Risk Profile',
    desc: 'Are the structural risks manageable and within your tolerance?',
    items: [
      { label: 'Regulatory manageability', hint: 'Regulation is navigable without specialist licences or qualifications you don\'t hold' },
      { label: 'Litigation exposure', hint: 'No material outstanding or threatened legal claims — clean bill of legal health' },
      { label: 'Customer concentration', hint: 'No single customer represents >25% of revenue' },
      { label: 'Owner independence', hint: 'Business does not depend on the seller\'s personal relationships for its revenue' },
      { label: 'CAPEX predictability', hint: 'Asset replacement costs are known, planned, and manageable — no deferred liabilities hidden in plain sight' },
    ],
  },
]

const LABELS = ['Poor', 'Below avg', 'Average', 'Good', 'Excellent']

function catScore(vals: number[]) {
  const r = vals.filter(v => v > 0)
  return r.length ? Math.round(r.reduce((a,b) => a+b, 0) / r.length * 20) : null
}

function scoreColor(s: number) {
  return s >= 70 ? 'var(--teal)' : s >= 50 ? 'var(--brass)' : 'var(--rust)'
}

function RateRow({ label, hint, value, onChange }: { label: string; hint: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.45, marginBottom: 8 }}>{hint}</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {[1,2,3,4,5].map(v => (
          <button key={v} type="button" onClick={() => onChange(value === v ? 0 : v)} style={{
            width: 38, height: 28, borderRadius: 2, fontSize: 12,
            fontFamily: 'var(--mono)', cursor: 'pointer',
            background: value === v ? 'var(--ink)' : 'var(--paper-2)',
            color: value === v ? 'var(--white)' : 'var(--muted)',
            border: `1px solid ${value === v ? 'var(--ink)' : 'var(--line)'}`,
          }}>{v}</button>
        ))}
        {value > 0 && (
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginLeft: 4 }}>
            {LABELS[value - 1]}
          </span>
        )}
      </div>
    </div>
  )
}

export default function Quality({ oppId, initial }: { oppId: string; initial: string }) {
  const [scores, setScores] = useState<QualityScores>(() => parseAnalysis(initial, emptyQuality()))
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const set = (cat: keyof QualityScores, i: number, v: number) => {
    setScores(s => { const next = { ...s, [cat]: [...s[cat]] }; next[cat][i] = v; return next })
    setSaved(false)
  }

  const allQ = [...scores.rq, ...scores.pq, ...scores.oq, ...scores.sq, ...scores.rkq]
  const ratedAll = allQ.filter(v => v > 0)
  const overallScore = ratedAll.length ? Math.round(ratedAll.reduce((a,b) => a+b, 0) / ratedAll.length * 20) : null

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const result = await saveAnalysis(oppId, { qualityScores: JSON.stringify(scores) })
      if (result.error) { setError(result.error); return }
      setSaved(true)
    })
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 620 }}>
          Rate the business 1–5 across 25 dimensions. 1 = Poor, 5 = Excellent. Leave unrated if you don&apos;t yet have enough information — partial scores are valid.
        </p>
        {overallScore !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, color: scoreColor(overallScore) }}>
              {overallScore}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)' }}>/100</span>
            </span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Overall business quality · {ratedAll.length}/25 items rated</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {CATS.map(cat => {
          const cs = catScore(scores[cat.key])
          return (
            <div key={cat.key} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 2 }}>{cat.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{cat.desc}</div>
                </div>
                {cs !== null && (
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: scoreColor(cs), flexShrink: 0, marginLeft: 16 }}>
                    {cs}<span style={{ fontSize: 10, fontWeight: 400 }}>/100</span>
                  </span>
                )}
              </div>
              <div style={{ marginTop: 10 }}>
                {cat.items.map((item, i) => (
                  <RateRow key={i} label={item.label} hint={item.hint} value={scores[cat.key][i]} onChange={v => set(cat.key, i, v)} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 24, borderTop: '1px solid var(--line)', paddingTop: 20 }}>
        {error && <div style={{ marginBottom: 12, padding: '10px 14px', background: '#fff0f0', border: '1px solid var(--rust)', borderRadius: 3, fontSize: 12.5, color: 'var(--rust)' }}>{error}</div>}
        {saved && <div style={{ marginBottom: 12, padding: '10px 14px', background: 'var(--teal-soft)', border: '1px solid var(--teal)', borderRadius: 3, fontSize: 12.5, color: 'var(--teal)' }}>Saved.</div>}
        <button type="button" className="ban-btn ban-btn-primary ban-focus" onClick={handleSave} disabled={pending}>
          {pending ? 'Saving…' : 'Save quality assessment'}
        </button>
      </div>
    </div>
  )
}
