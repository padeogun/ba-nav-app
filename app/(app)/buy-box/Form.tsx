'use client'
import { useState, useMemo, useTransition } from 'react'
import {
  computeAllSectorScores, draftBuyBox, buyBoxThesis,
  motivationScore, temperamentScores, ownershipStyleScores,
  capabilitySummary, financialReadiness, riskSummary, round1,
  type FullProfile, type BuyBoxDraft,
} from '@/lib/scoring'
import { SECTOR_DB } from '@/lib/constants'
import { saveBuyBox } from '@/app/actions/sectors'

function buildBlueprintText(profile: FullProfile, scores: ReturnType<typeof computeAllSectorScores>, bb: BuyBoxDraft, thesis: string): string {
  const mot = motivationScore(profile.motivation)
  const temp = temperamentScores(profile.temperament)
  const style = ownershipStyleScores(profile.ownershipStyle)
  const cap = capabilitySummary(profile.capability)
  const fin = financialReadiness(profile.financial)
  const risk = riskSummary(profile.risk)
  const top = scores.filter((s) => !s.hardExcluded).slice(0, 5)
  const avoid = scores.filter((s) => s.hardExcluded)
  const dominantStyle = Object.entries(style).sort((a, b) => b[1] - a[1])[0]
  void temp

  return `PERSONAL ACQUISITION BLUEPRINT — ${profile.name}
Generated ${new Date().toLocaleDateString('en-GB')}

1. WHY I WANT TO ACQUIRE
${profile.motivation.why || 'Not yet answered.'}

2. ACQUISITION READINESS
Motivation score: ${mot.total}/${mot.max}
${mot.redFlags.length ? 'Flags: ' + mot.redFlags.join(' ') : 'No significant motivation flags.'}

3. OWNERSHIP STYLE
${Object.entries(style).map(([k, v]) => `${k}: ${round1(v)}%`).join(' | ')}
Dominant style: ${dominantStyle ? dominantStyle[0] : 'Not yet assessed'}

4. TRANSFERABLE CAPABILITIES
Top strengths: ${cap.strengths.map((s) => s.label).join(', ') || 'Not yet assessed'}

5. DEVELOPMENT GAPS
${cap.weaknesses.map((s) => s.label).join(', ') || 'None flagged'}
${cap.strongDisliked.length ? 'Capable but disliked (avoid businesses depending on these): ' + cap.strongDisliked.map((s) => s.label).join(', ') : ''}

6. FINANCIAL CAPACITY
Capital available: £${profile.financial.capitalAvailable || 'not provided'}
Amount prepared to risk: £${profile.financial.riskCapital || 'not provided'}
Reserves: ${profile.financial.reserveMonths} months
Financial readiness score: ${fin.score}/100
${fin.warnings.length ? 'Warnings: ' + fin.warnings.join(' ') : ''}

7. RISK TOLERANCE
Least acceptable risks: ${risk.leastAcceptable.map((r) => r.label).join(', ') || 'Not yet assessed'}
Manageable risks: ${risk.manageable.map((r) => r.label).join(', ') || 'Not yet assessed'}

8. LIFESTYLE REQUIREMENTS
Weekly hours: ${profile.lifestyle.weeklyHours} | Weekend tolerance: ${profile.lifestyle.weekendTolerance} | Max commute: ${profile.lifestyle.maxCommute} min

9. SECTOR RANKING (top 5)
${top.map((s, i) => `${i + 1}. ${s.sector.name} — ${s.scoreOn100}/100`).join('\n')}

10. SECTORS TO AVOID
${avoid.length ? avoid.map((s) => `${s.sector.name} — ${s.exclusionReason}`).join('\n') : 'None excluded yet.'}

11. VALUE-CREATION ADVANTAGE
Skills you both possess and enjoy — your likely value-creation lane: ${cap.strengths.filter((s) => s.enjoy).map((s) => s.label).join(', ') || 'Not yet clear.'}

12. RECOMMENDED BUSINESS CHARACTERISTICS
Minimum recurring revenue ${bb.minRecurring}%, maximum customer concentration ${bb.maxCustomerConcentration}%, ${bb.minYearsTrading}+ years trading, ${bb.maxSellerDependency} seller dependency.

13. ACQUISITION BUY BOX
Sectors: ${bb.sectorsPreferred.map((id) => SECTOR_DB.find((s) => s.id === id)?.name).filter(Boolean).join(', ')}
Excluded: ${bb.sectorsExcluded.map((id) => SECTOR_DB.find((s) => s.id === id)?.name).filter(Boolean).join(', ') || 'None'}
Max price: £${bb.priceMax || 'not set'} | Ownership model: ${bb.ownershipModel}

14. ACQUISITION THESIS
${thesis}

15. KEY RISKS
${risk.leastAcceptable.map((r) => `- Low tolerance for ${r.label.toLowerCase()}`).join('\n') || 'Complete the risk assessment to populate this.'}

16. LEARNING PRIORITIES
${cap.weaknesses.map((s) => `- ${s.label}`).join('\n') || 'None flagged yet.'}

17. RECOMMENDED NEXT STEPS
- Review and adjust the Buy Box above until it genuinely reflects your limits, not just your enthusiasm.
- Begin logging real opportunities against this Buy Box (Search & Screen stages, MVP2).
- Revisit this Blueprint after your first few opportunity screens — it should sharpen, not just confirm.

---
Educational decision-support only. Not regulated financial, legal, or tax advice.
Involve an accountant, solicitor and other relevant professionals before any binding step.
`
}

