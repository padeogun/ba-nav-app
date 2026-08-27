'use client'

interface LikertRowProps {
  text: string
  hint?: string
  value: number
  onChange: (v: number) => void
  labels?: string[]
}

export default function LikertRow({ text, hint, value, onChange, labels = ['1', '2', '3', '4', '5'] }: LikertRowProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13.5, color: 'var(--ink)', marginBottom: hint ? 3 : 7, lineHeight: 1.45 }}>{text}</div>
      {hint && <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 7, lineHeight: 1.5 }}>{hint}</div>}
      <div style={{ display: 'flex' }}>
        {labels.map((l, i) => (
          <button
            key={i}
            className={`ban-likert-btn${value === i + 1 ? ' selected' : ''}`}
            onClick={() => onChange(i + 1)}
            type="button"
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}
