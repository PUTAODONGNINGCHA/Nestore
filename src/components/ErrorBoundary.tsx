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
        <div className="min-h-screen bg-[#E0E5EC] dark:bg-[#1a1d23] flex items-center justify-center p-8">
          <div className="w-full max-w-md bg-[#E0E5EC] dark:bg-[#1a1d23] rounded-[32px] shadow-[9px_9px_16px_rgb(163_177_198_/_0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[9px_9px_16px_rgb(0_0_0_/_0.4),-9px_-9px_16px_rgba(255,255,255,0.05)] p-8 text-center">
            <h2 className="text-lg font-bold text-red-500 dark:text-red-400 mb-2 font-display">页面加载出错</h2>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-6 font-mono break-all">
              {this.state.error.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-[16px] bg-[#6C63FF] text-white text-sm font-medium shadow-[9px_9px_16px_rgb(163_177_198_/_0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] hover:shadow-[12px_12px_20px_rgb(163_177_198_/_0.7),-12px_-12px_20px_rgba(255,255,255,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
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
