'use client'

import { useState } from 'react'
import LikertRow from '@/components/assessment/LikertRow'
import ModuleNav from '@/components/assessment/ModuleNav'
import { saveRisk } from '@/app/actions/assessment'
import { RISK_ITEMS } from '@/lib/constants'
import { riskSummary } from '@/lib/scoring'

const RISK_HINTS = [
  'How much income swings month to month — some businesses are predictably steady, others highly seasonal or project-dependent.',
  'The rate at which staff leave and need replacing — high turnover is costly and disrupts service quality.',
  'One or a few clients making up the majority of revenue — losing one can be catastrophic.',
  'Dependence on one or few key suppliers — disruption to their operations affects your whole business.',
  'The loan taken out to fund the purchase — interest and repayments are fixed costs from your first day as owner.',
  'Banks commonly require directors to personally backstop business loans. If the business cannot repay, you are personally liable.',
  'Industries under heavy compliance scrutiny (e.g. CQC, FCA, Ofsted) face more frequent change and regulatory cost.',
  'The risk that automation, AI, or platform shifts reduce demand for what the business currently does.',
  'Risk of stock becoming unsellable, spoiling, or requiring significant tied-up working capital.',
  'Long-term lease commitments are a fixed cost and can be expensive or impossible to exit early.',
  'Dependence on specialist machinery or vehicles — failure can halt operations and trigger emergency spend.',
  'Revenue concentrated in certain months creates cashflow gaps that must be funded year-round.',
  'How much demand drops when consumers or businesses cut spending during an economic downturn.',
  'Risk of legal claims from customers, employees, or third parties — some sectors are inherently more exposed.',
  'Day-to-day cash needs that swing due to invoice timing, stock purchases, or slow-paying clients.',
]

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
          Rate your tolerance for each risk category (1 = very low tolerance, 5 = high tolerance). These directly influence which sectors we recommend — a sector whose typical risk profile exceeds your tolerance will score lower or be flagged.
        </p>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22, marginBottom: 16 }}>
        {RISK_ITEMS.map((text, i) => (
          <LikertRow key={i} text={text} hint={RISK_HINTS[i]} value={scores[i] ?? 0} onChange={(v) => setScore(i, v)} />
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
