'use client'

import { useState, useTransition } from 'react'
import { saveAnalysis } from '@/app/actions/pipeline'
import { type FlagRating, type RedFlags, emptyRedFlags, parseAnalysis } from '@/lib/scoring'

const FLAG_ITEMS = [
  { key: 'unclearAccounts',           label: 'Unclear or unaudited accounts',         hint: 'Financial statements are incomplete, inconsistent, or not professionally prepared' },
  { key: 'profitCashMismatch',        label: 'Profit / cash mismatch',                hint: 'Reported profit does not convert to cash in the bank — possible working capital trap or hidden liabilities' },
  { key: 'excessiveAdjustments',      label: 'Excessive EBITDA add-backs',            hint: 'Seller claims large "one-off" costs to inflate adjusted earnings beyond what is credible' },
  { key: 'customerConcentration',     label: 'Customer concentration',                hint: 'A single customer or small group accounts for >25–30% of revenue' },
  { key: 'keyPersonDependency',       label: 'Key-person dependency',                 hint: 'The business cannot function if a specific person (seller or employee) departs' },
  { key: 'sellerControlledSales',     label: 'Seller-controlled sales',               hint: 'The seller personally generates most revenue through relationships that may not transfer' },
  { key: 'revenueDeclining',          label: 'Declining revenue trend',               hint: 'Revenue has fallen in 2 of the last 3 years without a fully credible explanation' },
  { key: 'highTurnover',             label: 'High employee turnover',                hint: 'Frequent staff departures — suggests a management, culture, or compensation problem' },
  { key: 'deferredCapex',            label: 'Deferred capital expenditure',          hint: 'Equipment, property, or systems that should have been replaced — a future cash liability for the buyer' },
  { key: 'supplierConcentration',    label: 'Supplier concentration',               hint: 'A single supplier is critical and switching would be costly or slow' },
  { key: 'litigation',               label: 'Litigation or legal claims',            hint: 'Outstanding or threatened claims against the business' },
  { key: 'regulatoryIssues',         label: 'Regulatory non-compliance',            hint: 'Known compliance problems, licence uncertainties, or pending investigations' },
  { key: 'taxUncertainty',           label: 'Tax uncertainty',                       hint: 'HMRC disputes, unpaid liabilities, or aggressive tax arrangements under scrutiny' },
  { key: 'workingCapitalProblems',   label: 'Working capital strain',               hint: 'Business regularly struggles to pay suppliers on time or fund its operational cycle' },
  { key: 'forecastDependentValuation',label:'Forecast-dependent valuation',         hint: 'Asking price requires aggressive future growth — not supported by historical earnings' },
  { key: 'ddResistance',             label: 'Due diligence resistance',             hint: 'Seller delays or obstructs requests for information or professional access' },
  { key: 'unconvincingReasonForSale',label: 'Unconvincing reason for sale',         hint: 'The stated reason doesn\'t add up or contradicts the performance narrative' },
  { key: 'underpaidOwner',           label: 'Underpaid owner salary',              hint: 'Owner draws below-market salary, inflating EBITDA — true earnings are lower once a replacement manager is costed' },
  { key: 'revenueMultipleNoEarnings',label: 'Revenue multiple without earnings support', hint: 'Priced on revenue, not profit — and profit is insufficient to service acquisition debt' },
  { key: 'dealFever',                label: 'Deal fever / emotional attachment',    hint: 'You are explaining away concerns or adjusting your Buy Box to make this deal work — a dangerous signal' },
] as const

const FLAG_OPTIONS: { value: FlagRating; label: string; bg: string; color: string }[] = [
  { value: '',        label: '—',         bg: 'var(--paper-2)',   color: 'var(--muted)' },
  { value: 'green',   label: 'Green',     bg: 'var(--teal-soft)', color: 'var(--teal)' },
  { value: 'amber',   label: 'Amber',     bg: '#fff8e6',          color: '#b06000' },
  { value: 'red',     label: 'Red',       bg: 'var(--rust-soft)', color: 'var(--rust)' },
  { value: 'breaker', label: '✕ Breaker', bg: 'var(--rust)',      color: 'var(--white)' },
]

