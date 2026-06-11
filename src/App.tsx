import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useAuthInit, useIsAdmin, useIsOrganizer } from './hooks/useAuth'
import { useMatchesRealtime } from './hooks/useMatches'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Predictions from './pages/Predictions'
import Tournaments from './pages/Tournaments'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import Bracket from './pages/Bracket'
import PaymentResult from './pages/PaymentResult'
import JoinPage from './pages/JoinPage'
import { InactiveAccountModal } from './components/InactiveAccountModal'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 } },
})

function AppRoutes() {
  useAuthInit()
  useMatchesRealtime()
  const { user, loading } = useAuthStore()
  const isAdmin = useIsAdmin()
  const isOrganizer = useIsOrganizer()

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unirse/:inviteCode" element={<JoinPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <>
      <InactiveAccountModal />
      <Routes>
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unirse/:inviteCode" element={<JoinPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/predicciones" element={<Predictions />} />
      <Route path="/torneos" element={<Tournaments />} />
      <Route path="/tabla" element={<Leaderboard />} />
      <Route path="/bracket" element={<Bracket />} />
      <Route path="/payment/success" element={<PaymentResult type="success" />} />
      <Route path="/payment/failure" element={<PaymentResult type="failure" />} />
      <Route path="/payment/pending" element={<PaymentResult type="pending" />} />
      {(isAdmin || isOrganizer) && <Route path="/admin" element={<Admin />} />}
      <Route path="/perfil" element={<Profile />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
