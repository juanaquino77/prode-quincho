import type { ReactNode } from 'react'
import { Header } from './Header'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-navy w-full overflow-x-hidden">
      <Header />
      <main className="w-full max-w-7xl mx-auto px-[4%] sm:px-[5%] lg:px-[6%] py-6">{children}</main>
    </div>
  )
}
