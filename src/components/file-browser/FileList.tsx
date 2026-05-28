import { useState, useEffect, useCallback, useRef } from 'react'
import { FolderPlus } from 'lucide-react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { FileItemCard } from './FileItemGrid'
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

type Entry = { type: 'folder'; data: import('@/types').Folder } | { type: 'file'; data: FileItem }

function getSortId(entry: Entry) {
  return entry.type === 'folder' ? `folder-${entry.data.id}` : `file-${entry.data.id}`
}

export function FileList({ currentFolderId, onNavigate }: FileListProps) {
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const { folders, isLoading: foldersLoading, refresh: refreshFolders, create: createFolder, rename: renameFolder, remove: removeFolder } = useFolders(currentFolderId)
  const { files, isLoading: filesLoading, refresh: refreshFiles, rename: renameFile, remove: removeFile } = useFiles(currentFolderId)
  const { crumbs } = useBreadcrumbs(currentFolderId)
  const { isUploading, progress, error: uploadError, uploadMultiple } = useUpload(currentFolderId, () => { refreshFiles(); refreshFolders() })
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [moveFile, setMoveFile] = useState<FileItem | null>(null)
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [orderedItems, setOrderedItems] = useState<Entry[]>([])

  // Sync orderedItems from folders/files
  useEffect(() => {
    const items: Entry[] = [
      ...folders.map((f) => ({ type: 'folder' as const, data: f })),
      ...files.map((f) => ({ type: 'file' as const, data: f })),
    ]
    setOrderedItems(items)
  }, [folders, files])

  const isLoading = foldersLoading || filesLoading

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = orderedItems.findIndex((item) => getSortId(item) === active.id)
    const newIndex = orderedItems.findIndex((item) => getSortId(item) === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    // Reorder locally
    const reordered = [...orderedItems]
    const [moved] = reordered.splice(oldIndex, 1)
    if (!moved) return
    reordered.splice(newIndex, 0, moved)
    setOrderedItems(reordered)

    // Persist new sort_order to DB
    const updates = reordered.map((item, i) => ({
      id: item.data.id,
      sort_order: i,
      type: item.type as 'folder' | 'file',
    }))
    try {
      await getStorageAdapter().updateSortOrder(updates)
    } catch {
      // Refresh from server on failure
      refreshFiles()
      refreshFolders()
    }
  }, [orderedItems, refreshFiles, refreshFolders])

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
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
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
      <div className="bg-[#E0E5EC] dark:bg-[#1a1d23] px-3 sm:px-4 lg:px-6 py-2.5">
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
        </div>
      </div>

      {/* Upload zone & click upload */}
      <div className="px-3 sm:px-4 lg:px-6 pt-3">
        <FileUploader onDrop={handleDrop} />
      </div>
      <input
        ref={uploadInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || [])
          if (files.length > 0) handleDrop(files)
          e.target.value = ''
        }}
      />

      {/* File grid with drag-and-drop */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-3 scrollbar-thin">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="neumo-spinner" />
          </div>
        ) : orderedItems.length === 0 ? (
          <EmptyState onUploadClick={() => uploadInputRef.current?.click()} />
        ) : (
          <div className="bg-[#E0E5EC] dark:bg-[#1a1d23] rounded-[32px] shadow-[9px_9px_16px_rgb(163_177_198_/_0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[9px_9px_16px_rgb(0_0_0_/_0.4),-9px_-9px_16px_rgba(255,255,255,0.05)] p-4 sm:p-5">
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext items={orderedItems.map(getSortId)}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-4">
                  {orderedItems.map((item) => (
                    <FileItemCard
                      key={getSortId(item)}
                      id={getSortId(item)}
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
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>

      {/* Upload progress & error */}
      {uploadError && (
        <div className="px-3 sm:px-4 lg:px-6 pb-2">
          <p className="text-xs text-red-500 dark:text-red-400">{uploadError}</p>
        </div>
      )}
      {isUploading && (
        <div className="px-3 sm:px-4 lg:px-6 pb-3">
          <ProgressBar progress={progress} />
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">正在上传...</p>
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
