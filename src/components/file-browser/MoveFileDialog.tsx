import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { getStorageAdapter } from '@/storage/factory'
import type { Folder } from '@/types'

interface MoveFileDialogProps {
  isOpen: boolean
  onClose: () => void
  onMove: (targetFolderId: string | null) => Promise<void>
}

export function MoveFileDialog({ isOpen, onClose, onMove }: MoveFileDialogProps) {
  const [folders, setFolders] = useState<Folder[]>([])
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
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-1">
            <button
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedFolderId === null
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
              onClick={() => setSelectedFolderId(null)}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" opacity={0.7}>
                  <path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
                根目录
              </div>
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedFolderId === folder.id
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
                onClick={() => setSelectedFolderId(folder.id)}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" opacity={0.7}>
                    <path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
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
