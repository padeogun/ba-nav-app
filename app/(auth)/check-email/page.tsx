import Link from 'next/link'

export default function CheckEmailPage() {
  return (
    <div
      className="ban-fade-in"
      style={{
        background: 'var(--white)',
        border: '1px solid var(--line)',
        borderRadius: '3px',
        padding: '40px',
        textAlign: 'center',
      }}
    >
      <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--brass)', marginBottom: '16px' }}>
        Almost there
      </p>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontWeight: 700, color: 'var(--ink)', marginBottom: '12px' }}>
        Check your email
      </h1>
      <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: '340px', margin: '0 auto 24px' }}>
        We&apos;ve sent a confirmation link to your email address. Click it to activate your account and sign in.
      </p>
      <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
        Already confirmed?{' '}
        <Link href="/login" style={{ color: 'var(--brass)', fontWeight: 600 }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}
