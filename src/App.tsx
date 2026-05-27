import { useState } from 'react'
import { LoginPage } from '@/components/auth/LoginPage'
import { MainLayout } from '@/components/layout/MainLayout'
import { Sidebar } from '@/components/layout/Sidebar'
import { FileList } from '@/components/file-browser/FileList'
import { useAuth } from '@/hooks/useAuth'
import { useFolders } from '@/hooks/useFolders'

export default function App() {
  const { isAuthenticated, isLoading, error, login, logout } = useAuth()
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const { folders, create: createFolder } = useFolders(null)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} error={error} isLoading={isLoading} />
  }

  return (
    <MainLayout onLogout={logout}>
      <Sidebar
        currentFolderId={currentFolderId}
        onNavigate={setCurrentFolderId}
        onCreateFolder={createFolder}
        folders={folders}
      />
      <FileList
        currentFolderId={currentFolderId}
        onNavigate={setCurrentFolderId}
      />
    </MainLayout>
  )
}