function SectorChip({ name, active, tone, onToggle }: { name: string; active: boolean; tone: 'preferred' | 'excluded'; onToggle: () => void }) {
  const activeColor = tone === 'preferred' ? 'var(--teal)' : 'var(--rust)'
  const activeBg = tone === 'preferred' ? 'var(--teal-soft)' : 'var(--rust-soft)'
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        fontFamily: 'var(--sans)', fontSize: '11.5px', padding: '4px 9px', borderRadius: '2px',
        cursor: 'pointer', border: `1px solid ${active ? activeColor : 'var(--line)'}`,
        background: active ? activeBg : 'var(--white)',
        color: active ? activeColor : 'var(--ink-soft)',
      }}
    >
      {name}
    </button>
  )
}

function FieldInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: '5px' }}>{label}</label>
      <input
        className="ban-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export default function BuyBoxForm({ profile, initialBuyBox }: { profile: FullProfile; initialBuyBox: BuyBoxDraft | null }) {
  const scores = useMemo(
    () => computeAllSectorScores({ capability: profile.capability, lifestyle: profile.lifestyle, interests: profile.interests, buyBox: null }),
    [profile]
  )

  const [bb, setBb] = useState<BuyBoxDraft>(initialBuyBox ?? draftBuyBox(profile, scores))
  const [copied, setCopied] = useState(false)
  const [saving, startSave] = useTransition()
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const currentScores = useMemo(
    () => computeAllSectorScores({ capability: profile.capability, lifestyle: profile.lifestyle, interests: profile.interests, buyBox: { sectorsExcluded: bb.sectorsExcluded } }),
    [profile, bb.sectorsExcluded]
  )

  const thesis = useMemo(() => buyBoxThesis(bb, currentScores), [bb, currentScores])

  const set = (k: keyof BuyBoxDraft, v: BuyBoxDraft[typeof k]) => setBb((prev) => ({ ...prev, [k]: v }))

  function toggleSector(key: 'sectorsPreferred' | 'sectorsExcluded', id: string) {
    const list = bb[key] as string[]
    set(key, list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  }

  async function handleSave() {
    setSaveMsg(null)
    startSave(async () => {
      const result = await saveBuyBox(bb)
      setSaveMsg(result.error ? `Error: ${result.error}` : 'Saved.')
    })
  }

  async function handleCopy() {
    const text = buildBlueprintText(profile, currentScores, bb, thesis)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="ban-fade-in" style={{ padding: '40px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--brass)', marginBottom: '6px' }}>
          Module M · Define
        </p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '28px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2 }}>
          Acquisition Buy Box
        </h1>
        <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--ink-soft)', maxWidth: '560px' }}>
          Your explicit acquisition criteria. Drafted from your assessments — adjust anything before treating it as final.
        </p>
      </div>

      {/* Thesis card */}
      <div style={{ background: 'var(--white)', border: '1.5px solid var(--brass)', borderRadius: '3px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--brass)', marginBottom: '8px' }}>
          Acquisition thesis (plain English)
        </div>
        <p style={{ fontFamily: 'var(--serif)', fontSize: '16.5px', lineHeight: 1.6, margin: 0, color: 'var(--ink)' }}>
          {thesis}
        </p>
      </div>

      {/* Main form card */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '3px', padding: '22px', marginBottom: '16px', display: 'grid', gap: '18px' }}>
        {/* Preferred sectors */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: '5px' }}>
            Preferred sectors <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(auto-suggested from your top matches)</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {SECTOR_DB.map((s) => (
              <SectorChip key={s.id} name={s.name} active={bb.sectorsPreferred.includes(s.id)} tone="preferred" onToggle={() => toggleSector('sectorsPreferred', s.id)} />
            ))}
          </div>
        </div>

        {/* Excluded sectors */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: '5px' }}>
            Excluded sectors
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {SECTOR_DB.map((s) => (
              <SectorChip key={s.id} name={s.name} active={bb.sectorsExcluded.includes(s.id)} tone="excluded" onToggle={() => toggleSector('sectorsExcluded', s.id)} />
            ))}
          </div>
        </div>

        {/* Numeric fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          <FieldInput label="Max purchase price (£)" value={bb.priceMax} onChange={(v) => set('priceMax', v)} />
          <FieldInput label="Target adjusted EBITDA (£)" value={bb.ebitdaMax} onChange={(v) => set('ebitdaMax', v)} />
          <FieldInput label="Minimum margin (%)" value={bb.minMargin} onChange={(v) => set('minMargin', v)} />
          <FieldInput label="Min. recurring/repeat revenue (%)" value={bb.minRecurring} onChange={(v) => set('minRecurring', v)} />
          <FieldInput label="Max customer concentration (%)" value={bb.maxCustomerConcentration} onChange={(v) => set('maxCustomerConcentration', v)} />
          <FieldInput label="Max supplier concentration (%)" value={bb.maxSupplierConcentration} onChange={(v) => set('maxSupplierConcentration', v)} />
          <FieldInput label="Minimum years trading" value={bb.minYearsTrading} onChange={(v) => set('minYearsTrading', v)} />
          <FieldInput label="Max owner hours/week" value={bb.maxOwnerHours} onChange={(v) => set('maxOwnerHours', v)} />
          <FieldInput label="Max distance (miles/mins)" value={bb.maxDistance} onChange={(v) => set('maxDistance', v)} />

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: '5px' }}>Max seller dependency</label>
            <select className="ban-select" value={bb.maxSellerDependency} onChange={(e) => set('maxSellerDependency', e.target.value)}>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High (accepted)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: '5px' }}>Ownership model</label>
            <select className="ban-select" value={bb.ownershipModel} onChange={(e) => set('ownershipModel', e.target.value)}>
              <option>Owner/operator</option>
              <option>Owner-manager</option>
              <option>Strategic owner</option>
              <option>Management-led</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          className="ban-btn ban-btn-ghost"
          type="button"
          onClick={() => setBb(draftBuyBox(profile, scores))}
        >
          ↺ Regenerate draft
        </button>
        <button
          className="ban-btn ban-btn-brass"
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{ opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving…' : 'Save Buy Box'}
        </button>
        <button
          className="ban-btn ban-btn-brass"
          type="button"
          onClick={handleCopy}
          style={{ background: 'transparent', border: '1px solid var(--brass)', color: 'var(--brass)' }}
        >
          {copied ? '✓ Copied' : '⎘ Copy Personal Acquisition Blueprint'}
        </button>
        {saveMsg && (
          <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: saveMsg.startsWith('Error') ? 'var(--rust)' : 'var(--teal)' }}>
            {saveMsg}
          </span>
        )}
      </div>

      {/* Hard exclusion note */}
      <div style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: '3px', padding: '14px 16px', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--ink)' }}>Note on hard exclusions:</strong> Lifestyle constraints (e.g. weekend availability) always override a high score elsewhere — a 90/100 opportunity in an excluded sector still isn't a fit.
        </p>
      </div>

      {/* Safety banner */}
      <p style={{ fontSize: '12px', color: 'var(--muted)', borderTop: '1px solid var(--line)', paddingTop: '16px', lineHeight: 1.6 }}>
        <strong>Educational tool, not financial advice.</strong> This Buy Box is a decision-support framework — it does not replace legal, financial, or commercial due diligence. Always involve a solicitor, accountant, and relevant professionals before any binding step.
      </p>
    </div>
  )
}
