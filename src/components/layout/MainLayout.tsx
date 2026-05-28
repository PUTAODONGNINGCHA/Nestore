import { type ReactNode } from 'react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface MainLayoutProps {
  children: ReactNode
  onLogout: () => void
}

export function MainLayout({ children, onLogout }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[#E0E5EC] dark:bg-[#1a1d23] flex flex-col">
      <header className="bg-[#E0E5EC] dark:bg-[#1a1d23] px-4 lg:px-6 sticky top-0 z-40">
        <div className="h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[#3D4852] dark:text-[#E8ECF1]">
              {/* Neumorphic logo icon well */}
              <div className="w-8 h-8 rounded-xl bg-[#E0E5EC] dark:bg-[#1a1d23] shadow-[inset_4px_4px_8px_rgb(163_177_198_/_0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] dark:shadow-[inset_4px_4px_8px_rgb(0_0_0_/_0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] flex items-center justify-center">
                <svg className="w-4 h-4 text-[#6C63FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <span className="font-bold text-lg hidden sm:inline font-display tracking-tight">个人云盘</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">退出</span>
          </Button>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        {children}
      </div>
    </div>
  )
}
