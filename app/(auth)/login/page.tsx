'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <div
      className="ban-fade-in"
      style={{
        background: 'var(--white)',
        border: '1px solid var(--line)',
        borderRadius: '3px',
        padding: '40px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            color: 'var(--brass)',
            marginBottom: '8px',
          }}
        >
          Business Acquisition Navigator
        </p>
        <h1
          style={{
            fontFamily: 'var(--serif)',
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--ink)',
            lineHeight: 1.2,
          }}
        >
          Sign in to your account
        </h1>
      </div>

      {state?.message && (
        <div
          style={{
            background: 'var(--rust-soft)',
            border: '1px solid var(--rust)',
            borderRadius: '2px',
            padding: '10px 14px',
            marginBottom: '20px',
            fontSize: '13.5px',
            color: 'var(--rust)',
          }}
        >
          {state.message}
        </div>
      )}

      <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label
            htmlFor="email"
            style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="ban-input"
          />
          {state?.errors?.email && (
            <p style={{ color: 'var(--rust)', fontSize: '12px', marginTop: '4px' }}>
              {state.errors.email[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="ban-input"
          />
          {state?.errors?.password && (
            <p style={{ color: 'var(--rust)', fontSize: '12px', marginTop: '4px' }}>
              {state.errors.password[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          style={{
            width: '100%',
            background: pending ? 'var(--ink-soft)' : 'var(--ink)',
            color: 'var(--white)',
            padding: '11px 20px',
            borderRadius: '2px',
            fontWeight: 600,
            fontSize: '13.5px',
            border: 'none',
            cursor: pending ? 'not-allowed' : 'pointer',
            marginTop: '4px',
            fontFamily: 'var(--sans)',
            letterSpacing: '.01em',
          }}
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p
        style={{
          marginTop: '24px',
          fontSize: '13px',
          color: 'var(--muted)',
          textAlign: 'center',
        }}
      >
        No account yet?{' '}
        <Link href="/signup" style={{ color: 'var(--brass)', fontWeight: 600 }}>
          Create one
        </Link>
      </p>
    </div>
  )
}
