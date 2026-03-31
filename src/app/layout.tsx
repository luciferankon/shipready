import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'ShipReady — AI-powered PR descriptions',
  description:
    'Stop writing boring PR descriptions. Paste your git diff and get a polished PR description, commit message, or release notes in seconds.',
  openGraph: {
    title: 'ShipReady',
    description: 'AI-powered PR descriptions, commit messages, and release notes.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
