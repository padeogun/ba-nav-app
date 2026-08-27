'use client'

import { useState, useTransition } from 'react'
import { saveAnalysis } from '@/app/actions/pipeline'
import {
  type QualityScores, type OwnerDepScores, type RedFlags, type FitScores,
  emptyQuality, emptyOwnerDep, emptyRedFlags, emptyFitScores,
  parseAnalysis, computeDecision, type DecisionResult,
} from '@/lib/scoring'

const FIT_ITEMS = [
  { key: 'personalInterest',      label: 'Personal interest',        hint: 'Do you genuinely find this business and sector interesting enough to work in every day?' },
  { key: 'skillsFit',             label: 'Skills fit',               hint: 'Do your transferable capabilities match what this business actually needs to maintain and improve?' },
  { key: 'managementFit',        label: 'Management fit',           hint: 'Could you effectively manage this type of team, culture, and organisational complexity?' },
  { key: 'financialFit',         label: 'Financial fit',            hint: 'Is this within your acquisition budget and risk capital — without overextending your financial position?' },
  { key: 'lifestyleFit',         label: 'Lifestyle fit',            hint: 'Does the day-to-day reality of owning this business suit your lifestyle, hours, and family situation?' },
  { key: 'riskFit',              label: 'Risk fit',                 hint: 'Is the risk profile of this specific business within your documented risk tolerance?' },
  { key: 'strategicFit',         label: 'Strategic fit',            hint: 'Does this align with your Buy Box, your long-term acquisition thesis, and your intended ownership model?' },
  { key: 'abilityToAddValue',    label: 'Ability to add value',     hint: 'Do you have a credible, specific plan to improve this business after acquisition — not just generic intentions?' },
  { key: 'longTermWealthPotential',label:'Wealth potential',        hint: 'Could this realistically build meaningful personal wealth over a 5–10 year horizon?' },
] as const

const RECOMMENDATION_CONFIG: Record<DecisionResult['recommendation'], { label: string; color: string; bg: string }> = {
  reject:          { label: 'Reject',                        color: 'var(--rust)',  bg: 'var(--rust-soft)' },
  park:            { label: 'Park — revisit later',          color: '#b06000',      bg: '#fff8e6' },
  'gather-info':   { label: 'Gather more information',       color: 'var(--brass)', bg: 'var(--paper-2)' },
  investigate:     { label: 'Proceed to investigation',      color: 'var(--brass)', bg: 'var(--paper-2)' },
  'due-diligence': { label: 'Proceed to due diligence',      color: 'var(--teal)',  bg: 'var(--teal-soft)' },
  offer:           { label: 'Consider indicative offer',     color: 'var(--teal)',  bg: 'var(--teal-soft)' },
}

function scoreColor(s: number) {
  return s >= 70 ? 'var(--teal)' : s >= 50 ? 'var(--brass)' : 'var(--rust)'
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: scoreColor(score) }}>{score}/100</span>
      </div>
      <div style={{ height: 5, background: 'var(--paper-2)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: scoreColor(score), width: `${score}%`, transition: 'width .3s ease' }} />
      </div>
    </div>
  )
}

