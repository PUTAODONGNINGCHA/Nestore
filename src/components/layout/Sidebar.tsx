import { useState, type FormEvent } from 'react'
import { FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Folder } from '@/types'

interface SidebarProps {
  currentFolderId: string | null
  onNavigate: (folderId: string | null) => void
  onCreateFolder: (name: string) => Promise<{ id: string } | void>
  folders: Folder[]
}

export function Sidebar({ currentFolderId, onNavigate, onCreateFolder, folders }: SidebarProps) {
  const [showInput, setShowInput] = useState(false)
  const [folderName, setFolderName] = useState('')

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!folderName.trim()) return
    await onCreateFolder(folderName.trim())
    setFolderName('')
    setShowInput(false)
  }

  return (
    <aside className="w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col hidden md:flex">
      <div className="p-3 border-b border-gray-100 dark:border-gray-800">
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => setShowInput(!showInput)}
        >
          <FolderPlus className="w-4 h-4" />
          新建文件夹
        </Button>
        {showInput && (
          <form onSubmit={handleCreate} className="mt-2">
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="文件夹名称"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onBlur={() => { setTimeout(() => setShowInput(false), 200) }}
            />
          </form>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <button
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
            currentFolderId === null
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
          onClick={() => onNavigate(null)}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" opacity={0.7}>
              <path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
            全部文件
          </div>
        </button>
        {folders.map((folder) => (
          <button
            key={folder.id}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
              currentFolderId === folder.id
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
            onClick={() => onNavigate(folder.id)}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" opacity={0.7}>
              <path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
            <span className="truncate">{folder.name}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
