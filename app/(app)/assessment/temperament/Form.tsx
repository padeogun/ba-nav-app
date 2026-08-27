'use client'

import { useState } from 'react'
import LikertRow from '@/components/assessment/LikertRow'
import ModuleNav from '@/components/assessment/ModuleNav'
import { saveTemperament } from '@/app/actions/assessment'
import { TEMPERAMENT_ITEMS } from '@/lib/constants'
import { temperamentScores } from '@/lib/scoring'

export default function TemperamentForm({
  initialScores,
  initialCompleted,
}: {
  initialScores: Record<string, number>
  initialCompleted: boolean
}) {
  const [scores, setScores] = useState(initialScores)

  const setScore = (cat: string, i: number, v: number) =>
    setScores((s) => ({ ...s, [`${cat}__${i}`]: v }))

  const result = temperamentScores({ scores, completed: false })
  const totalItems = Object.values(TEMPERAMENT_ITEMS).reduce((s, items) => s + items.length, 0)
  const answered = Object.values(scores).filter((v) => v > 0).length
  const canComplete = answered >= totalItems

  const handleSave = async (completed: boolean) => {
    return saveTemperament({ scores, completed })
  }

  const scoreColor = (v: number) =>
    v >= 4 ? 'var(--teal)' : v >= 3 ? 'var(--brass)' : v > 0 ? 'var(--rust)' : 'var(--muted)'

  return (
    <div className="ban-fade-in" style={{ padding: '40px', maxWidth: '860px' }}>
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--brass)', marginBottom: '6px' }}>
          Module B · Assess
        </p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 500, color: 'var(--ink)', margin: 0 }}>Temperament</h1>
        <p style={{ marginTop: 8, color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.55, maxWidth: 640 }}>
          Rate your self-assessed competence in each area (1 = very low, 5 = very high). Decision-making, accountability and resilience are the three pillars of owner temperament. Be realistic — overrating yourself here tends to surface as stress later.
        </p>
      </div>

      {Object.entries(TEMPERAMENT_ITEMS).map(([cat, items]) => {
        const CAT_DESC: Record<string, string> = {
          'Decision making': 'How you handle choices when information is incomplete or the consequences are significant.',
          'Accountability': 'Your capacity to self-direct, take ownership of outcomes, and follow through without external pressure.',
          'Resilience': 'Your ability to stay functional under pressure and recover when things do not go as planned.',
        }
        return (
        <div key={cat} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--brass)', marginBottom: 4 }}>{cat}</div>
              {CAT_DESC[cat] && <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, maxWidth: 480 }}>{CAT_DESC[cat]}</div>}
            </div>
            {result.cats[cat] > 0 && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700, color: scoreColor(result.cats[cat]) }}>
                {result.cats[cat]}/5
              </span>
            )}
          </div>
          {items.map((text, i) => (
            <LikertRow
              key={i}
              text={text}
              value={scores[`${cat}__${i}`] ?? 0}
              onChange={(v) => setScore(cat, i, v)}
            />
          ))}
        </div>
        )
      })}

      {result.overall > 0 && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: '16px 20px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 2 }}>
                Overall temperament
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, color: scoreColor(result.overall) }}>
                {result.overall}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--muted)' }}>/5</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'grid', gap: 6 }}>
                {Object.entries(result.cats).map(([cat, v]) => (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--ink-soft)', width: 140, flexShrink: 0 }}>{cat}</span>
                    <div style={{ flex: 1, height: 4, background: 'var(--paper-2)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: scoreColor(v), width: `${(v / 5) * 100}%`, transition: 'width .3s ease' }} />
                    </div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, width: 28, textAlign: 'right', color: scoreColor(v) }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <ModuleNav
        prevHref="/assessment/motivation"
        nextHref="/assessment/ownership"
        onSave={handleSave}
        canComplete={canComplete}
      />
    </div>
  )
}
