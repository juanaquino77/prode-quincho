import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Trophy, Menu, X, LogOut, User, Shield, BarChart3, Calendar, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { useIsAdmin } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Inicio', icon: BarChart3 },
  { to: '/predicciones', label: 'Predicciones', icon: Calendar },
  { to: '/torneos', label: 'Torneos', icon: Trophy },
  { to: '/tabla', label: 'Tabla', icon: Users },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, profile } = useAuthStore()
  const isAdmin = useIsAdmin()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <header className="bg-union-navy border-b border-union-blue/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-blue rounded-full flex items-center justify-center">
              <Trophy size={18} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg hidden sm:block">Prode Quincho</span>
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

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-union-blue/20 bg-union-navy px-4 py-3 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
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
            <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5">
              <Shield size={16} />Admin
            </Link>
          )}
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
