import { type ReactNode } from 'react'
import { LogOut, Cloud } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface MainLayoutProps {
  children: ReactNode
  onLogout: () => void
}

export function MainLayout({ children, onLogout }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 lg:px-6">
        <div className="h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Cloud className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-lg hidden sm:inline">家庭云盘</span>
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
