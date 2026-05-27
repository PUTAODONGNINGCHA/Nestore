import { useState } from 'react'
import { FolderPlus, Upload } from 'lucide-react'
import { FileItemRow } from './FileItem'
import { Breadcrumb } from './Breadcrumb'
import { EmptyState } from './EmptyState'
import { MoveFileDialog } from './MoveFileDialog'
import { Button } from '@/components/ui/Button'
import { useFiles } from '@/hooks/useFiles'
import { useFolders } from '@/hooks/useFolders'
import { useUpload } from '@/hooks/useUpload'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { FileUploader } from '@/components/upload/FileUploader'
import { FilePreview } from '@/components/preview/FilePreview'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { getStorageAdapter } from '@/storage/factory'
import type { FileItem } from '@/types'

interface FileListProps {
  currentFolderId: string | null
  onNavigate: (folderId: string | null) => void
}

export function FileList({ currentFolderId, onNavigate }: FileListProps) {
  const { folders, isLoading: foldersLoading, refresh: refreshFolders, create: createFolder, rename: renameFolder, remove: removeFolder } = useFolders(currentFolderId)
  const { files, isLoading: filesLoading, refresh: refreshFiles, rename: renameFile, remove: removeFile } = useFiles(currentFolderId)
  const { crumbs } = useBreadcrumbs(currentFolderId)
  const { isUploading, uploadMultiple } = useUpload(currentFolderId, () => { refreshFiles(); refreshFolders() })
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [moveFile, setMoveFile] = useState<FileItem | null>(null)
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const isLoading = foldersLoading || filesLoading
  const allItems = [
    ...folders.map((f) => ({ type: 'folder' as const, data: f })),
    ...files.map((f) => ({ type: 'file' as const, data: f })),
  ].sort((a, b) => a.data.name.localeCompare(b.data.name))

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    await createFolder(newFolderName.trim())
    setNewFolderName('')
    setShowNewFolderInput(false)
  }

  const handleDelete = async (id: string, type: 'file' | 'folder') => {
    if (!confirm('确定要删除吗？此操作不可恢复。')) return
    if (type === 'folder') {
      await removeFolder(id)
    } else {
      await removeFile(id)
    }
  }

  const handleDownload = async (file: FileItem) => {
    try {
      const url = await getStorageAdapter().getDownloadUrl(file.storage_path)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      a.click()
    } catch {
      alert('下载失败')
    }
  }

  const handleMove = async (targetFolderId: string | null) => {
    if (!moveFile) return
    await getStorageAdapter().moveFile(moveFile.id, targetFolderId)
    setMoveFile(null)
    refreshFiles()
  }

  const handleDrop = async (acceptedFiles: File[]) => {
    await uploadMultiple(acceptedFiles)
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-3 sm:px-4 lg:px-6 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1 overflow-x-auto">
            <Breadcrumb crumbs={crumbs} onNavigate={onNavigate} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowNewFolderInput(!showNewFolderInput)}
              >
                <FolderPlus className="w-4 h-4" />
                <span className="hidden sm:inline">新建文件夹</span>
              </Button>
              {showNewFolderInput && (
                <div className="absolute right-0 top-full mt-2 z-20">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="文件夹名称"
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-lg w-48"
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
        </div>
      </div>

      {/* Upload zone & progress */}
      <div className="px-3 sm:px-4 lg:px-6 pt-3">
        <FileUploader onDrop={handleDrop} isUploading={isUploading} />
      </div>

      {/* Upload button for mobile */}
      <div className="px-3 sm:px-4 lg:px-6 pt-2 sm:hidden">
        <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors cursor-pointer">
          <Upload className="w-5 h-5" />
          <span className="text-sm font-medium">选择文件上传</span>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              if (files.length > 0) handleDrop(files)
              e.target.value = ''
            }}
          />
        </label>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : allItems.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
            {allItems.map((item) => (
              <FileItemRow
                key={item.type === 'folder' ? `f-${item.data.id}` : `file-${item.data.id}`}
                item={item.data}
                type={item.type}
                onNavigate={(id) => onNavigate(id)}
                onPreview={(file) => setPreviewFile(file)}
                onDownload={handleDownload}
                onMove={(file) => setMoveFile(file)}
                onRename={(id, name) => {
                  if (item.type === 'folder') renameFolder(id, name)
                  else renameFile(id, name)
                }}
                onDelete={(id) => handleDelete(id, item.type)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload progress (visible during upload) */}
      {isUploading && (
        <div className="px-3 sm:px-4 lg:px-6 pb-3">
          <ProgressBar progress={50} />
          <p className="text-xs text-gray-400 mt-1">正在上传...</p>
        </div>
      )}

      {/* Preview modal */}
      {previewFile && (
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      )}

      {/* Move dialog */}
      {moveFile && (
        <MoveFileDialog
          isOpen={!!moveFile}
          onClose={() => setMoveFile(null)}
          onMove={handleMove}
        />
      )}
    </div>
  )
}
