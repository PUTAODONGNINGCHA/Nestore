import { useState } from 'react'
import { LoginPage } from '@/components/auth/LoginPage'
import { MainLayout } from '@/components/layout/MainLayout'
import { FileList } from '@/components/file-browser/FileList'
import { useAuth } from '@/hooks/useAuth'

export default function App() {
  const { isAuthenticated, isLoading, error, login, logout } = useAuth()
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E0E5EC] dark:bg-[#1a1d23] flex items-center justify-center">
        <div className="neumo-spinner !w-8 !h-8 !border-[3px]" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} error={error} isLoading={isLoading} />
  }

  return (
    <MainLayout onLogout={logout}>
      <FileList
        currentFolderId={currentFolderId}
        onNavigate={setCurrentFolderId}
      />
    </MainLayout>
  )
}
