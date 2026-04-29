import { cn } from '../../lib/utils'
import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'gray'
  className?: string
}

export function Badge({ children, variant = 'blue', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
        {
          'bg-union-blue/20 text-union-blue-light': variant === 'blue',
          'bg-green-500/20 text-green-400': variant === 'green',
          'bg-yellow-500/20 text-yellow-400': variant === 'yellow',
          'bg-red-500/20 text-red-400': variant === 'red',
          'bg-white/10 text-white/60': variant === 'gray',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
