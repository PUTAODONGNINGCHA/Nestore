import { useState, useCallback } from 'react'
import { FolderPlus } from 'lucide-react'
import { LoginPage } from '@/components/auth/LoginPage'
import { MainLayout } from '@/components/layout/MainLayout'
import { FileList } from '@/components/file-browser/FileList'
import { useAuth } from '@/hooks/useAuth'
import { useFolders } from '@/hooks/useFolders'

export default function App() {
  const { isAuthenticated, isLoading, error, login, logout } = useAuth()
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const { folders, refresh: refreshFolders, create: createFolder, rename: renameFolder, remove: removeFolder } = useFolders(currentFolderId)
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const handleCreateFolder = useCallback(async () => {
    const name = newFolderName.trim()
    if (!name) return
    if (folders.some((f) => f.name === name)) {
      alert('已存在同名文件夹')
      return
    }
    await createFolder(name)
    setNewFolderName('')
    setShowNewFolderInput(false)
    refreshFolders()
  }, [newFolderName, createFolder, refreshFolders, folders])

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
    <MainLayout
      onLogout={logout}
      headerRight={
        <div className="flex items-center gap-2">
          {/* New folder button */}
          <div className="relative">
            <button
              onClick={() => setShowNewFolderInput(!showNewFolderInput)}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#E0E5EC] dark:bg-[#1a1d23] text-[#3D4852] dark:text-[#E8ECF1] shadow-[9px_9px_16px_rgb(163_177_198_/_0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[9px_9px_16px_rgb(0_0_0_/_0.4),-9px_-9px_16px_rgba(255,255,255,0.05)] hover:shadow-[inset_4px_4px_8px_rgb(163_177_198_/_0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] dark:hover:shadow-[inset_4px_4px_8px_rgb(0_0_0_/_0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] active:shadow-[inset_6px_6px_10px_rgb(163_177_198_/_0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] dark:active:shadow-[inset_6px_6px_10px_rgb(0_0_0_/_0.4),inset_-6px_-6px_10px_rgba(255,255,255,0.05)] transition-all duration-200"
              title="新建文件夹"
            >
              <FolderPlus className="w-5 h-5" />
            </button>
            {showNewFolderInput && (
              <div className="absolute right-0 top-full mt-2 z-20">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="文件夹名称"
                  className="px-4 py-2.5 text-sm rounded-[16px] bg-[#E0E5EC] dark:bg-[#1a1d23] text-[#3D4852] dark:text-[#E8ECF1] placeholder-[#A0AEC0] dark:placeholder-[#6B7280] shadow-[inset_4px_4px_8px_rgb(163_177_198_/_0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] dark:shadow-[inset_4px_4px_8px_rgb(0_0_0_/_0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:ring-offset-2 focus:ring-offset-[#E0E5EC] dark:focus:ring-offset-[#1a1d23] w-48 transition-all duration-200"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateFolder()
                    if (e.key === 'Escape') setShowNewFolderInput(false)
                  }}
                  onBlur={() => setTimeout(() => setShowNewFolderInput(false), 200)}
                />
              </div>
            )}
          </div>
        </div>
      }
    >
      <FileList
        currentFolderId={currentFolderId}
        onNavigate={setCurrentFolderId}
        folders={folders}
        onRenameFolder={renameFolder}
        onRemoveFolder={removeFolder}
        onRefreshFolders={refreshFolders}
      />
    </MainLayout>
  )
}
