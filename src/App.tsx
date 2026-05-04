import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthInit, useIsAdmin } from './hooks/useAuth'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Predictions from './pages/Predictions'
import Tournaments from './pages/Tournaments'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/Admin'
import Profile from './pages/Profile'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 } },
})

function AppRoutes() {
  useAuthInit()
  const { user, loading } = useAuthStore()
  const isAdmin = useIsAdmin()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-navy flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-union-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/predicciones" element={<Predictions />} />
      <Route path="/torneos" element={<Tournaments />} />
      <Route path="/tabla" element={<Leaderboard />} />
      {isAdmin && <Route path="/admin" element={<Admin />} />}
      <Route path="/perfil" element={<Profile />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
