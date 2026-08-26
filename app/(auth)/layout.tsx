export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="ledger-lines min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--paper)' }}
    >
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  )
}
