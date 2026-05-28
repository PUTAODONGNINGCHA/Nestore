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
    <div className="min-h-screen bg-[#E0E5EC] dark:bg-[#1a1d23] flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#E0E5EC] dark:bg-[#1a1d23] shadow-[20px_20px_40px_rgb(163_177_198_/_0.6),-20px_-20px_40px_rgba(255,255,255,0.5)] dark:shadow-[20px_20px_40px_rgb(0_0_0_/_0.4),-20px_-20px_40px_rgba(255,255,255,0.05)]" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-[#E0E5EC] dark:bg-[#1a1d23] shadow-[inset_15px_15px_30px_rgb(163_177_198_/_0.6),inset_-15px_-15px_30px_rgba(255,255,255,0.5)] dark:shadow-[inset_15px_15px_30px_rgb(0_0_0_/_0.4),inset_-15px_-15px_30px_rgba(255,255,255,0.05)]" />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          {/* Icon well — inset deep */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[32px] bg-[#E0E5EC] dark:bg-[#1a1d23] shadow-[inset_10px_10px_20px_rgb(163_177_198_/_0.7),inset_-10px_-10px_20px_rgba(255,255,255,0.6)] dark:shadow-[inset_10px_10px_20px_rgb(0_0_0_/_0.5),inset_-10px_-10px_20px_rgba(255,255,255,0.05)] mb-6">
            {/* Extruded inner circle */}
            <div className="w-12 h-12 rounded-full bg-[#E0E5EC] dark:bg-[#1a1d23] shadow-[5px_5px_10px_rgb(163_177_198_/_0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] dark:shadow-[5px_5px_10px_rgb(0_0_0_/_0.4),-5px_-5px_10px_rgba(255,255,255,0.05)] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#6C63FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-[#3D4852] dark:text-[#E8ECF1] font-display tracking-tight">家庭云盘</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-2 text-sm">输入密码进入共享空间</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#E0E5EC] dark:bg-[#1a1d23] rounded-[32px] shadow-[9px_9px_16px_rgb(163_177_198_/_0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[9px_9px_16px_rgb(0_0_0_/_0.4),-9px_-9px_16px_rgba(255,255,255,0.05)] p-8 space-y-5">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入共享密码"
              autoFocus
              className="w-full px-5 py-3.5 rounded-[16px] bg-[#E0E5EC] dark:bg-[#1a1d23] text-[#3D4852] dark:text-[#E8ECF1] placeholder-[#A0AEC0] dark:placeholder-[#6B7280] shadow-[inset_6px_6px_10px_rgb(163_177_198_/_0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] dark:shadow-[inset_6px_6px_10px_rgb(0_0_0_/_0.4),inset_-6px_-6px_10px_rgba(255,255,255,0.05)] focus:outline-none focus:shadow-[inset_10px_10px_20px_rgb(163_177_198_/_0.7),inset_-10px_-10px_20px_rgba(255,255,255,0.6)] dark:focus:shadow-[inset_10px_10px_20px_rgb(0_0_0_/_0.5),inset_-10px_-10px_20px_rgba(255,255,255,0.05)] focus:ring-2 focus:ring-[#6C63FF] focus:ring-offset-2 focus:ring-offset-[#E0E5EC] dark:focus:ring-offset-[#1a1d23] transition-all duration-300"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 text-center font-medium">{error}</p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isLoading || !password.trim()}>
            {isLoading ? '验证中...' : '进入云盘'}
          </Button>

          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] text-center">
            关闭浏览器标签页后自动退出登录
          </p>
        </form>
      </div>
    </div>
  )
}
