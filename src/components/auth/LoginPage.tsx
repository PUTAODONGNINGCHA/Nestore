import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'

interface LoginPageProps {
  onLogin: (password: string) => Promise<void>
  error: string | null
  isLoading: boolean
}

export function LoginPage({ onLogin, error, isLoading }: LoginPageProps) {
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    await onLogin(password)
  }

  return (
    <div className="min-h-screen bg-[#F4F1FA] flex items-center justify-center p-4">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute h-[40vh] w-[40vh] rounded-full bg-[#8B5CF6]/10 blur-3xl -top-[10%] -right-[10%] animate-[clay-float_8s_ease-in-out_infinite] will-change-transform" />
        <div className="absolute h-[35vh] w-[35vh] rounded-full bg-[#EC4899]/8 blur-3xl -bottom-[10%] -left-[10%] animate-[clay-float-delayed_10s_ease-in-out_infinite] will-change-transform" />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          {/* Icon — gradient clay orb */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[32px] bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] shadow-[12px_12px_24px_rgba(139,92,246,0.3),-8px_-8px_16px_rgba(255,255,255,0.4),inset_4px_4px_8px_rgba(255,255,255,0.4),inset_-4px_-4px_8px_rgba(0,0,0,0.1)] mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-[#332F3A] font-display tracking-tight">个人云盘</h1>
          <p className="text-[#635F69] mt-2 text-sm font-medium">输入密码进入共享空间</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[32px] shadow-[12px_12px_24px_rgba(160,150,180,0.15),-8px_-8px_16px_rgba(255,255,255,0.6)] p-8 space-y-5">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入共享密码"
              autoFocus
              className="w-full h-14 px-6 rounded-[20px] bg-[#EFEBF5] text-[#332F3A] placeholder-[#635F69]/50 shadow-[inset_6px_6px_12px_#d9d4e3,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#7C3AED]/20 focus:shadow-[inset_4px_4px_8px_#d9d4e3,inset_-4px_-4px_8px_#ffffff] transition-all duration-200"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center font-bold">{error}</p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isLoading || !password.trim()}>
            {isLoading ? '验证中...' : '进入云盘'}
          </Button>

          <p className="text-xs text-[#635F69] text-center font-medium">
            关闭浏览器标签页后自动退出登录
          </p>
        </form>
      </div>
    </div>
  )
}
