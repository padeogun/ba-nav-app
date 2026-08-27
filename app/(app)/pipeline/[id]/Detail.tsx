'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateOpportunity, moveStage, deleteOpportunity } from '@/app/actions/pipeline'
import { scoreOpportunity, type BuyBoxDraft } from '@/lib/scoring'
import { SECTOR_DB } from '@/lib/constants'
import CompaniesHousePanel from '@/components/pipeline/CompaniesHousePanel'
import CHDataPanel from '@/components/pipeline/CHDataPanel'
import Quality from '@/components/pipeline/tabs/Quality'
import OwnerDep from '@/components/pipeline/tabs/OwnerDep'
import RedFlagsTab from '@/components/pipeline/tabs/RedFlags'
import FitDecision from '@/components/pipeline/tabs/FitDecision'

const STAGES = [
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

export default function OpportunityDetail({ opp, buyBox }: { opp: any; buyBox: BuyBoxDraft | null }) {
  const router = useRouter()
  const [fields, setFields] = useState({
    title: opp.title ?? '',
    url: opp.url ?? '',
    sector: opp.sector ?? '',
    askingPrice: opp.askingPrice ?? '',
    ebitda: opp.ebitda ?? '',
    revenue: opp.revenue ?? '',
    employees: opp.employees ?? '',
    yearsTrading: opp.yearsTrading ?? '',
    location: opp.location ?? '',
    notes: opp.notes ?? '',
    chCompanyNumber: opp.chCompanyNumber ?? '',
    chCompanyName: opp.chCompanyName ?? '',
    chStatus: opp.chStatus ?? '',
    chSicCodes: opp.chSicCodes ?? '',
    chIncorporatedOn: opp.chIncorporatedOn ?? '',
  })
  const [stage, setStageState] = useState(opp.stage ?? 'saved')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [tab, setTab] = useState<'listing' | 'quality' | 'dependency' | 'redflags' | 'decision'>('listing')

  const set = (k: keyof typeof fields, v: string) => { setFields((f) => ({ ...f, [k]: v })); setSaved(false) }
  const setChFields = (ch: { chCompanyNumber: string; chCompanyName: string; chStatus: string; chSicCodes: string; chIncorporatedOn: string }) => {
    setFields((f) => ({ ...f, ...ch })); setSaved(false)
  }

  const live = buyBox ? scoreOpportunity(fields, buyBox) : null

  const handleSave = () => {
    if (!fields.title.trim()) { setError('Title is required'); return }
    setError(null)
    startTransition(async () => {
      const result = await updateOpportunity(opp.id, fields)
      if (result.error) { setError(result.error); return }
      setSaved(true)
    })
  }

  const handleStage = (newStage: string) => {
    setStageState(newStage)
    startTransition(async () => { await moveStage(opp.id, newStage) })
  }

  const handleDelete = () => {
    startTransition(async () => {
      await deleteOpportunity(opp.id)
      router.push('/pipeline')
    })
  }

  return (
    <div className="ban-fade-in" style={{ padding: '40px', maxWidth: '960px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <button type="button" onClick={() => router.push('/pipeline')} style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 12 }}>
            ← Back to pipeline
          </button>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--brass)', marginBottom: 6 }}>
            Pipeline · Opportunity
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500, color: 'var(--ink)', margin: 0 }}>
            {fields.title || 'Untitled'}
          </h1>
        </div>

        {/* Stage selector */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Stage</div>
          <select
            className="ban-select"
            value={stage}
            onChange={(e) => handleStage(e.target.value)}
            style={{ minWidth: 160 }}
          >
            {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--line)', marginBottom: 28 }}>
        {([
          { key: 'listing',    label: 'Listing',           has: true },
          { key: 'quality',    label: 'Business Quality',  has: !!opp.qualityScores },
          { key: 'dependency', label: 'Owner Dependency',  has: !!opp.ownerDepScores },
          { key: 'redflags',   label: 'Red Flags',         has: !!opp.redFlags },
          { key: 'decision',   label: 'Fit & Decision',    has: !!opp.fitScores },
        ] as { key: typeof tab; label: string; has: boolean }[]).map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} style={{
            fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase',
            padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: tab === t.key ? '2px solid var(--brass)' : '2px solid transparent',
            marginBottom: -2, color: tab === t.key ? 'var(--ink)' : 'var(--muted)',
            display: 'flex', alignItems: 'center', gap: 7,
          }}>
            {t.label}
            {t.key !== 'listing' && (
              <span style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block', flexShrink: 0, background: t.has ? 'var(--brass)' : 'var(--line)' }} />
            )}
          </button>
        ))}
      </div>

      {tab === 'quality' && <Quality oppId={opp.id} initial={opp.qualityScores ?? ''} />}
      {tab === 'dependency' && <OwnerDep oppId={opp.id} initial={opp.ownerDepScores ?? ''} />}
      {tab === 'redflags' && <RedFlagsTab oppId={opp.id} initial={opp.redFlags ?? ''} />}
      {tab === 'decision' && (
        <FitDecision
          oppId={opp.id}
          qualityInitial={opp.qualityScores ?? ''}
          ownerDepInitial={opp.ownerDepScores ?? ''}
          redFlagsInitial={opp.redFlags ?? ''}
          fitInitial={opp.fitScores ?? ''}
          buyBoxScore={live?.score ?? 0}
        />
      )}

      {tab === 'listing' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        {/* Left — editable fields */}
        <div style={{ display: 'grid', gap: 16 }}>
          {/* Listing details */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
              Listing details
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>Business name / title</label>
                <input className="ban-input" type="text" value={fields.title} onChange={(e) => set('title', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>Source URL</label>
                <input className="ban-input" type="url" value={fields.url} onChange={(e) => set('url', e.target.value)} placeholder="https://..." />
                {fields.url && (
                  <a href={fields.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--brass)', display: 'inline-block', marginTop: 4 }}>
                    Open listing →
                  </a>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>Sector</label>
                  <select className="ban-select" value={fields.sector} onChange={(e) => set('sector', e.target.value)}>
                    <option value="">— Select —</option>
                    {SECTOR_DB.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>Location</label>
                  <input className="ban-input" type="text" value={fields.location} onChange={(e) => set('location', e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>Years trading</label>
                  <input className="ban-input" type="number" value={fields.yearsTrading} onChange={(e) => set('yearsTrading', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>Employees</label>
                  <input className="ban-input" type="number" value={fields.employees} onChange={(e) => set('employees', e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Financials */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
              Financials (£)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              {([['askingPrice', 'Asking price'], ['revenue', 'Revenue'], ['ebitda', 'EBITDA / SDE']] as [keyof typeof fields, string][]).map(([key, label]) => (
                <div key={key}>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>{label}</label>
                  <input className="ban-input" type="number" value={fields[key]} onChange={(e) => set(key, e.target.value)} placeholder="£" />
                </div>
              ))}
            </div>
          </div>

          {/* Companies House */}
          <CompaniesHousePanel
            linked={fields.chCompanyNumber ? {
              number: fields.chCompanyNumber, name: fields.chCompanyName,
              status: fields.chStatus, sicCodes: fields.chSicCodes, incorporatedOn: fields.chIncorporatedOn,
            } : null}
            onLink={setChFields}
            onUnlink={() => setChFields({ chCompanyNumber: '', chCompanyName: '', chStatus: '', chSicCodes: '', chIncorporatedOn: '' })}
          />

          {/* CH deep data — officers, PSC, filing history */}
          {fields.chCompanyNumber && (
            <CHDataPanel companyNumber={fields.chCompanyNumber} />
          )}

          {/* Notes */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22 }}>
            <label style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 10 }}>Notes</label>
            <textarea className="ban-textarea" rows={5} value={fields.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Impressions, questions, red flags, contact history…" style={{ resize: 'vertical' }} />
          </div>

          {/* Save / delete */}
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20 }}>
            {error && (
              <div style={{ marginBottom: 12, padding: '10px 14px', background: '#fff0f0', border: '1px solid var(--rust)', borderRadius: 3, fontSize: 12.5, color: 'var(--rust)' }}>
                {error}
              </div>
            )}
            {saved && (
              <div style={{ marginBottom: 12, padding: '10px 14px', background: 'var(--teal-soft)', border: '1px solid var(--teal)', borderRadius: 3, fontSize: 12.5, color: 'var(--teal)' }}>
                Saved.
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {confirmDelete ? (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 12.5, color: 'var(--rust)' }}>Delete this opportunity?</span>
                  <button type="button" className="ban-btn ban-focus" style={{ fontSize: 12, padding: '5px 12px', background: 'var(--rust)', color: 'var(--white)', border: 'none', borderRadius: 2, cursor: 'pointer' }} onClick={handleDelete} disabled={pending}>
                    Yes, delete
                  </button>
                  <button type="button" className="ban-btn ban-btn-ghost ban-focus" style={{ fontSize: 12 }} onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                  Delete opportunity
                </button>
              )}
              <button type="button" className="ban-btn ban-btn-primary ban-focus" onClick={handleSave} disabled={pending}>
                {pending ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Right — score + summary */}
        <div style={{ display: 'grid', gap: 12, position: 'sticky', top: 20 }}>
          {/* Buy Box score */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 20 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
              Buy Box score
            </div>
            {!buyBox ? (
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.55 }}>
                No Buy Box defined. <a href="/buy-box" style={{ color: 'var(--brass)' }}>Set yours →</a>
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
                  <p style={{ fontSize: 12, color: 'var(--teal)', lineHeight: 1.5 }}>No Buy Box conflicts with current data.</p>
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

          {/* Quick summary */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 20 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
              Summary
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                ['Sector', SECTOR_DB.find(s => s.id === fields.sector)?.name || '—'],
                ['Location', fields.location || '—'],
                ['Asking price', fields.askingPrice ? `£${parseFloat(fields.askingPrice).toLocaleString()}` : '—'],
                ['Revenue', fields.revenue ? `£${parseFloat(fields.revenue).toLocaleString()}` : '—'],
                ['EBITDA', fields.ebitda ? `£${parseFloat(fields.ebitda).toLocaleString()}` : '—'],
                ['Multiple', fields.askingPrice && fields.ebitda ? `${(parseFloat(fields.askingPrice) / parseFloat(fields.ebitda)).toFixed(1)}×` : '—'],
                ['Years trading', fields.yearsTrading || '—'],
                ['Employees', fields.employees || '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--line)', paddingBottom: 6 }}>
                  <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink)' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 3, padding: '12px 14px', fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.6 }}>
            Score updates as you edit. Save to persist the latest score to your pipeline list.
          </div>
        </div>
      </div>}
    </div>
  )
}
