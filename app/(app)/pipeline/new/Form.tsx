'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createOpportunity } from '@/app/actions/pipeline'
import { scoreOpportunity, type BuyBoxDraft } from '@/lib/scoring'
import { SECTOR_DB } from '@/lib/constants'
import CompaniesHousePanel from '@/components/pipeline/CompaniesHousePanel'

const EMPTY: ReturnType<typeof emptyFields> = {
  title: '', url: '', sector: '', askingPrice: '', ebitda: '', revenue: '',
  employees: '', yearsTrading: '', location: '', notes: '',
  chCompanyNumber: '', chCompanyName: '', chStatus: '', chSicCodes: '', chIncorporatedOn: '',
}
function emptyFields() { return { ...EMPTY } }

function scoreColor(s: number) {
  return s >= 80 ? 'var(--teal)' : s >= 60 ? 'var(--brass)' : 'var(--rust)'
}

export default function NewOpportunityForm({ buyBox }: { buyBox: BuyBoxDraft | null }) {
  const router = useRouter()
  const [fields, setFields] = useState(emptyFields())
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const set = (k: keyof typeof EMPTY, v: string) => setFields((f) => ({ ...f, [k]: v }))
  const setChFields = (ch: { chCompanyNumber: string; chCompanyName: string; chStatus: string; chSicCodes: string; chIncorporatedOn: string }) =>
    setFields((f) => ({ ...f, ...ch }))

  const live = buyBox ? scoreOpportunity(fields, buyBox) : null

  const handleSave = () => {
    if (!fields.title.trim()) { setError('Title is required'); return }
    setError(null)
    startTransition(async () => {
      const result = await createOpportunity(fields)
      if (result.error) { setError(result.error); return }
      router.push(`/pipeline/${result.id}`)
    })
  }

  return (
    <div className="ban-fade-in" style={{ padding: '40px', maxWidth: '960px' }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--brass)', marginBottom: 6 }}>
          Pipeline · New opportunity
        </p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 500, color: 'var(--ink)', margin: 0 }}>
          Add opportunity
        </h1>
        <p style={{ marginTop: 8, color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.55, maxWidth: 560 }}>
          Enter the key details from any broker listing or platform. Fields left blank are simply not scored.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        {/* Left — form fields */}
        <div style={{ display: 'grid', gap: 16 }}>
          {/* Listing details */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
              Listing details
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>
                  Business name / title <span style={{ color: 'var(--rust)' }}>*</span>
                </label>
                <input className="ban-input" type="text" value={fields.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. South London IT Support MSP" />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>Source URL</label>
                <input className="ban-input" type="url" value={fields.url} onChange={(e) => set('url', e.target.value)} placeholder="https://daltonsbusiness.com/listing/..." />
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Link to the original broker or platform listing.</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>Sector</label>
                  <select className="ban-select" value={fields.sector} onChange={(e) => set('sector', e.target.value)}>
                    <option value="">— Select —</option>
                    {SECTOR_DB.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>Location</label>
                  <input className="ban-input" type="text" value={fields.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Manchester" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>Years trading</label>
                  <input className="ban-input" type="number" value={fields.yearsTrading} onChange={(e) => set('yearsTrading', e.target.value)} placeholder="e.g. 12" />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>Employees</label>
                  <input className="ban-input" type="number" value={fields.employees} onChange={(e) => set('employees', e.target.value)} placeholder="e.g. 8" />
                </div>
              </div>
            </div>
          </div>

          {/* Financials */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
              Financials (£)
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.5 }}>
              Use figures from the listing or Information Memorandum. Leave blank if unknown.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              {[
                ['askingPrice', 'Asking price', 'The advertised price'],
                ['revenue', 'Revenue', 'Annual turnover'],
                ['ebitda', 'EBITDA / SDE', 'Adjusted earnings'],
              ].map(([key, label, hint]) => (
                <div key={key}>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>{label}</label>
                  <input className="ban-input" type="number" value={(fields as any)[key]} onChange={(e) => set(key as any, e.target.value)} placeholder="£" />
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{hint}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Companies House */}
          <CompaniesHousePanel
            linked={fields.chCompanyNumber ? { number: fields.chCompanyNumber, name: fields.chCompanyName, status: fields.chStatus, sicCodes: fields.chSicCodes, incorporatedOn: fields.chIncorporatedOn } : null}
            onLink={setChFields}
            onUnlink={() => setChFields({ chCompanyNumber: '', chCompanyName: '', chStatus: '', chSicCodes: '', chIncorporatedOn: '' })}
          />

          {/* Notes */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22 }}>
            <label style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 10 }}>
              Notes
            </label>
            <textarea className="ban-textarea" rows={4} value={fields.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Initial impressions, broker contact, red flags, questions to investigate…" style={{ resize: 'vertical' }} />
          </div>
        </div>

        {/* Right — score preview */}
        <div style={{ display: 'grid', gap: 12, position: 'sticky', top: 20 }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 20 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
              Buy Box score
            </div>
            {!buyBox ? (
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.55 }}>
                No Buy Box defined yet. <a href="/buy-box" style={{ color: 'var(--brass)' }}>Set yours</a> to see how opportunities score.
              </p>
            ) : live ? (
              <>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 36, fontWeight: 700, color: scoreColor(live.score), marginBottom: 4 }}>
                  {live.score}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--muted)' }}>/100</span>
                </div>
                <div style={{ height: 5, background: 'var(--paper-2)', borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
                  <div style={{ height: '100%', background: scoreColor(live.score), width: `${live.score}%`, transition: 'width .3s ease' }} />
                </div>
                {live.flags.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--teal)', lineHeight: 1.5 }}>No Buy Box conflicts detected with the information entered so far.</p>
                ) : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {live.flags.map((f, i) => (
                      <div key={i} style={{ display: 'flex', gap: 7, fontSize: 11.5, color: 'var(--rust)', lineHeight: 1.45 }}>
                        <span style={{ flexShrink: 0 }}>⚠</span>{f}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </div>

          <div style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 3, padding: '12px 14px', fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.6 }}>
            Score updates live as you fill in details. It reflects how well this listing fits your Buy Box — not whether it&apos;s a good business.
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ marginTop: 28, borderTop: '1px solid var(--line)', paddingTop: 20 }}>
        {error && (
          <div style={{ marginBottom: 12, padding: '10px 14px', background: '#fff0f0', border: '1px solid var(--rust)', borderRadius: 3, fontSize: 12.5, color: 'var(--rust)' }}>
            {error}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button type="button" className="ban-btn ban-btn-ghost ban-focus" onClick={() => router.push('/pipeline')} disabled={pending}>
            ← Back to pipeline
          </button>
          <button type="button" className="ban-btn ban-btn-primary ban-focus" onClick={handleSave} disabled={pending}>
            {pending ? 'Saving…' : 'Save opportunity →'}
          </button>
        </div>
      </div>
    </div>
  )
}
