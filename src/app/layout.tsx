import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DECIPHER — Decode Your Day',
  description: 'A gamified productivity app. Earn gems, build streaks, unlock themes.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
