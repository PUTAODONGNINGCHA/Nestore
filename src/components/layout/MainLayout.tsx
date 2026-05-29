import { type ReactNode } from 'react'
import { LogOut } from 'lucide-react'

interface MainLayoutProps {
  children: ReactNode
  onLogout: () => void
  headerRight?: ReactNode
}

export function MainLayout({ children, onLogout, headerRight }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F4F1FA] flex flex-col">
      {/* Animated background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute h-[40vh] w-[40vh] rounded-full bg-[#8B5CF6]/8 blur-3xl -top-[10%] -left-[10%] animate-[clay-float_8s_ease-in-out_infinite] will-change-transform" />
        <div className="absolute h-[35vh] w-[35vh] rounded-full bg-[#EC4899]/8 blur-3xl -right-[10%] top-[20%] animate-[clay-float-delayed_10s_ease-in-out_infinite] will-change-transform" />
        <div className="absolute h-[30vh] w-[30vh] rounded-full bg-[#0EA5E9]/8 blur-3xl bottom-[10%] left-[30%] animate-[clay-float-slow_12s_ease-in-out_infinite] hidden lg:block will-change-transform" />
      </div>

      <header className="bg-white px-4 lg:px-6 sticky top-0 z-40 shadow-[0_2px_12px_rgba(160,150,180,0.08)]">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo icon well with gradient */}
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] flex items-center justify-center shadow-[4px_4px_12px_rgba(139,92,246,0.3)]">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <span className="font-extrabold text-lg text-[#332F3A] font-display tracking-tight">个人云盘</span>
          </div>
          <div className="flex items-center gap-2">
            {headerRight}
            <button
              onClick={onLogout}
              className="w-10 h-10 flex items-center justify-center rounded-[20px] bg-white text-[#635F69] shadow-[8px_8px_16px_rgba(160,150,180,0.15),-4px_-4px_12px_rgba(255,255,255,0.8)] hover:-translate-y-0.5 hover:shadow-[12px_12px_24px_rgba(160,150,180,0.2),-6px_-6px_16px_rgba(255,255,255,0.9)] active:scale-[0.92] active:shadow-[inset_6px_6px_12px_#d9d4e3,inset_-6px_-6px_12px_#ffffff] transition-transform duration-150 cursor-pointer"
              title="退出"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        {children}
      </div>
    </div>
  )
}
