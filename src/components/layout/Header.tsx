import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Trophy, Menu, X, LogOut, User, Shield, BarChart3, Calendar, Users, HelpCircle, Sparkles, BookOpen } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { useIsAdmin } from '../../hooks/useAuth'
import { useHelpStore } from '../../store/helpStore'
import { cn } from '../../lib/utils'

// Custom tournament bracket icon (sideways elimination tree)
function BracketIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Left side: two first-round match lines */}
      <line x1="1" y1="3" x2="4" y2="3" />
      <line x1="1" y1="7" x2="4" y2="7" />
      <line x1="4" y1="3" x2="4" y2="7" />
      <line x1="4" y1="5" x2="7" y2="5" />

      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="13" x2="4" y2="13" />
      <line x1="4" y1="9" x2="4" y2="13" />
      <line x1="4" y1="11" x2="7" y2="11" />

      {/* Semi-final */}
      <line x1="7" y1="5" x2="7" y2="11" />
      <line x1="7" y1="8" x2="10" y2="8" />

      {/* Final */}
      <line x1="10" y1="8" x2="13" y2="8" />
      <circle cx="14" cy="8" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Inicio', icon: BarChart3 },
  { to: '/predicciones', label: 'Predicciones', icon: Calendar },
  { to: '/torneos', label: 'Torneos', icon: Trophy },
  { to: '/bracket', label: 'Llave', icon: BracketIcon },
  { to: '/tabla', label: 'Tabla', icon: Users },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const helpRef = useRef<HTMLDivElement>(null)
  const { user, profile } = useAuthStore()
  const isAdmin = useIsAdmin()
  const navigate = useNavigate()
  const location = useLocation()
  const { openTour, openHowToPlay } = useHelpStore()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setHelpOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-union-navy border-b border-union-blue/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="/2.png" alt="El Quincho" className="w-9 h-9 object-contain" />
            <span className="font-bold text-white text-lg hidden sm:block whitespace-nowrap">Prode Quincho</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === to
                    ? 'bg-union-blue/20 text-union-blue'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname.startsWith('/admin')
                    ? 'bg-union-blue/20 text-union-blue'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                )}
              >
                <Shield size={16} />
                Admin
              </Link>
            )}
          </nav>

          {/* User actions */}
          <div className="flex items-center gap-2">
            {/* Help button */}
            <div className="relative" ref={helpRef}>
              <button
                onClick={() => setHelpOpen(!helpOpen)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  helpOpen ? 'text-white bg-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'
                )}
                title="Ayuda"
              >
                <HelpCircle size={18} />
              </button>
              {helpOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-union-navy border border-union-blue/20 rounded-xl shadow-xl py-1 z-50">
                  <button
                    onClick={() => { openTour(); setHelpOpen(false) }}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/65 hover:text-white hover:bg-white/5 w-full transition-colors"
                  >
                    <Sparkles size={14} className="text-union-blue shrink-0" />
                    Tour de bienvenida
                  </button>
                  <button
                    onClick={() => { openHowToPlay(); setHelpOpen(false) }}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/65 hover:text-white hover:bg-white/5 w-full transition-colors"
                  >
                    <BookOpen size={14} className="text-union-blue shrink-0" />
                    Cómo jugar
                  </button>
                </div>
              )}
            </div>

            {user && (
              <>
                <Link to="/perfil" className="hidden sm:flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-full bg-union-blue/20 border border-union-blue/40 flex items-center justify-center overflow-hidden group-hover:border-union-blue transition-colors">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <User size={14} className="text-union-blue" />
                    )}
                  </div>
                  <span className="text-sm text-white/70 hidden lg:block group-hover:text-white transition-colors">
                    {profile?.username ?? user.email?.split('@')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-white/50 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                </button>
              </>
            )}
            <button
              className="md:hidden p-2 text-white/70 hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile quick nav — always visible below header on small screens */}
      <div className="md:hidden border-t border-union-blue/10 bg-union-navy/80 backdrop-blur-sm">
        <div className="flex items-center justify-around px-1 py-1.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors min-w-0',
                location.pathname === to
                  ? 'text-union-blue'
                  : 'text-white/40 active:text-white'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors min-w-0',
                location.pathname.startsWith('/admin')
                  ? 'text-union-blue'
                  : 'text-white/40 active:text-white'
              )}
            >
              <Shield size={18} />
              Admin
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu (hamburger — kept for profile & logout) */}
      {menuOpen && (
        <div className="md:hidden border-t border-union-blue/20 bg-union-navy px-4 py-3 space-y-1">
          <Link to="/perfil" onClick={() => setMenuOpen(false)} className={cn(
            'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            location.pathname === '/perfil' ? 'bg-union-blue/20 text-union-blue' : 'text-white/70 hover:text-white hover:bg-white/5'
          )}>
            <User size={16} />Mi perfil
          </Link>
        </div>
      )}
    </header>
  )
}
