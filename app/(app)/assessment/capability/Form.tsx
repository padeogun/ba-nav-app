'use client'

import { useState } from 'react'
import ModuleNav from '@/components/assessment/ModuleNav'
import { saveCapability } from '@/app/actions/assessment'
import { SKILLS } from '@/lib/constants'

type SkillEntry = { rating: number; enjoy: boolean }

export default function CapabilityForm({ initialSkills }: { initialSkills: Record<string, SkillEntry> }) {
  const [skills, setSkills] = useState(initialSkills)

  const setRating = (key: string, rating: number) =>
    setSkills((s) => ({ ...s, [key]: { ...s[key], rating, enjoy: s[key]?.enjoy ?? false } }))
  const setEnjoy = (key: string, enjoy: boolean) =>
    setSkills((s) => ({ ...s, [key]: { ...s[key], rating: s[key]?.rating ?? 0, enjoy } }))

  const answered = SKILLS.filter((s) => (skills[s.key]?.rating ?? 0) > 0).length
  const canComplete = answered >= SKILLS.length

  const handleSave = async (completed: boolean) => {
    return saveCapability({ skills, completed })
  }

  const RATING_LABELS = ['1', '2', '3', '4', '5']

  return (
    <div className="ban-fade-in" style={{ padding: '40px', maxWidth: '960px' }}>
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--brass)', marginBottom: '6px' }}>
          Module D · Assess
        </p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 500, color: 'var(--ink)', margin: 0 }}>Capability</h1>
        <p style={{ marginTop: 8, color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.55, maxWidth: 640 }}>
          Rate your current level in each skill (1 = no experience, 5 = expert), then tick "Enjoy" if it is work you actively enjoy. Both matter: enjoyment without skill is enthusiasm; skill without enjoyment is a job you do not want.
        </p>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', padding: '10px 18px', background: 'var(--paper-2)', borderBottom: '1px solid var(--line)' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Skill</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center', minWidth: 180 }}>Rating (1–5)</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center', minWidth: 60 }}>Enjoy</span>
        </div>
        {SKILLS.map((skill, idx) => {
          const entry = skills[skill.key]
          const rating = entry?.rating ?? 0
          const enjoy = entry?.enjoy ?? false
          return (
            <div
              key={skill.key}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                alignItems: 'center',
                padding: '9px 18px',
                borderBottom: idx < SKILLS.length - 1 ? '1px solid var(--line)' : 'none',
                background: enjoy && rating > 0 ? 'var(--teal-soft)' : 'transparent',
              }}
            >
              <span style={{ fontSize: 13.5, color: 'var(--ink)' }}>{skill.label}</span>
              <div style={{ display: 'flex', minWidth: 180, gap: 0 }}>
                {RATING_LABELS.map((l, i) => (
                  <button
                    key={i}
                    className={`ban-likert-btn${rating === i + 1 ? ' selected' : ''}`}
                    onClick={() => setRating(skill.key, i + 1)}
                    type="button"
                    style={{ flex: 1 }}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', minWidth: 60 }}>
                <input
                  type="checkbox"
                  checked={enjoy}
                  onChange={(e) => setEnjoy(skill.key, e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: 'var(--teal)', cursor: 'pointer' }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 10, height: 10, background: 'var(--teal-soft)', border: '1px solid var(--teal)', borderRadius: 2 }} />
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Highlighted rows = skills you enjoy</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', marginLeft: 16 }}>{answered}/{SKILLS.length} rated</span>
      </div>

      <ModuleNav
        prevHref="/assessment/ownership"
        nextHref="/assessment/financial"
        onSave={handleSave}
        canComplete={canComplete}
      />
    </div>
  )
}
