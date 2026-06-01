import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface ComboboxOption {
  value: string
  label: string
  flag?: string
  subtitle?: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  error?: string
}

export function Combobox({ options, value, onChange, placeholder = 'Buscar...', label, disabled, error }: ComboboxProps) {
  const [inputText, setInputText] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync if external value changes (e.g., on load)
  useEffect(() => {
    setInputText(value)
  }, [value])

  // Close on click outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        // Commit whatever is typed as free text if no option matched
        if (inputText !== value) onChange(inputText)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [inputText, value, onChange])

  const filtered = inputText
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(inputText.toLowerCase()) ||
          (o.subtitle ?? '').toLowerCase().includes(inputText.toLowerCase())
      )
    : options

  function selectOption(opt: ComboboxOption) {
    setInputText(opt.label)
    onChange(opt.value)
    setIsOpen(false)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    setInputText('')
    onChange('')
    setIsOpen(false)
  }

  return (
    <div className="flex flex-col gap-1" ref={containerRef}>
      {label && <label className="text-sm font-medium text-union-blue-light">{label}</label>}
      <div className="relative">
        <input
          type="text"
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full bg-union-navy-light border border-union-blue/20 rounded-lg text-white placeholder:text-white/30',
            'focus:outline-none focus:ring-2 focus:ring-union-blue focus:border-transparent transition-all',
            'px-4 py-2.5 pr-16 text-sm',
            error && 'border-red-500 focus:ring-red-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-white/30 hover:text-white/70 transition-colors"
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown
            size={15}
            className={cn('text-white/30 transition-transform', isOpen && 'rotate-180')}
          />
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-50 mt-1 w-full bg-union-navy border border-union-blue/20 rounded-lg shadow-xl overflow-hidden">
            <div className="max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-white/40 text-center">
                  No encontrado — se guardará como texto libre
                </div>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault() // evita blur antes del click
                      selectOption(opt)
                    }}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors',
                      'hover:bg-union-blue/20',
                      value === opt.value && 'bg-union-blue/10 text-union-blue'
                    )}
                  >
                    {opt.flag && <span className="text-base shrink-0">{opt.flag}</span>}
                    <span className="flex-1 truncate text-white">{opt.label}</span>
                    {opt.subtitle && (
                      <span className="text-xs text-white/40 shrink-0">{opt.subtitle}</span>
                    )}
                  </button>
                ))
              )}
            </div>
            {inputText && !options.some((o) => o.label.toLowerCase() === inputText.toLowerCase()) && (
              <div className="border-t border-union-blue/10 px-4 py-2.5">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    onChange(inputText)
                    setIsOpen(false)
                  }}
                  className="text-sm text-union-blue hover:text-union-blue-light transition-colors"
                >
                  ✏️ Usar &ldquo;{inputText}&rdquo; como texto libre
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
