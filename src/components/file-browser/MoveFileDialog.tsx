import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Folder } from 'lucide-react'
import { getStorageAdapter } from '@/storage/factory'
import type { Folder as FolderType } from '@/types'

interface MoveFileDialogProps {
  isOpen: boolean
  onClose: () => void
  onMove: (targetFolderId: string | null) => Promise<void>
}

export function MoveFileDialog({ isOpen, onClose, onMove }: MoveFileDialogProps) {
  const [folders, setFolders] = useState<FolderType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      getStorageAdapter().getAllFolders()
        .then(setFolders)
        .catch(() => {})
        .finally(() => setIsLoading(false))
      setSelectedFolderId(null)
    }
  }, [isOpen])

  const handleMove = async () => {
    await onMove(selectedFolderId)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={folders.length > 0 ? "移动到..." : "加载中..."}>
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="clay-spinner" />
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-thin">
            <button
              className={`w-full text-left px-4 py-3 rounded-[20px] text-sm font-bold transition-all duration-200 ${
                selectedFolderId === null
                  ? 'bg-[#7C3AED]/10 text-[#7C3AED]'
                  : 'text-[#635F69] hover:bg-[#7C3AED]/5 hover:text-[#7C3AED]'
              }`}
              onClick={() => setSelectedFolderId(null)}
            >
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 shrink-0" />
                根目录
              </div>
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                className={`w-full text-left px-4 py-3 rounded-[20px] text-sm font-bold transition-all duration-200 ${
                  selectedFolderId === folder.id
                    ? 'bg-[#7C3AED]/10 text-[#7C3AED]'
                    : 'text-[#635F69] hover:bg-[#7C3AED]/5 hover:text-[#7C3AED]'
                }`}
                onClick={() => setSelectedFolderId(folder.id)}
              >
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 shrink-0" />
                  {folder.name}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={handleMove} disabled={isLoading}>
            移动
          </Button>
        </div>
      </div>
    </Modal>
  )
}
