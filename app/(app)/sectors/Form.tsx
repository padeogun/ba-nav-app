'use client'
import { useState, useMemo, useTransition } from 'react'
import {
  computeAllSectorScores, round1,
  type CapabilityData, type LifestyleData,
} from '@/lib/scoring'
import { CRITERIA_WEIGHTS, TOTAL_WEIGHT } from '@/lib/constants'
import { toggleSectorInterest } from '@/app/actions/sectors'

type SectorScore = ReturnType<typeof computeAllSectorScores>[number]

function ScoreChip({ score }: { score: number }) {
  const tone = score >= 65 ? 'good' : score >= 45 ? 'warn' : 'bad'
  const color = tone === 'good' ? 'var(--teal)' : tone === 'warn' ? 'var(--amber)' : 'var(--rust)'
  const bg = tone === 'good' ? 'var(--teal-soft)' : tone === 'warn' ? '#fff8e1' : 'var(--rust-soft)'
  const label = score >= 65 ? 'Top match' : score >= 45 ? 'Moderate' : 'Poor match'
  return (
    <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', padding: '2px 7px', borderRadius: '2px', background: bg, color, textTransform: 'uppercase', letterSpacing: '.06em' }}>
      {label}
    </span>
  )
}

function SectorRow({ s, rank, expanded, onToggleExpand, interested, onToggleInterest, isPending }:
  { s: SectorScore; rank: number; expanded: boolean; onToggleExpand: () => void; interested: boolean; onToggleInterest: () => void; isPending: boolean }) {
  const tone = s.scoreOn100 >= 65 ? 'good' : s.scoreOn100 >= 45 ? 'warn' : 'bad'
  const scoreColor = tone === 'good' ? 'var(--teal)' : tone === 'warn' ? 'var(--amber)' : 'var(--rust)'
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '3px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 18px', cursor: 'pointer' }} onClick={onToggleExpand}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--muted)', width: '20px', flexShrink: 0 }}>
          {String(rank).padStart(2, '0')}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--ink)' }}>{s.sector.name}</span>
            <ScoreChip score={s.scoreOn100} />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{s.sector.blurb}</div>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={(e) => { e.stopPropagation(); onToggleInterest() }}
          style={{
            fontFamily: 'var(--mono)', fontSize: '11px', padding: '6px 10px',
            borderRadius: '2px', cursor: 'pointer', flexShrink: 0,
            border: `1px solid ${interested ? 'var(--teal)' : 'var(--line)'}`,
            background: interested ? 'var(--teal-soft)' : 'transparent',
            color: interested ? 'var(--teal)' : 'var(--muted)',
            opacity: isPending ? 0.6 : 1,
          }}
        >
          {interested ? '✓ Interested' : 'Mark interest'}
        </button>
        <div style={{ width: '92px', textAlign: 'right', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '20px', fontWeight: 700, color: scoreColor }}>{s.scoreOn100}</span>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>/100</span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--muted)', transform: expanded ? 'rotate(90deg)' : 'none', display: 'inline-block', transition: 'transform .15s', flexShrink: 0 }}>›</span>
      </div>

      {expanded && (
        <div style={{ padding: '6px 18px 18px 52px', borderTop: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '.04em' }}>
            Full weighted breakdown
          </div>
          <div style={{ display: 'grid', gap: '4px' }}>
            {CRITERIA_WEIGHTS.map((c) => {
              const v = s.values[c.key] ?? 0
              return (
                <div key={c.key} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px 40px', alignItems: 'center', fontSize: '11.5px', gap: '8px' }}>
                  <span style={{ color: 'var(--ink-soft)' }}>
                    {c.label} <span style={{ color: 'var(--muted)' }}>({c.source})</span>
                  </span>
                  <span style={{ fontFamily: 'var(--mono)' }}>{round1(v)}/5</span>
                  <div style={{ height: '4px', background: 'var(--line)', borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: `${(v / 5) * 100}%`, background: 'var(--teal)', borderRadius: '2px' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', color: 'var(--muted)' }}>×{c.weight}</span>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: '12px', fontSize: '11.5px', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
            Total weight: {TOTAL_WEIGHT} · Score: {s.scoreOn100}/100
          </div>
        </div>
      )}
    </div>
  )
}

export default function SectorsForm({
  capability, lifestyle, initialInterests, buyBoxExcluded,
}: {
  capability: CapabilityData
  lifestyle: LifestyleData
  initialInterests: string[]
  buyBoxExcluded: string[]
}) {
  const [interests, setInterests] = useState<string[]>(initialInterests)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showExcluded, setShowExcluded] = useState(false)
  const [pending, startTransition] = useTransition()
  const [pendingSectorId, setPendingSectorId] = useState<string | null>(null)

  const scores = useMemo(
    () => computeAllSectorScores({ capability, lifestyle, interests, buyBox: { sectorsExcluded: buyBoxExcluded } }),
    [capability, lifestyle, interests, buyBoxExcluded]
  )

  const eligible = scores.filter((s) => !s.hardExcluded)
  const excluded = scores.filter((s) => s.hardExcluded)

  function handleToggleInterest(sectorId: string) {
    const next = interests.includes(sectorId) ? interests.filter((i) => i !== sectorId) : [...interests, sectorId]
    setInterests(next)
    setPendingSectorId(sectorId)
    startTransition(async () => {
      await toggleSectorInterest(sectorId)
      setPendingSectorId(null)
    })
  }

  return (
    <div className="ban-fade-in" style={{ padding: '40px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--brass)', marginBottom: '6px' }}>
          Module K · Match
        </p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '28px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2 }}>
          Sector matching engine
        </h1>
        <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--ink-soft)', maxWidth: '600px' }}>
          Weighted across {CRITERIA_WEIGHTS.length} criteria (total weight {TOTAL_WEIGHT}). Tick sectors that genuinely interest you to sharpen the "personal interest" criterion — click any sector to see the full breakdown.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '10px', marginBottom: '24px' }}>
        {eligible.map((s, idx) => (
          <SectorRow
            key={s.sector.id}
            s={s}
            rank={idx + 1}
            expanded={expanded === s.sector.id}
            onToggleExpand={() => setExpanded(expanded === s.sector.id ? null : s.sector.id)}
            interested={interests.includes(s.sector.id)}
            onToggleInterest={() => handleToggleInterest(s.sector.id)}
            isPending={pendingSectorId === s.sector.id && pending}
          />
        ))}
      </div>

      {excluded.length > 0 && (
        <div style={{ marginTop: '22px' }}>
          <button
            className="ban-btn ban-btn-ghost"
            type="button"
            onClick={() => setShowExcluded(!showExcluded)}
            style={{ fontSize: '12.5px' }}
          >
            {showExcluded ? 'Hide' : 'Show'} {excluded.length} sector{excluded.length !== 1 ? 's' : ''} excluded by hard constraints
          </button>
          {showExcluded && (
            <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
              {excluded.map((s) => (
                <div key={s.sector.id} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '3px', padding: '12px 16px', opacity: 0.7, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)' }}>{s.sector.name}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--rust)', marginTop: '2px' }}>✕ {s.exclusionReason}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', padding: '2px 7px', borderRadius: '2px', background: 'var(--rust-soft)', color: 'var(--rust)', textTransform: 'uppercase' }}>Excluded</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <p style={{ marginTop: '32px', fontSize: '12px', color: 'var(--muted)', borderTop: '1px solid var(--line)', paddingTop: '16px', lineHeight: 1.6 }}>
        <strong>Educational tool, not financial advice.</strong> Sector scores reflect your assessment responses — they do not constitute investment or business advice. Always seek professional guidance before completing an acquisition.
      </p>
    </div>
  )
}
