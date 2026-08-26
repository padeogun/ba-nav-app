'use client'

import { useState } from 'react'
import LikertRow from '@/components/assessment/LikertRow'
import ModuleNav from '@/components/assessment/ModuleNav'
import { saveRisk } from '@/app/actions/assessment'
import { RISK_ITEMS } from '@/lib/constants'
import { riskSummary } from '@/lib/scoring'

export default function RiskForm({ initialScores }: { initialScores: Record<string, number> }) {
  const [scores, setScores] = useState(initialScores)

  const setScore = (i: number, v: number) =>
    setScores((s) => ({ ...s, [i]: v }))

  const r = riskSummary({ scores: Object.fromEntries(Object.entries(scores).map(([k, v]) => [Number(k), v])) as any, completed: false })
  const canComplete = r.answered >= RISK_ITEMS.length

  const handleSave = async (completed: boolean) => {
    return saveRisk({ scores, completed })
  }

  return (
    <div className="ban-fade-in" style={{ padding: '40px', maxWidth: '860px' }}>
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--brass)', marginBottom: '6px' }}>
          Module F · Assess
        </p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 500, color: 'var(--ink)', margin: 0 }}>Risk tolerance</h1>
        <p style={{ marginTop: 8, color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.55, maxWidth: 640 }}>
          Rate your tolerance for each risk category (1 = very low tolerance, 5 = high tolerance). These directly influence which sectors we recommend.
        </p>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22, marginBottom: 16 }}>
        {RISK_ITEMS.map((text, i) => (
          <LikertRow key={i} text={text} value={scores[i] ?? 0} onChange={(v) => setScore(i, v)} />
        ))}
      </div>

      {r.answered > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 8 }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 16 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
              Least acceptable risks
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {r.leastAcceptable.map((e) => (
                <span key={e.label} style={{ fontFamily: 'var(--mono)', fontSize: 10, background: 'var(--rust-soft)', color: 'var(--rust)', padding: '3px 8px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  {e.label}
                </span>
              ))}
            </div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 16 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
              Most manageable risks
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {r.manageable.map((e) => (
                <span key={e.label} style={{ fontFamily: 'var(--mono)', fontSize: 10, background: 'var(--teal-soft)', color: 'var(--teal)', padding: '3px 8px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  {e.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <ModuleNav
        prevHref="/assessment/financial"
        nextHref="/assessment/lifestyle"
        onSave={handleSave}
        canComplete={canComplete}
      />
    </div>
  )
}
