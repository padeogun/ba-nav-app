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
          Hard limits here become hard exclusions later — we won't just quietly lower a score for a business that structurally breaks your limits.
        </p>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 8 }}>
            Desired weekly hours: <span style={{ fontFamily: 'var(--mono)', color: 'var(--brass)' }}>{data.weeklyHours}h</span>
          </label>
          <input className="ban-slider" type="range" min="15" max="70" value={data.weeklyHours} onChange={(e) => set('weeklyHours', parseInt(e.target.value))} />
        </div>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 8 }}>
            Maximum commute: <span style={{ fontFamily: 'var(--mono)', color: 'var(--brass)' }}>{data.maxCommute} min</span>
          </label>
          <input className="ban-slider" type="range" min="0" max="120" step="5" value={data.maxCommute} onChange={(e) => set('maxCommute', parseInt(e.target.value))} />
        </div>

        {selectField('weekendTolerance', 'Weekend work tolerance', [['never', 'Never'], ['occasional', 'Occasional'], ['regular', 'Regular']])}
        {selectField('emergencyTolerance', 'Emergency-call tolerance', [['none', 'None'], ['sometimes', 'Sometimes'], ['anytime', 'Anytime']])}
        {selectField('travelTolerance', 'Travel tolerance', [['none', 'None'], ['local', 'Local'], ['regional', 'Regional'], ['national', 'National']])}
        {selectField('customerFacing', 'Comfortable being customer-facing?', [['yes', 'Yes'], ['some', 'Some'], ['no', 'Prefer not']])}
        {selectField('relocate', 'Willing to relocate?', [['yes', 'Yes'], ['maybe', 'Maybe'], ['no', 'No']])}
        {selectField('remotePref', 'Remote / hybrid preference', [['remote', 'Remote'], ['hybrid', 'Hybrid'], ['onsite', 'On-site']])}
        {selectField('longTermInvolvement', 'Long-term desired involvement', [['owner-operator', 'Owner-operator'], ['owner-manager', 'Owner-manager'], ['semi-passive', 'Semi-passive']])}

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
