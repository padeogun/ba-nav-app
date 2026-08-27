'use client'

import { useState, useTransition } from 'react'
import { saveAnalysis } from '@/app/actions/pipeline'
import { type OwnerDepScores, emptyOwnerDep, parseAnalysis } from '@/lib/scoring'

const ITEMS = [
  { key: 'sells',              label: 'Sales & new business',      hint: 'Who generates and closes new revenue when the seller is gone?' },
  { key: 'managesStaff',      label: 'Staff management',          hint: 'Who handles daily performance management, morale, and HR issues?' },
  { key: 'pricesWork',        label: 'Pricing & quoting',         hint: 'Who prices jobs, sets fees, or approves customer quotes?' },
  { key: 'managesCustomers',  label: 'Key customer relationships', hint: 'Who personally manages the most important clients?' },
  { key: 'approvesPurchasing',label: 'Purchasing decisions',      hint: 'Who authorises supplier payments and significant purchasing?' },
  { key: 'knowsSuppliers',    label: 'Supplier relationships',    hint: 'Who negotiates terms and maintains critical supplier contacts?' },
  { key: 'understandsSystems',label: 'Systems & processes',       hint: 'Who understands how the whole operation runs end-to-end?' },
  { key: 'solvesTechnical',   label: 'Technical problem solving',  hint: 'Who resolves specialist, operational, or trade problems?' },
  { key: 'managesCash',       label: 'Cash management',           hint: 'Who manages cash flow, banking relationships, and financial controls?' },
  { key: 'holdsLicences',     label: 'Licences & compliance',     hint: 'Who holds licences or manages regulatory and compliance obligations?' },
  { key: 'ownsRelationships', label: 'Professional relationships', hint: 'Who maintains the bank, accountant, solicitor, and key external contacts?' },
  { key: 'knowsEverything',   label: 'Institutional knowledge',   hint: 'Who knows "how everything really works" — the critical undocumented knowledge?' },
] as const

const SCALE = ['Seller only', 'Mostly seller', 'Some team capacity', 'Mostly team', 'Team independent']

function scoreColor(s: number) {
  return s >= 70 ? 'var(--teal)' : s >= 50 ? 'var(--brass)' : 'var(--rust)'
}

function RateRow({ label, hint, value, onChange }: { label: string; hint: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 3 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.45 }}>{hint}</div>
        </div>
        {value > 0 && (
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 10, padding: '2px 7px', borderRadius: 2,
            flexShrink: 0, marginTop: 2, whiteSpace: 'nowrap',
            background: value >= 4 ? 'var(--teal-soft)' : value >= 3 ? 'var(--paper-2)' : 'var(--rust-soft)',
            color: value >= 4 ? 'var(--teal)' : value >= 3 ? 'var(--ink-soft)' : 'var(--rust)',
          }}>
            {SCALE[value - 1]}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {[1,2,3,4,5].map(v => (
          <button key={v} type="button" onClick={() => onChange(value === v ? 0 : v)} style={{
            width: 38, height: 28, borderRadius: 2, fontSize: 12,
            fontFamily: 'var(--mono)', cursor: 'pointer',
            background: value === v ? 'var(--ink)' : 'var(--paper-2)',
            color: value === v ? 'var(--white)' : 'var(--muted)',
            border: `1px solid ${value === v ? 'var(--ink)' : 'var(--line)'}`,
          }}>{v}</button>
        ))}
      </div>
    </div>
  )
}

export default function OwnerDep({ oppId, initial }: { oppId: string; initial: string }) {
  const [scores, setScores] = useState<OwnerDepScores>(() => parseAnalysis(initial, emptyOwnerDep()))
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const set = (key: string, v: number) => { setScores(s => ({ ...s, [key]: v })); setSaved(false) }

  const vals = Object.values(scores) as number[]
  const rated = vals.filter(v => v > 0)
  const depScore = rated.length ? Math.round(rated.reduce((a,b) => a+b, 0) / rated.length * 20) : null
  const riskScore = depScore !== null ? 100 - depScore : null

  const worst = ITEMS.filter(it => (scores[it.key] ?? 0) > 0 && (scores[it.key] ?? 0) <= 2)
    .sort((a,b) => (scores[a.key] ?? 0) - (scores[b.key] ?? 0))
    .slice(0, 3)

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const result = await saveAnalysis(oppId, { ownerDepScores: JSON.stringify(scores) })
      if (result.error) { setError(result.error); return }
      setSaved(true)
    })
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 640 }}>
          Rate each function 1–5 based on who handles it <strong>if the seller leaves tomorrow</strong>.
          1 = Seller only (high risk) · 5 = Team fully independent (low risk).
        </p>
        {depScore !== null && (
          <div style={{ display: 'flex', gap: 24, marginTop: 14 }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>Independence score</div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, color: scoreColor(depScore) }}>
                {depScore}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)' }}>/100</span>
              </span>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>Dependency risk</div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, color: scoreColor(100 - (riskScore ?? 0)) }}>
                {riskScore}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)' }}>/100</span>
              </span>
            </div>
          </div>
        )}
        {worst.length > 0 && (
          <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--rust-soft)', border: '1px solid var(--rust)', borderRadius: 3 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--rust)', marginBottom: 8 }}>Highest exposure areas</div>
            <div style={{ display: 'grid', gap: 4 }}>
              {worst.map(it => (
                <div key={it.key} style={{ fontSize: 12, color: 'var(--rust)', display: 'flex', gap: 6 }}>
                  <span>⚠</span><span>{it.label} — {SCALE[(scores[it.key] ?? 1) - 1]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
          Owner Dependency — {rated.length}/12 assessed
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>
          Higher scores mean the business runs without the seller. Lower scores mean you are buying the seller&apos;s personal job.
        </div>
        {ITEMS.map(it => (
          <RateRow key={it.key} label={it.label} hint={it.hint} value={scores[it.key] ?? 0} onChange={v => set(it.key, v)} />
        ))}
      </div>

      <div style={{ marginTop: 24, borderTop: '1px solid var(--line)', paddingTop: 20 }}>
        {error && <div style={{ marginBottom: 12, padding: '10px 14px', background: '#fff0f0', border: '1px solid var(--rust)', borderRadius: 3, fontSize: 12.5, color: 'var(--rust)' }}>{error}</div>}
        {saved && <div style={{ marginBottom: 12, padding: '10px 14px', background: 'var(--teal-soft)', border: '1px solid var(--teal)', borderRadius: 3, fontSize: 12.5, color: 'var(--teal)' }}>Saved.</div>}
        <button type="button" className="ban-btn ban-btn-primary ban-focus" onClick={handleSave} disabled={pending}>
          {pending ? 'Saving…' : 'Save dependency assessment'}
        </button>
      </div>
    </div>
  )
}
