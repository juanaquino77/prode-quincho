import type { ReactNode } from 'react'
import { Header } from './Header'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-navy">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
    </div>
  )
}
