import type { ReactNode } from 'react'
import { Header } from './Header'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-navy w-full overflow-x-hidden">
      <Header />
      <main className="w-[92%] max-w-5xl mx-auto py-6">{children}</main>
    </div>
  )
}
