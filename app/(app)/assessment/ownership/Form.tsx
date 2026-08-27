'use client'

import { useState } from 'react'
import LikertRow from '@/components/assessment/LikertRow'
import ModuleNav from '@/components/assessment/ModuleNav'
import { saveOwnershipStyle } from '@/app/actions/assessment'
import { OWNERSHIP_STYLE_ITEMS } from '@/lib/constants'
import { ownershipStyleScores } from '@/lib/scoring'

export default function OwnershipForm({
  initialScores,
  initialCompleted,
}: {
  initialScores: Record<string, number>
  initialCompleted: boolean
}) {
  const [scores, setScores] = useState(initialScores)

  const setScore = (cat: string, i: number, v: number) =>
    setScores((s) => ({ ...s, [`${cat}__${i}`]: v }))

  const pcts = ownershipStyleScores({ scores, completed: false })
  const totalItems = Object.values(OWNERSHIP_STYLE_ITEMS).reduce((s, items) => s + items.length, 0)
  const answered = Object.values(scores).filter((v) => v > 0).length
  const canComplete = answered >= totalItems

  const handleSave = async (completed: boolean) => {
    return saveOwnershipStyle({ scores, completed })
  }

  const STYLE_COLORS: Record<string, string> = {
    Operator: 'var(--teal)',
    'Manager / Builder': 'var(--brass)',
    'Investor / Strategic owner': 'var(--ink)',
  }

  return (
    <div className="ban-fade-in" style={{ padding: '40px', maxWidth: '860px' }}>
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--brass)', marginBottom: '6px' }}>
          Module C · Assess
        </p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 500, color: 'var(--ink)', margin: 0 }}>Ownership style</h1>
        <p style={{ marginTop: 8, color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.55, maxWidth: 640 }}>
          Rate each statement (1 = not me at all, 5 = very much me). Your pattern across the three categories reveals whether you lean towards hands-on operator, people-focused builder, or strategic owner. Most buyers sit across two styles — the result shows your split, not a single label.
        </p>
      </div>

      {Object.entries(OWNERSHIP_STYLE_ITEMS).map(([cat, items]) => {
        const STYLE_DESC: Record<string, string> = {
          'Operator': 'You are energised by being in the thick of it — serving customers, solving operational problems, and leading from the front.',
          'Manager / Builder': 'You prefer building and empowering teams to handle operations while you focus on growth, systems, and culture.',
          'Investor / Strategic owner': 'You want to own and direct, not manage day-to-day — comfortable delegating operational control entirely to management.',
        }
        return (
        <div key={cat} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22, marginBottom: 12 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: STYLE_COLORS[cat] ?? 'var(--brass)', marginBottom: 4 }}>
              {cat}
            </div>
            {STYLE_DESC[cat] && <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, maxWidth: 540 }}>{STYLE_DESC[cat]}</div>}
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

      {Object.values(pcts).some((v) => v > 0) && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: '16px 20px', marginBottom: 8 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
            Your ownership style split
          </div>
          <div style={{ display: 'flex', height: 10, borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
            {Object.entries(pcts).map(([cat, pct]) => (
              pct > 0 && (
                <div key={cat} style={{ width: `${pct}%`, background: STYLE_COLORS[cat] ?? 'var(--muted)', transition: 'width .4s ease' }} />
              )
            ))}
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {Object.entries(pcts).map(([cat, pct]) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: STYLE_COLORS[cat] ?? 'var(--muted)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--ink-soft)', flex: 1 }}>{cat}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: STYLE_COLORS[cat] ?? 'var(--muted)' }}>
                  {pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ModuleNav
        prevHref="/assessment/temperament"
        nextHref="/assessment/capability"
        onSave={handleSave}
        canComplete={canComplete}
      />
    </div>
  )
}
