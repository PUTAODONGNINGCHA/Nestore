import { useState, useEffect, useRef } from 'react'
import { Search, File, Folder } from 'lucide-react'
import { getStorageAdapter } from '@/storage/factory'
import type { FileItem, Folder as FolderType } from '@/types'

interface SearchDialogProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (folderId: string | null) => void
}

type Result = { type: 'folder'; data: FolderType; parentName: string } | { type: 'file'; data: FileItem; parentName: string }

export function SearchDialog({ isOpen, onClose, onNavigate }: SearchDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [allFolders, setAllFolders] = useState<FolderType[]>([])
  const [allFiles, setAllFiles] = useState<FileItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Load all data once when dialog opens
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      Promise.all([
        getStorageAdapter().getAllFolders(),
        getStorageAdapter().getAllFiles(),
      ]).then(([folders, files]) => {
        setAllFolders(folders)
        setAllFiles(files)
      }).catch(() => {})
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Filter results based on query
  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const q = query.toLowerCase()
    setIsSearching(true)

    const folderMap = new Map(allFolders.map((f) => [f.id, f.name]))

    const matched: Result[] = [
      ...allFolders
        .filter((f) => f.name.toLowerCase().includes(q))
        .map((f) => ({
          type: 'folder' as const,
          data: f,
          parentName: f.parent_id ? folderMap.get(f.parent_id) || '...' : '全部文件',
        })),
      ...allFiles
        .filter((f) => f.name.toLowerCase().includes(q))
        .map((f) => ({
          type: 'file' as const,
          data: f,
          parentName: f.folder_id ? folderMap.get(f.folder_id) || '...' : '全部文件',
        })),
    ]
    setResults(matched.slice(0, 50))
    setIsSearching(false)
  }, [query, allFolders, allFiles])

  const handleSelect = (result: Result) => {
    onClose()
    if (result.type === 'folder') {
      // Navigate to the folder's parent to show it in context
      onNavigate(result.data.parent_id)
    } else {
      // Navigate to the file's folder to show it in context
      onNavigate(result.data.folder_id)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-[32px] shadow-[16px_16px_32px_rgba(160,150,180,0.25),-10px_-10px_24px_rgba(255,255,255,0.9)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F0EDF7]">
          <Search className="w-5 h-5 text-[#635F69] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文件或文件夹..."
            className="flex-1 text-base text-[#332F3A] placeholder-[#635F69]/50 bg-transparent focus:outline-none"
          />
          <button onClick={onClose} className="text-sm text-[#635F69] hover:text-[#7C3AED] font-bold">取消</button>
        </div>
        <div className="max-h-72 overflow-y-auto scrollbar-thin">
          {results.length === 0 && query.trim() && !isSearching && (
            <p className="text-center py-8 text-sm text-[#635F69]">未找到匹配的结果</p>
          )}
          {results.map((r) => (
            <button
              key={`${r.type}-${r.data.id}`}
              className="w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-[#7C3AED]/5 transition-colors duration-150 cursor-pointer"
              onClick={() => handleSelect(r)}
            >
              <div className="w-9 h-9 rounded-[16px] bg-gradient-to-br from-[#F0EDF7] to-[#F4F1FA] shadow-[inset_3px_3px_6px_#d9d4e3,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center shrink-0">
                {r.type === 'folder'
                  ? <Folder className="w-4 h-4 text-[#10B981]" />
                  : <File className="w-4 h-4 text-[#7C3AED]" />
                }
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#332F3A] truncate">{r.data.name}</p>
                <p className="text-xs text-[#635F69]">{r.parentName}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