export default function FitDecision({ oppId, qualityInitial, ownerDepInitial, redFlagsInitial, fitInitial, buyBoxScore }: {
  oppId: string
  qualityInitial: string
  ownerDepInitial: string
  redFlagsInitial: string
  fitInitial: string
  buyBoxScore: number
}) {
  const [fitScores, setFitScores] = useState<FitScores>(() => parseAnalysis(fitInitial, emptyFitScores()))
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const qualityScores = parseAnalysis<QualityScores>(qualityInitial, emptyQuality())
  const ownerDepScores = parseAnalysis<OwnerDepScores>(ownerDepInitial, emptyOwnerDep())
  const redFlags = parseAnalysis<RedFlags>(redFlagsInitial, emptyRedFlags())

  const set = (key: string, v: number) => { setFitScores(s => ({ ...s, [key]: v })); setSaved(false) }

  const fitVals = Object.values(fitScores) as number[]
  const ratedFit = fitVals.filter(v => v > 0)
  const personalFitScore = ratedFit.length ? Math.round(ratedFit.reduce((a,b) => a+b, 0) / ratedFit.length * 10) : 0

  const decision = computeDecision({ qualityScores, ownerDepScores, redFlags, fitScores, buyBoxScore })
  const rConfig = RECOMMENDATION_CONFIG[decision.recommendation]

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const result = await saveAnalysis(oppId, { fitScores: JSON.stringify(fitScores) })
      if (result.error) { setError(result.error); return }
      setSaved(true)
    })
  }

  return (
    <div style={{ maxWidth: 860, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
      {/* Left — fit scoring */}
      <div>
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
            Rate your personal fit with this specific opportunity 1–10. The decision engine combines your ratings with the business quality, owner dependency, and Buy Box scores.
          </p>
          {personalFitScore > 0 && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, color: scoreColor(personalFitScore) }}>
                {personalFitScore}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)' }}>/100</span>
              </span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Personal fit · {ratedFit.length}/9 rated</span>
            </div>
          )}
        </div>

        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
            Personal Fit Score (Module T)
          </div>
          {FIT_ITEMS.map(item => {
            const v = fitScores[item.key] ?? 0
            return (
              <div key={item.key} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.45, marginBottom: 8 }}>{item.hint}</div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button key={n} type="button" onClick={() => set(item.key, v === n ? 0 : n)} style={{
                      width: 34, height: 28, borderRadius: 2, fontSize: 11,
                      fontFamily: 'var(--mono)', cursor: 'pointer',
                      background: v === n ? (n >= 7 ? 'var(--teal)' : n >= 5 ? 'var(--brass)' : 'var(--rust)') : 'var(--paper-2)',
                      color: v === n ? 'var(--white)' : 'var(--muted)',
                      border: `1px solid ${v === n ? 'transparent' : 'var(--line)'}`,
                    }}>{n}</button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: 20, borderTop: '1px solid var(--line)', paddingTop: 16 }}>
          {error && <div style={{ marginBottom: 12, padding: '10px 14px', background: '#fff0f0', border: '1px solid var(--rust)', borderRadius: 3, fontSize: 12.5, color: 'var(--rust)' }}>{error}</div>}
          {saved && <div style={{ marginBottom: 12, padding: '10px 14px', background: 'var(--teal-soft)', border: '1px solid var(--teal)', borderRadius: 3, fontSize: 12.5, color: 'var(--teal)' }}>Saved.</div>}
          <button type="button" className="ban-btn ban-btn-primary ban-focus" onClick={handleSave} disabled={pending}>
            {pending ? 'Saving…' : 'Save fit scores'}
          </button>
        </div>
      </div>

      {/* Right — decision engine */}
      <div style={{ position: 'sticky', top: 20, display: 'grid', gap: 12 }}>
        {/* Recommendation */}
        <div style={{ background: rConfig.bg, border: `1px solid ${rConfig.color}`, borderRadius: 3, padding: 18 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: rConfig.color, marginBottom: 8 }}>Decision Engine</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: rConfig.color, lineHeight: 1.3 }}>{rConfig.label}</div>
          {decision.blendedScore > 0 && (
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: rConfig.color, marginTop: 6, opacity: 0.8 }}>
              Blended score: {decision.blendedScore}/100
            </div>
          )}
        </div>

        {/* Score breakdown */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 18 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>Score Breakdown</div>
          <div style={{ display: 'grid', gap: 12 }}>
            <ScoreBar score={personalFitScore} label="Personal fit" />
            <ScoreBar score={decision.businessQualityScore} label="Business quality" />
            <ScoreBar score={buyBoxScore} label="Buy Box alignment" />
            <ScoreBar score={decision.ownerDependencyScore} label="Owner independence" />
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Breakers', count: decision.redFlagCounts.breakers, color: 'var(--rust)' },
              { label: 'Red flags', count: decision.redFlagCounts.reds, color: 'var(--rust)' },
              { label: 'Ambers', count: decision.redFlagCounts.ambers, color: '#b06000' },
            ].map(f => (
              <div key={f.label}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color: f.count > 0 ? f.color : 'var(--muted)' }}>{f.count}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', marginLeft: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reasons */}
        {decision.reasons.length > 0 && (
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 18 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Key Reasons</div>
            <div style={{ display: 'grid', gap: 6 }}>
              {decision.reasons.map((r, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.45 }}>· {r}</div>
              ))}
            </div>
          </div>
        )}

        {/* Risks */}
        {decision.risks.length > 0 && (
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 18 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Material Risks</div>
            <div style={{ display: 'grid', gap: 6 }}>
              {decision.risks.map((r, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--rust)', lineHeight: 1.45, display: 'flex', gap: 6 }}>
                  <span style={{ flexShrink: 0 }}>⚠</span>{r}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing info */}
        {decision.missingInfo.length > 0 && (
          <div style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 3, padding: 18 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Missing Information</div>
            <div style={{ display: 'grid', gap: 5 }}>
              {decision.missingInfo.map((m, i) => (
                <div key={i} style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.45 }}>· {m}</div>
              ))}
            </div>
          </div>
        )}

        {/* Next actions */}
        {decision.nextActions.length > 0 && (
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 18 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Next Actions</div>
            <div style={{ display: 'grid', gap: 6 }}>
              {decision.nextActions.map((a, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.5 }}>
                  <span style={{ fontFamily: 'var(--mono)', color: 'var(--brass)', marginRight: 6 }}>{i + 1}.</span>{a}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ fontSize: 10.5, color: 'var(--muted)', lineHeight: 1.55, padding: '0 2px' }}>
          This recommendation is decision-support only — not regulated financial or legal advice. Always seek professional guidance before making an offer.
        </div>
      </div>
    </div>
  )
}
