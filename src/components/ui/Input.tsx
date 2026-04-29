import { cn } from '../../lib/utils'
import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-union-blue-light">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-union-blue/60">{icon}</span>}
        <input
          className={cn(
            'w-full bg-union-navy-light border border-union-blue/20 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-union-blue focus:border-transparent transition-all',
            icon ? 'pl-10 pr-4 py-2.5' : 'px-4 py-2.5',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