export default function RedFlagsTab({ oppId, initial }: { oppId: string; initial: string }) {
  const [flags, setFlags] = useState<RedFlags>(() => {
    const parsed = parseAnalysis<Partial<RedFlags>>(initial, {})
    const base = emptyRedFlags()
    return { ...base, ...parsed } as RedFlags
  })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const set = (key: string, v: FlagRating) => { setFlags(f => ({ ...f, [key]: v })); setSaved(false) }

  const vals = Object.values(flags) as FlagRating[]
  const breakers = vals.filter(f => f === 'breaker').length
  const reds = vals.filter(f => f === 'red').length
  const ambers = vals.filter(f => f === 'amber').length
  const greens = vals.filter(f => f === 'green').length
  const unassessed = vals.filter(f => f === '').length

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const result = await saveAnalysis(oppId, { redFlags: JSON.stringify(flags) })
      if (result.error) { setError(result.error); return }
      setSaved(true)
    })
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 640 }}>
          Classify each potential issue based on what you know. Leave &quot;—&quot; if you haven&apos;t assessed it yet. Any Deal Breaker flag triggers an immediate reject recommendation.
        </p>

        <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
          {[
            { label: 'Deal breakers', count: breakers, color: 'var(--rust)' },
            { label: 'Red flags', count: reds, color: 'var(--rust)' },
            { label: 'Amber flags', count: ambers, color: '#b06000' },
            { label: 'Green', count: greens, color: 'var(--teal)' },
            { label: 'Not assessed', count: unassessed, color: 'var(--muted)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: s.color }}>{s.count}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {breakers > 0 && (
          <div style={{ marginTop: 14, padding: '10px 16px', background: 'var(--rust)', borderRadius: 3 }}>
            <span style={{ fontSize: 12.5, color: 'var(--white)', fontWeight: 600 }}>
              {breakers} deal-breaker flag{breakers > 1 ? 's' : ''} — this opportunity should be rejected.
            </span>
          </div>
        )}
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, overflow: 'hidden' }}>
        {FLAG_ITEMS.map((item, i) => {
          const current = flags[item.key] ?? ''
          return (
            <div key={item.key} style={{
              padding: '14px 20px',
              borderBottom: i < FLAG_ITEMS.length - 1 ? '1px solid var(--line)' : 'none',
              background: current === 'breaker' ? '#fff0f0' : current === 'red' ? '#fff8f8' : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.45 }}>{item.hint}</div>
                </div>
                <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                  {FLAG_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => set(item.key, opt.value)} style={{
                      padding: '4px 9px', borderRadius: 2, fontSize: 10,
                      fontFamily: 'var(--mono)', cursor: 'pointer',
                      background: current === opt.value ? opt.bg : 'var(--paper-2)',
                      color: current === opt.value ? opt.color : 'var(--muted)',
                      border: `1px solid ${current === opt.value ? opt.color : 'var(--line)'}`,
                      fontWeight: current === opt.value ? 600 : 400,
                    }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 24, borderTop: '1px solid var(--line)', paddingTop: 20 }}>
        {error && <div style={{ marginBottom: 12, padding: '10px 14px', background: '#fff0f0', border: '1px solid var(--rust)', borderRadius: 3, fontSize: 12.5, color: 'var(--rust)' }}>{error}</div>}
        {saved && <div style={{ marginBottom: 12, padding: '10px 14px', background: 'var(--teal-soft)', border: '1px solid var(--teal)', borderRadius: 3, fontSize: 12.5, color: 'var(--teal)' }}>Saved.</div>}
        <button type="button" className="ban-btn ban-btn-primary ban-focus" onClick={handleSave} disabled={pending}>
          {pending ? 'Saving…' : 'Save red flag assessment'}
        </button>
      </div>
    </div>
  )
}
