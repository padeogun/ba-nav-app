import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Business Acquisition Navigator',
  description:
    'Structured self-assessment to help aspiring UK entrepreneurs decide what business to buy.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
