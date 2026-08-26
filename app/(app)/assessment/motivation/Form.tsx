'use client'

import { useState } from 'react'
import LikertRow from '@/components/assessment/LikertRow'
import ModuleNav from '@/components/assessment/ModuleNav'
import { saveMotivation } from '@/app/actions/assessment'
import { MOTIVATION_ITEMS } from '@/lib/constants'
import { motivationScore } from '@/lib/scoring'

type MotivationData = {
  scores: Record<string, number>
  why: string
  changes: string
  twoYears: string
  failureDespiteProfit: string
  completed: boolean
}

export default function MotivationForm({ initialData }: { initialData: MotivationData }) {
  const [data, setData] = useState(initialData)

  const setScore = (i: number, v: number) =>
    setData((d) => ({ ...d, scores: { ...d.scores, [i]: v } }))
  const setField = (k: keyof MotivationData, v: string) =>
    setData((d) => ({ ...d, [k]: v }))

  const result = motivationScore({ ...data, scores: Object.fromEntries(Object.entries(data.scores).map(([k, v]) => [Number(k), v])) } as any)
  const canComplete = result.answered >= MOTIVATION_ITEMS.length

  const handleSave = async (completed: boolean) => {
    return saveMotivation({ ...data, completed })
  }

  return (
    <div className="ban-fade-in" style={{ padding: '40px', maxWidth: '860px' }}>
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--brass)', marginBottom: '6px' }}>
          Module A · Assess
        </p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 500, color: 'var(--ink)', margin: 0 }}>Motivation</h1>
        <p style={{ marginTop: 8, color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.55, maxWidth: 640 }}>
          Rate your agreement with each statement (1 = strongly disagree, 5 = strongly agree). These help identify the depth and durability of your motivation for ownership.
        </p>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22, marginBottom: 16 }}>
        {MOTIVATION_ITEMS.map((text, i) => (
          <LikertRow key={i} text={text} value={data.scores[i] ?? 0} onChange={(v) => setScore(i, v)} />
        ))}
      </div>

      {result.answered > 0 && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: '16px 20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: result.redFlags.length > 0 ? 12 : 0 }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 2 }}>
                Motivation score
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, color: 'var(--brass)' }}>
                {result.total}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--muted)' }}>/{result.max}</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 6, background: 'var(--paper-2)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--brass)', width: `${(result.total / result.max) * 100}%`, transition: 'width .4s ease' }} />
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                {result.answered}/{MOTIVATION_ITEMS.length} answered
              </div>
            </div>
          </div>
          {result.redFlags.map((flag, i) => (
            <div key={i} style={{ display: 'flex', gap: 7, fontSize: 12, color: 'var(--rust)', marginTop: 8 }}>
              <span style={{ flexShrink: 0 }}>⚠</span>{flag}
            </div>
          ))}
        </div>
      )}

      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22, marginBottom: 8 }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
          Reflection (optional — not scored)
        </p>
        {[
          ['why', 'Why do you want to own a business?'],
          ['changes', 'What would change for you if you succeeded?'],
          ['twoYears', 'What does your life look like in two years as an owner?'],
          ['failureDespiteProfit', 'What would "failure" look like even if the business was profitable?'],
        ].map(([key, label]) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 5 }}>{label}</label>
            <textarea
              className="ban-textarea"
              rows={3}
              value={(data as any)[key]}
              onChange={(e) => setField(key as any, e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
        ))}
      </div>

      <ModuleNav
        nextHref="/assessment/temperament"
        onSave={handleSave}
        canComplete={canComplete}
      />
    </div>
  )
}
