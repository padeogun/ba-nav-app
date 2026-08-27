'use client'

import { useState, useEffect } from 'react'

type Officer = {
  name: string
  officer_role: string
  appointed_on?: string
  resigned_on?: string
  nationality?: string
  occupation?: string
}

type PSCItem = {
  kind: string
  name?: string
  natures_of_control?: string[]
  notified_on?: string
  ceased?: boolean
  ceased_on?: string
}

type FilingItem = {
  category: string
  type: string
  description: string
  description_values?: Record<string, string>
  date: string
}

type CHData = {
  officers: { items: Officer[]; active_count?: number } | null
  psc: { items: PSCItem[] } | null
  filings: { items: FilingItem[] } | null
}

interface Props {
  companyNumber: string
}

function fmtDate(d?: string) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return d }
}

function fmtRole(role: string) {
  return role.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function fmtNoc(codes?: string[]) {
  if (!codes?.length) return '—'
  return codes.map((c) => {
    if (c.includes('75-to-100')) return '75–100% shares/votes'
    if (c.includes('50-to-75')) return '50–75% shares/votes'
    if (c.includes('25-to-50')) return '25–50% shares/votes'
    if (c.includes('voting-rights')) return 'Voting rights'
    if (c.includes('significant-influence')) return 'Significant influence or control'
    if (c.includes('right-to-appoint')) return 'Right to appoint/remove directors'
    return c.replace(/-/g, ' ')
  }).join(' · ')
}

function computeSignals(data: CHData): { warn: boolean; text: string }[] {
  const out: { warn: boolean; text: string }[] = []

  if (data.officers) {
    const activeDirectors = data.officers.items.filter(
      (o) => !o.resigned_on && o.officer_role === 'director'
    )
    if (activeDirectors.length === 1) {
      out.push({ warn: true, text: 'Sole director — high key-person risk' })
    } else if (activeDirectors.length > 1) {
      out.push({ warn: false, text: `${activeDirectors.length} active directors` })
    }

    const cutoff = new Date()
    cutoff.setFullYear(cutoff.getFullYear() - 1)
    const recentResigned = data.officers.items.filter(
      (o) => o.resigned_on && o.officer_role === 'director' && new Date(o.resigned_on) > cutoff
    )
    if (recentResigned.length > 0) {
      out.push({ warn: true, text: `${recentResigned.length} director${recentResigned.length > 1 ? 's' : ''} resigned in the past 12 months` })
    }
  }

  if (data.psc) {
    const active = data.psc.items.filter((p) => !p.ceased)
    if (active.length === 0) {
      out.push({ warn: true, text: 'No active PSC registered — ownership structure unclear' })
    } else if (active.length > 2) {
      out.push({ warn: true, text: `${active.length} persons with significant control — all must agree to sell` })
    } else {
      out.push({ warn: false, text: `${active.length} PSC${active.length > 1 ? 's' : ''} registered` })
    }
  }

  if (data.filings) {
    const accounts = data.filings.items.filter((f) => f.category === 'accounts')
    if (accounts.length === 0) {
      out.push({ warn: true, text: 'No accounts filed on record' })
    } else {
      const latest = accounts[0]
      const monthsAgo = Math.round(
        (Date.now() - new Date(latest.date).getTime()) / (1000 * 60 * 60 * 24 * 30)
      )
      if (monthsAgo > 18) {
        out.push({ warn: true, text: `Last accounts filed ${monthsAgo} months ago — may be overdue` })
      } else {
        out.push({ warn: false, text: `Last accounts filed ${fmtDate(latest.date)}` })
      }
    }
  }

  return out
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
      {children}
    </div>
  )
}

