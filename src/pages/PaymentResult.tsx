import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useQueryClient } from '@tanstack/react-query'

type ResultType = 'success' | 'failure' | 'pending'

const RESULT_CONFIG: Record<ResultType, {
  icon: React.ReactNode
  title: string
  message: string
  color: string
}> = {
  success: {
    icon: <CheckCircle size={56} className="text-green-400" />,
    title: '¡Pago confirmado!',
    message: 'Tu pago fue aprobado. Ya podés cargar tus pronósticos.',
    color: 'text-green-400',
  },
  failure: {
    icon: <XCircle size={56} className="text-red-400" />,
    title: 'Pago rechazado',
    message: 'Hubo un problema con tu pago. Podés intentarlo de nuevo.',
    color: 'text-red-400',
  },
  pending: {
    icon: <Clock size={56} className="text-yellow-400" />,
    title: 'Pago en proceso',
    message: 'Tu pago está siendo procesado. Te avisaremos cuando se confirme.',
    color: 'text-yellow-400',
  },
}

export default function PaymentResult({ type }: { type: ResultType }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const qc = useQueryClient()
  const config = RESULT_CONFIG[type]

  useEffect(() => {
    // Refrescar datos de torneos y pagos al volver de MP
    qc.invalidateQueries({ queryKey: ['user-tournaments'] })
    qc.invalidateQueries({ queryKey: ['payment'] })
  }, [qc])

  const externalRef = searchParams.get('external_reference')
  const tournamentId = externalRef?.split(':')?.[0]

  return (
    <div className="min-h-screen bg-gradient-navy flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-union-navy-light border border-union-blue/20 rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-4">{config.icon}</div>
        <h1 className={`text-2xl font-bold mb-2 ${config.color}`}>{config.title}</h1>
        <p className="text-white/60 mb-8">{config.message}</p>

        <div className="flex flex-col gap-3">
          {type === 'success' && tournamentId ? (
            <Button onClick={() => navigate(`/predicciones?t=${tournamentId}`)}>
              Ir a mis pronósticos
            </Button>
          ) : type === 'failure' ? (
            <Button onClick={() => navigate('/torneos')}>
              Reintentar pago
            </Button>
          ) : null}
          <Button variant="secondary" onClick={() => navigate('/torneos')}>
            Volver a torneos
          </Button>
        </div>
      </div>
    </div>
  )
}
