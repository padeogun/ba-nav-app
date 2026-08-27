'use client'

import { useState } from 'react'
import ModuleNav from '@/components/assessment/ModuleNav'
import { saveLifestyle } from '@/app/actions/assessment'
import { userDemandCapacity } from '@/lib/scoring'

type LifestyleData = {
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

export default function LifestyleForm({ initialData }: { initialData: LifestyleData }) {
  const [data, setData] = useState(initialData)
  const set = <K extends keyof LifestyleData>(k: K, v: LifestyleData[K]) => setData((d) => ({ ...d, [k]: v }))

  const capacity = userDemandCapacity(data)

  const handleSave = async (completed: boolean) => {
    return saveLifestyle({ ...data, completed })
  }

  const selectField = (key: keyof LifestyleData, label: string, opts: [string, string][]) => (
    <div key={key}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>{label}</label>
      <select className="ban-select" value={data[key] as string} onChange={(e) => set(key, e.target.value as any)}>
        {opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </div>
  )

  return (
    <div className="ban-fade-in" style={{ padding: '40px', maxWidth: '860px' }}>
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--brass)', marginBottom: '6px' }}>
          Module G · Assess
        </p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 500, color: 'var(--ink)', margin: 0 }}>Lifestyle fit</h1>
        <p style={{ marginTop: 8, color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.55, maxWidth: 640 }}>
          Hard limits here become hard exclusions later — we won't just quietly lower a score for a business that structurally breaks your limits. Answer for the life you are willing to live as an owner, not the life you ideally want.
        </p>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 8 }}>
            Desired weekly hours: <span style={{ fontFamily: 'var(--mono)', color: 'var(--brass)' }}>{data.weeklyHours}h</span>
          </label>
          <input className="ban-slider" type="range" min="15" max="70" value={data.weeklyHours} onChange={(e) => set('weeklyHours', parseInt(e.target.value))} />
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>Most SME owner-operators work 45–60 hours per week during the first 2–3 years. Set a realistic ceiling, not an aspiration.</div>
        </div>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 8 }}>
            Maximum commute: <span style={{ fontFamily: 'var(--mono)', color: 'var(--brass)' }}>{data.maxCommute} min</span>
          </label>
          <input className="ban-slider" type="range" min="0" max="120" step="5" value={data.maxCommute} onChange={(e) => set('maxCommute', parseInt(e.target.value))} />
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>One-way travel time to the business premises. Businesses beyond this limit will be flagged incompatible.</div>
        </div>

        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>Weekend work tolerance</label>
          <select className="ban-select" value={data.weekendTolerance} onChange={(e) => set('weekendTolerance', e.target.value as any)}>
            <option value="never">Never</option>
            <option value="occasional">Occasional</option>
            <option value="regular">Regular</option>
          </select>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Retail, hospitality, healthcare, and security typically require regular weekend presence.</div>
        </div>

        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>Emergency-call tolerance</label>
          <select className="ban-select" value={data.emergencyTolerance} onChange={(e) => set('emergencyTolerance', e.target.value as any)}>
            <option value="none">None</option>
            <option value="sometimes">Sometimes</option>
            <option value="anytime">Anytime</option>
          </select>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Equipment failures, staff no-shows, urgent client issues, or security incidents can occur outside business hours.</div>
        </div>

        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>Travel tolerance</label>
          <select className="ban-select" value={data.travelTolerance} onChange={(e) => set('travelTolerance', e.target.value as any)}>
            <option value="none">None</option>
            <option value="local">Local</option>
            <option value="regional">Regional</option>
            <option value="national">National</option>
          </select>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Required for site visits, client meetings, or managing multi-location operations. Caps sectors with high travel demands.</div>
        </div>

        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>Comfortable being customer-facing?</label>
          <select className="ban-select" value={data.customerFacing} onChange={(e) => set('customerFacing', e.target.value as any)}>
            <option value="yes">Yes</option>
            <option value="some">Some</option>
            <option value="no">Prefer not</option>
          </select>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>In most small businesses the owner is the primary point of client contact, especially in the first 1–2 years.</div>
        </div>

        {selectField('relocate', 'Willing to relocate?', [['yes', 'Yes'], ['maybe', 'Maybe'], ['no', 'No']])}

        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>Remote / hybrid preference</label>
          <select className="ban-select" value={data.remotePref} onChange={(e) => set('remotePref', e.target.value as any)}>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Most service businesses require on-site presence. Remote or hybrid ownership usually requires a strong, trusted management layer already in place.</div>
        </div>

        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>Long-term desired involvement</label>
          <select className="ban-select" value={data.longTermInvolvement} onChange={(e) => set('longTermInvolvement', e.target.value as any)}>
            <option value="owner-operator">Owner-operator — I run it day-to-day</option>
            <option value="owner-manager">Owner-manager — I manage the managers</option>
            <option value="semi-passive">Semi-passive — board-level oversight only</option>
          </select>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>This reflects your end-state, not year one — almost all buyers start more hands-on than they intend to finish.</div>
        </div>

        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>
            Minimum personal income required (£/yr)
          </label>
          <input
            className="ban-input"
            type="number"
            value={data.minPersonalIncome || ''}
            onChange={(e) => set('minPersonalIncome', parseFloat(e.target.value) || 0)}
            placeholder="£"
          />
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Gross annual amount you must draw from the business to cover personal commitments. Businesses unable to support this will be excluded.</div>
        </div>
      </div>

      <div style={{ background: 'var(--teal-soft)', border: '1px solid var(--teal)', borderRadius: 3, padding: '14px 18px', marginBottom: 8, fontSize: 13.5, color: 'var(--ink)' }}>
        Estimated demand capacity: <strong style={{ fontFamily: 'var(--mono)' }}>{capacity}/5</strong>. Businesses whose typical owner-hours demand sits far above this will be marked incompatible in your sector match, not merely penalised.
      </div>

      <ModuleNav
        prevHref="/assessment/risk"
        nextHref="/dashboard"
        onSave={handleSave}
        canComplete={true}
      />
    </div>
  )
}
