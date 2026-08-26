'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

interface ModuleNavProps {
  prevHref?: string
  nextHref?: string
  onSave: (completed: boolean) => Promise<{ error: string | null }>
  canComplete?: boolean
}

export default function ModuleNav({ prevHref, nextHref, onSave, canComplete = true }: ModuleNavProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      await onSave(false)
    })
  }

  const handleNext = () => {
    startTransition(async () => {
      const result = await onSave(true)
      if (!result.error && nextHref) router.push(nextHref)
    })
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
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
  )
}
