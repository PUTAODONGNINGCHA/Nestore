import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
          <div className="max-w-md bg-white rounded-2xl shadow-sm border border-red-200 p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-2">页面加载出错</h2>
            <p className="text-sm text-gray-600 mb-4 font-mono break-all">
              {this.state.error.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              刷新页面
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
