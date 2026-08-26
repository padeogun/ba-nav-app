'use client'

import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'

interface ModuleNavProps {
  prevHref?: string
  nextHref?: string
  onSave: (completed: boolean) => Promise<{ error: string | null }>
  canComplete?: boolean
}

export default function ModuleNav({ prevHref, nextHref, onSave, canComplete = true }: ModuleNavProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSave = () => {
    setSaveError(null)
    startTransition(async () => {
      const result = await onSave(false)
      if (result.error) setSaveError(result.error)
    })
  }

  const handleNext = () => {
    setSaveError(null)
    startTransition(async () => {
      const result = await onSave(true)
      if (result.error) {
        setSaveError(result.error)
      } else if (nextHref) {
        router.push(nextHref)
      }
    })
  }

  return (
    <div style={{ marginTop: 28, borderTop: '1px solid var(--line)', paddingTop: 20 }}>
      {saveError && (
        <div style={{ marginBottom: 12, padding: '10px 14px', background: '#fff0f0', border: '1px solid var(--rust)', borderRadius: 3, fontSize: 12.5, color: 'var(--rust)', fontFamily: 'var(--mono)', wordBreak: 'break-all' }}>
          Save failed: {saveError}
        </div>
      )}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {prevHref && (
          <button className="ban-btn ban-btn-ghost ban-focus" type="button" onClick={() => router.push(prevHref)} disabled={pending}>
            ← Back
          </button>
        )}
        <button className="ban-btn ban-btn-ghost ban-focus" type="button" onClick={handleSave} disabled={pending} style={{ fontSize: 13 }}>
          {pending ? 'Saving…' : 'Save progress'}
        </button>
      </div>
      {nextHref && (
        <button
          className="ban-btn ban-btn-primary ban-focus"
          type="button"
          onClick={handleNext}
          disabled={pending || !canComplete}
        >
          {pending ? 'Saving…' : 'Save & continue →'}
        </button>
      )}
      {!nextHref && (
        <button
          className="ban-btn ban-btn-brass ban-focus"
          type="button"
          onClick={handleSave}
          disabled={pending}
        >
          {pending ? 'Saving…' : 'Save & finish'}
        </button>
      )}
    </div>
    </div>
  )
}
