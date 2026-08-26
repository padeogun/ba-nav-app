'use client'

import { useState } from 'react'
import ModuleNav from '@/components/assessment/ModuleNav'
import { saveFinancial } from '@/app/actions/assessment'
import { financialReadiness } from '@/lib/scoring'

type FinancialData = {
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

export default function FinancialForm({ initialData }: { initialData: FinancialData }) {
  const [data, setData] = useState(initialData)
  const set = (k: keyof FinancialData, v: string) => setData((d) => ({ ...d, [k]: v }))

  const result = financialReadiness(data)
  const canComplete = data.capitalAvailable !== '' && data.riskCapital !== ''

  const handleSave = async (completed: boolean) => {
    const toFloat = (s: string) => s !== '' ? parseFloat(s) : null
    return saveFinancial({
      capitalAvailable: toFloat(data.capitalAvailable),
      riskCapital: toFloat(data.riskCapital),
      existingDebt: toFloat(data.existingDebt),
      additionalCapital: toFloat(data.additionalCapital),
      desiredSize: toFloat(data.desiredSize),
      minHouseholdIncome: toFloat(data.minHouseholdIncome),
      desiredDrawings: toFloat(data.desiredDrawings),
      maxGuarantee: toFloat(data.maxGuarantee),
      reserveMonths: data.reserveMonths,
      maxLeverage: data.maxLeverage,
      completed,
    })
  }

  const numField = (key: keyof FinancialData, label: string, hint?: string) => (
    <div key={key}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>{label}</label>
      <input
        className="ban-input"
        type="number"
        value={(data as any)[key]}
        onChange={(e) => set(key, e.target.value)}
        placeholder="£"
      />
      {hint && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{hint}</div>}
    </div>
  )

  const scoreColor = result.score >= 70 ? 'var(--teal)' : result.score >= 45 ? 'var(--brass)' : 'var(--rust)'

  return (
    <div className="ban-fade-in" style={{ padding: '40px', maxWidth: '860px' }}>
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--brass)', marginBottom: '6px' }}>
          Module E · Assess
        </p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 500, color: 'var(--ink)', margin: 0 }}>Financial readiness</h1>
        <p style={{ marginTop: 8, color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.55, maxWidth: 640 }}>
          Separating what you have, what you can afford to lose, and what you need in reserve — never deploy every pound of liquidity into a purchase price.
        </p>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {numField('capitalAvailable', 'Acquisition capital available')}
        {numField('riskCapital', 'Amount genuinely prepared to risk', 'Should usually be less than the above')}
        {numField('existingDebt', 'Existing debt commitments')}
        {numField('additionalCapital', 'Additional capital available post-acquisition')}
        {numField('desiredSize', 'Desired adjusted EBITDA of target (£)')}
        {numField('minHouseholdIncome', 'Minimum household income needed')}
        {numField('desiredDrawings', 'Desired owner salary / drawings')}
        {numField('maxGuarantee', 'Maximum acceptable personal guarantee')}
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>
            Personal reserves (months of expenses)
          </label>
          <select className="ban-select" value={data.reserveMonths} onChange={(e) => set('reserveMonths', e.target.value)}>
            {['0', '3', '6', '9', '12', '18'].map((m) => (
              <option key={m} value={m}>{m} months</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>
            Maximum leverage comfort
          </label>
          <select className="ban-select" value={data.maxLeverage} onChange={(e) => set('maxLeverage', e.target.value)}>
            <option value="low">Low — prefer minimal acquisition debt</option>
            <option value="moderate">Moderate — standard bank-supported deal</option>
            <option value="high">High — comfortable with significant leverage</option>
          </select>
        </div>
      </div>

      {(data.capitalAvailable !== '' || data.riskCapital !== '') && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: '16px 20px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: result.warnings.length > 0 ? 12 : 0 }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 2 }}>
                Financial readiness (indicative)
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, color: scoreColor }}>
                {result.score}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--muted)' }}>/100</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 6, background: 'var(--paper-2)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: scoreColor, width: `${result.score}%`, transition: 'width .4s ease' }} />
              </div>
            </div>
          </div>
          {result.warnings.map((w, i) => (
            <div key={i} style={{ display: 'flex', gap: 7, fontSize: 12, color: 'var(--rust)', marginTop: 8 }}>
              <span style={{ flexShrink: 0 }}>⚠</span>{w}
            </div>
          ))}
        </div>
      )}

      <ModuleNav
        prevHref="/assessment/capability"
        nextHref="/assessment/risk"
        onSave={handleSave}
        canComplete={canComplete}
      />
    </div>
  )
}
