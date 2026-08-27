import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import {
  LayoutDashboard,
  ClipboardList,
  Target,
  Layers,
  LogOut,
  Compass,
  Briefcase,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, phase: 1 },
  { href: '/assessment/motivation', label: 'Motivation', icon: Compass, phase: 2 },
  { href: '/assessment/temperament', label: 'Temperament', icon: ClipboardList, phase: 2 },
  { href: '/assessment/ownership', label: 'Ownership style', icon: Layers, phase: 2 },
  { href: '/assessment/capability', label: 'Capability', icon: ClipboardList, phase: 2 },
  { href: '/assessment/financial', label: 'Financial readiness', icon: ClipboardList, phase: 2 },
  { href: '/assessment/risk', label: 'Risk tolerance', icon: ClipboardList, phase: 2 },
  { href: '/assessment/lifestyle', label: 'Lifestyle', icon: ClipboardList, phase: 2 },
  { href: '/sectors', label: 'Sector matching', icon: Layers, phase: 3 },
  { href: '/buy-box', label: 'Buy Box', icon: Target, phase: 3 },
  { href: '/pipeline', label: 'Pipeline', icon: Briefcase, phase: 3 },
]

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const displayName = user.user_metadata?.name ?? user.email ?? 'Navigator'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--paper)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '220px',
          flexShrink: 0,
          background: 'var(--paper-2)',
          borderRight: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 0',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
        className="ban-scroll ban-sidebar"
      >
        {/* Logo mark */}
        <div style={{ padding: '0 16px 20px', borderBottom: '1px solid var(--line)' }}>
          <p
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '9px',
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              color: 'var(--brass)',
            }}
          >
            Acquisition Navigator
          </p>
          <p
            style={{
              fontFamily: 'var(--serif)',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--ink)',
              marginTop: '2px',
            }}
          >
            {displayName}
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {NAV.map((item) => {
            const Icon = item.icon
            const locked = item.phase > 3
            return (
              <div key={item.href}>
                {locked ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '2px',
                      fontSize: '13px',
                      color: 'var(--line)',
                      cursor: 'not-allowed',
                      borderLeft: '2px solid transparent',
                    }}
                    title={`Available in Phase ${item.phase}`}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '2px',
                      fontSize: '13px',
                      color: 'var(--ink-soft)',
                      textDecoration: 'none',
                      borderLeft: '2px solid transparent',
                    }}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </Link>
                )}
              </div>
            )
          })}
        </nav>

        {/* Sign out */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--line)' }}>
          <form action={logout}>
            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '8px 10px',
                borderRadius: '2px',
                fontSize: '13px',
                color: 'var(--muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <LogOut size={15} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>{children}</main>
    </div>
  )
}
