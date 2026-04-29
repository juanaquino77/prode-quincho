import { cn } from '../../lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  glow?: boolean
}

export function Card({ children, glow, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-union-navy-light border border-union-blue/20 rounded-xl p-4',
        glow && 'shadow-[0_0_20px_rgba(0,168,222,0.15)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