export default function CHDataPanel({ companyNumber }: Props) {
  const [data, setData] = useState<CHData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!companyNumber) return
    setLoading(true)
    setError(null)
    setData(null)

    const n = encodeURIComponent(companyNumber)
    Promise.all([
      fetch(`/api/companies-house?number=${n}&data=officers`).then((r) => r.json()),
      fetch(`/api/companies-house?number=${n}&data=psc`).then((r) => r.json()),
      fetch(`/api/companies-house?number=${n}&data=filings`).then((r) => r.json()),
    ])
      .then(([officers, psc, filings]) => {
        setData({
          officers: officers.error ? null : officers,
          psc: psc.error ? null : psc,
          filings: filings.error ? null : filings,
        })
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [companyNumber])

  if (loading) {
    return (
      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22 }}>
        <SectionLabel>Companies House Records</SectionLabel>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Loading official records…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22 }}>
        <SectionLabel>Companies House Records</SectionLabel>
        <div style={{ fontSize: 12, color: 'var(--rust)' }}>Failed to load: {error}</div>
      </div>
    )
  }

  if (!data) return null

  const sigs = computeSignals(data)
  const activeOfficers = data.officers?.items.filter((o) => !o.resigned_on) ?? []
  const resignedOfficers = data.officers?.items.filter((o) => !!o.resigned_on) ?? []
  const activePSC = data.psc?.items.filter((p) => !p.ceased) ?? []
  const ceasedPSC = data.psc?.items.filter((p) => p.ceased) ?? []
  const recentFilings = data.filings?.items.slice(0, 12) ?? []

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Signals */}
      {sigs.length > 0 && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22 }}>
          <SectionLabel>CH Signals</SectionLabel>
          <div style={{ display: 'grid', gap: 8 }}>
            {sigs.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, lineHeight: 1.5, color: s.warn ? 'var(--rust)' : 'var(--teal)' }}>
                <span style={{ flexShrink: 0, fontFamily: 'var(--mono)', fontSize: 11 }}>{s.warn ? '⚠' : '✓'}</span>
                {s.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Officers */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22 }}>
        <SectionLabel>
          Officers — {activeOfficers.length} active{resignedOfficers.length > 0 ? `, ${resignedOfficers.length} resigned` : ''}
        </SectionLabel>

        {activeOfficers.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>No active officers found.</div>
        ) : (
          <div style={{ display: 'grid', gap: 0 }}>
            {activeOfficers.map((o, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  padding: '10px 0',
                  borderBottom: i < activeOfficers.length - 1 ? '1px solid var(--line)' : 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{o.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{fmtRole(o.officer_role)}</div>
                  {o.occupation && o.occupation.toLowerCase() !== o.officer_role.replace(/-/g, ' ') && (
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{o.occupation}</div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>
                    Appointed {fmtDate(o.appointed_on)}
                  </div>
                  {o.nationality && (
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{o.nationality}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {resignedOfficers.length > 0 && (
          <details style={{ marginTop: activeOfficers.length > 0 ? 14 : 0 }}>
            <summary style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', cursor: 'pointer', userSelect: 'none', letterSpacing: '.05em' }}>
              Show {resignedOfficers.length} resigned officer{resignedOfficers.length > 1 ? 's' : ''}
            </summary>
            <div style={{ display: 'grid', gap: 0, marginTop: 10 }}>
              {resignedOfficers.slice(0, 25).map((o, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', padding: '6px 0', borderBottom: i < Math.min(resignedOfficers.length, 25) - 1 ? '1px solid var(--line)' : 'none' }}>
                  <span>{o.name} · {fmtRole(o.officer_role)}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, flexShrink: 0, marginLeft: 12 }}>
                    Resigned {fmtDate(o.resigned_on)}
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* PSC */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22 }}>
        <SectionLabel>Persons with Significant Control — {activePSC.length} active</SectionLabel>

        {activePSC.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>No active PSC registered.</div>
        ) : (
          <div style={{ display: 'grid', gap: 0 }}>
            {activePSC.map((p, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 0',
                  borderBottom: i < activePSC.length - 1 ? '1px solid var(--line)' : 'none',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                  {p.name ?? <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Name protected</span>}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>
                  {fmtNoc(p.natures_of_control)}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>
                  Registered {fmtDate(p.notified_on)}
                </div>
              </div>
            ))}
          </div>
        )}

        {ceasedPSC.length > 0 && (
          <details style={{ marginTop: activePSC.length > 0 ? 14 : 0 }}>
            <summary style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', cursor: 'pointer', userSelect: 'none', letterSpacing: '.05em' }}>
              Show {ceasedPSC.length} ceased PSC{ceasedPSC.length > 1 ? 's' : ''}
            </summary>
            <div style={{ display: 'grid', gap: 0, marginTop: 10 }}>
              {ceasedPSC.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', padding: '6px 0', borderBottom: i < ceasedPSC.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <span>{p.name ?? 'Name protected'} · {fmtNoc(p.natures_of_control)}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, flexShrink: 0, marginLeft: 12 }}>
                    Ceased {fmtDate(p.ceased_on)}
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Filing history */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22 }}>
        <SectionLabel>Recent Filings</SectionLabel>

        {recentFilings.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>No filings found.</div>
        ) : (
          <div style={{ display: 'grid', gap: 0 }}>
            {recentFilings.map((f, i) => {
              const isAccounts = f.category === 'accounts'
              const label = f.description_values?.made_up_date
                ? `Accounts to ${fmtDate(f.description_values.made_up_date)}`
                : f.description.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: i < recentFilings.length - 1 ? '1px solid var(--line)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 5px', borderRadius: 2,
                      textTransform: 'uppercase', letterSpacing: '.04em', flexShrink: 0,
                      background: isAccounts ? 'var(--teal-soft)' : 'var(--paper-2)',
                      color: isAccounts ? 'var(--teal)' : 'var(--muted)',
                    }}>
                      {f.type}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {label}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', flexShrink: 0, marginLeft: 12 }}>
                    {fmtDate(f.date)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
