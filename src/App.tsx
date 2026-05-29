import { useState, useCallback, useRef } from 'react'
import { FolderPlus, Upload, Search } from 'lucide-react'
import { SearchDialog } from '@/components/file-browser/SearchDialog'
import { LoginPage } from '@/components/auth/LoginPage'
import { MainLayout } from '@/components/layout/MainLayout'
import { FileList } from '@/components/file-browser/FileList'
import { useAuth } from '@/hooks/useAuth'
import { useFolders } from '@/hooks/useFolders'

export default function App() {
  const { isAuthenticated, isLoading, error, login, logout } = useAuth()
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const { folders, refresh: refreshFolders, create: createFolder, rename: renameFolder, remove: removeFolder } = useFolders(currentFolderId)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const [showSearch, setShowSearch] = useState(false)
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
        <div className="clay-spinner !w-8 !h-8 !border-[3px]" />
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
          {/* Search button */}
          <button
            onClick={() => setShowSearch(true)}
            className="w-10 h-10 flex items-center justify-center rounded-[20px] bg-white text-[#635F69] shadow-[8px_8px_16px_rgba(160,150,180,0.15),-4px_-4px_12px_rgba(255,255,255,0.8)] hover:-translate-y-0.5 hover:shadow-[12px_12px_24px_rgba(160,150,180,0.2),-6px_-6px_16px_rgba(255,255,255,0.9)] active:scale-[0.92] active:shadow-[inset_6px_6px_12px_#d9d4e3,inset_-6px_-6px_12px_#ffffff] transition-all duration-200 clay-bounce cursor-pointer"
            title="搜索"
          >
            <Search className="w-5 h-5" />
          </button>
          {/* Upload button */}
          <button
            onClick={() => uploadInputRef.current?.click()}
            className="w-10 h-10 flex items-center justify-center rounded-[20px] bg-white text-[#635F69] shadow-[8px_8px_16px_rgba(160,150,180,0.15),-4px_-4px_12px_rgba(255,255,255,0.8)] hover:-translate-y-0.5 hover:shadow-[12px_12px_24px_rgba(160,150,180,0.2),-6px_-6px_16px_rgba(255,255,255,0.9)] active:scale-[0.92] active:shadow-[inset_6px_6px_12px_#d9d4e3,inset_-6px_-6px_12px_#ffffff] transition-all duration-200 clay-bounce cursor-pointer"
            title="上传文件"
          >
            <Upload className="w-5 h-5" />
          </button>
          {/* New folder button */}
          <div className="relative">
            <button
              onClick={() => setShowNewFolderInput(!showNewFolderInput)}
              className="w-10 h-10 flex items-center justify-center rounded-[20px] bg-white text-[#635F69] shadow-[8px_8px_16px_rgba(160,150,180,0.15),-4px_-4px_12px_rgba(255,255,255,0.8)] hover:-translate-y-0.5 hover:shadow-[12px_12px_24px_rgba(160,150,180,0.2),-6px_-6px_16px_rgba(255,255,255,0.9)] active:scale-[0.92] active:shadow-[inset_6px_6px_12px_#d9d4e3,inset_-6px_-6px_12px_#ffffff] transition-all duration-200 clay-bounce cursor-pointer"
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
                  className="px-5 py-3 text-sm rounded-[20px] bg-[#EFEBF5] text-[#332F3A] placeholder-[#635F69]/50 shadow-[inset_6px_6px_12px_#d9d4e3,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#7C3AED]/20 w-48 transition-all duration-200 clay-bounce"
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
        uploadInputRef={uploadInputRef}
      />
      <SearchDialog
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onNavigate={setCurrentFolderId}
      />
    </MainLayout>
  )
}
