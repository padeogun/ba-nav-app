'use client'

import { useState, useTransition } from 'react'

type LinkedCompany = {
  number: string
  name: string
  status: string
  sicCodes: string
  incorporatedOn: string
}

type CHResult = {
  company_number: string
  title: string
  company_status: string
  date_of_creation: string
  registered_office_address?: { locality?: string; address_line_1?: string; postal_code?: string }
  sic_codes?: string[]
}

interface Props {
  linked: LinkedCompany | null
  onLink: (ch: { chCompanyNumber: string; chCompanyName: string; chStatus: string; chSicCodes: string; chIncorporatedOn: string }) => void
  onUnlink: () => void
}

export default function CompaniesHousePanel({ linked, onLink, onUnlink }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CHResult[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const search = () => {
    if (!query.trim()) return
    setSearchError(null)
    setResults([])
    startTransition(async () => {
      try {
        const res = await fetch(`/api/companies-house?q=${encodeURIComponent(query.trim())}`)
        const data = await res.json()
        if (data.error) { setSearchError(data.error); return }
        setResults(data.items ?? [])
        if ((data.items ?? []).length === 0) setSearchError('No companies found — try a different name or company number.')
      } catch (e) {
        setSearchError(String(e))
      }
    })
  }

  const pick = (r: CHResult) => {
    onLink({
      chCompanyNumber: r.company_number,
      chCompanyName: r.title,
      chStatus: r.company_status ?? '',
      chSicCodes: (r.sic_codes ?? []).join(', '),
      chIncorporatedOn: r.date_of_creation ?? '',
    })
    setResults([])
    setQuery('')
  }

  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 3, padding: 22 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
        Companies House
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.5 }}>
        Link the registered UK company to pull official records. Search by name or company number.
      </div>

      {linked ? (
        <div>
          <div style={{ background: 'var(--teal-soft)', border: '1px solid var(--teal)', borderRadius: 3, padding: '12px 16px', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{linked.name}</div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>No. {linked.number}</span>
                  {linked.status && (
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 6px', borderRadius: 2,
                      textTransform: 'uppercase', letterSpacing: '.06em',
                      background: linked.status === 'active' ? 'var(--teal-soft)' : 'var(--rust-soft)',
                      color: linked.status === 'active' ? 'var(--teal)' : 'var(--rust)',
                    }}>
                      {linked.status}
                    </span>
                  )}
                  {linked.incorporatedOn && (
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>Inc. {linked.incorporatedOn}</span>
                  )}
                </div>
                {linked.sicCodes && (
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>SIC: {linked.sicCodes}</div>
                )}
              </div>
              <a
                href={`https://find-and-update.company-information.service.gov.uk/company/${linked.number}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--brass)', textDecoration: 'none', flexShrink: 0 }}
              >
                View on CH →
              </a>
            </div>
          </div>
          <button type="button" onClick={onUnlink} style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
            Unlink company
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              className="ban-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder="Search company name or number…"
              style={{ flex: 1 }}
            />
            <button type="button" className="ban-btn ban-btn-ghost ban-focus" onClick={search} disabled={pending || !query.trim()}>
              {pending ? '…' : 'Search'}
            </button>
          </div>

          {searchError && (
            <div style={{ fontSize: 12, color: 'var(--rust)', marginBottom: 10 }}>{searchError}</div>
          )}

          {results.length > 0 && (
            <div style={{ border: '1px solid var(--line)', borderRadius: 3, overflow: 'hidden' }}>
              {results.map((r, i) => {
                const addr = r.registered_office_address
                const location = addr?.locality || addr?.address_line_1 || addr?.postal_code || ''
                return (
                  <button
                    key={r.company_number}
                    type="button"
                    onClick={() => pick(r)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 14px', background: 'none', border: 'none',
                      borderBottom: i < results.length - 1 ? '1px solid var(--line)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 13, color: 'var(--ink)', marginBottom: 3 }}>{r.title}</div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>{r.company_number}</span>
                      {r.company_status && (
                        <span style={{
                          fontFamily: 'var(--mono)', fontSize: 9, padding: '1px 5px', borderRadius: 2,
                          textTransform: 'uppercase',
                          background: r.company_status === 'active' ? 'var(--teal-soft)' : 'var(--paper-2)',
                          color: r.company_status === 'active' ? 'var(--teal)' : 'var(--muted)',
                        }}>
                          {r.company_status}
                        </span>
                      )}
                      {location && <span style={{ fontSize: 11, color: 'var(--muted)' }}>{location}</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
