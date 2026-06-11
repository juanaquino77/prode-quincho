import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-gradient-navy flex items-center justify-center p-6">
          <div className="bg-red-950/50 border border-red-500/30 rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-white font-bold text-lg mb-2">Error en la app</h2>
            <p className="text-red-300 text-sm font-mono break-all mb-4">
              {this.state.error.message}
            </p>
            <p className="text-white/40 text-xs mb-4 font-mono break-all">
              {this.state.error.stack?.split('\n').slice(0, 4).join('\n')}
            </p>
            <button
              className="text-sm text-white bg-union-blue/30 hover:bg-union-blue/50 px-4 py-2 rounded-lg"
              onClick={() => this.setState({ error: null })}
            >
              Reintentar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
