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
    <Modal isOpen={isOpen} onClose={onClose} title="移动到">
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="clay-spinner" />
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-thin">
            <button
              className={`w-full text-left px-3 py-2.5 rounded-[16px] text-sm transition-all duration-200 ${
                selectedFolderId === null
                  ? 'bg-[#E0E5EC] dark:bg-[#1a1d23] text-[#6C63FF] shadow-[inset_4px_4px_8px_rgb(163_177_198_/_0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] dark:shadow-[inset_4px_4px_8px_rgb(0_0_0_/_0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.05)]'
                  : 'text-[#3D4852] dark:text-[#E8ECF1] hover:shadow-[inset_3px_3px_6px_rgb(163_177_198_/_0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] dark:hover:shadow-[inset_3px_3px_6px_rgb(0_0_0_/_0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.05)]'
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
                className={`w-full text-left px-3 py-2.5 rounded-[16px] text-sm transition-all duration-200 ${
                  selectedFolderId === folder.id
                    ? 'bg-[#E0E5EC] dark:bg-[#1a1d23] text-[#6C63FF] shadow-[inset_4px_4px_8px_rgb(163_177_198_/_0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] dark:shadow-[inset_4px_4px_8px_rgb(0_0_0_/_0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.05)]'
                    : 'text-[#3D4852] dark:text-[#E8ECF1] hover:shadow-[inset_3px_3px_6px_rgb(163_177_198_/_0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] dark:hover:shadow-[inset_3px_3px_6px_rgb(0_0_0_/_0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.05)]'
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
