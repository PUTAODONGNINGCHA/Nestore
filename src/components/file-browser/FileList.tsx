import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import JSZip from 'jszip'
import { FileItemCard } from './FileItemGrid'
import { Breadcrumb } from './Breadcrumb'
import { EmptyState } from './EmptyState'
import { MoveFileDialog } from './MoveFileDialog'
import { useFiles } from '@/hooks/useFiles'
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
  folders: import('@/types').Folder[]
  onRenameFolder: (id: string, name: string) => Promise<void>
  onRemoveFolder: (id: string) => Promise<void>
  onRefreshFolders: () => Promise<void>
  uploadInputRef: { current: HTMLInputElement | null }
}

type Entry = { type: 'folder'; data: import('@/types').Folder } | { type: 'file'; data: FileItem }

function getSortId(entry: Entry) {
  return entry.type === 'folder' ? `folder-${entry.data.id}` : `file-${entry.data.id}`
}

export function FileList({ currentFolderId, onNavigate, folders, onRenameFolder, onRemoveFolder, onRefreshFolders, uploadInputRef }: FileListProps) {
  const { files, isLoading: filesLoading, error: filesError, refresh: refreshFiles, rename: renameFile, remove: removeFile } = useFiles(currentFolderId)
  const { crumbs } = useBreadcrumbs(currentFolderId)
  const { isUploading, progress, error: uploadError, uploadMultiple } = useUpload(currentFolderId, () => { refreshFiles(); onRefreshFolders() })
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [moveItem, setMoveItem] = useState<{ id: string; name: string; type: 'file' | 'folder' } | null>(null)
  const [orderedItems, setOrderedItems] = useState<Entry[]>([])
  const [isNavigating, setIsNavigating] = useState(false)
  const prevFolderRef = useRef(currentFolderId)
  // Track folder navigation to show spinner during transitions (prevent empty-state flash)
  useLayoutEffect(() => {
    if (prevFolderRef.current !== currentFolderId) {
      setIsNavigating(true)
      prevFolderRef.current = currentFolderId
    }
  }, [currentFolderId])
  // Sync orderedItems from folders/files — also clears navigation state
  useEffect(() => {
    const items: Entry[] = [
      ...folders.map((f) => ({ type: 'folder' as const, data: f })),
      ...files.map((f) => ({ type: 'file' as const, data: f })),
    ]
    setOrderedItems(items)
    if (isNavigating) setIsNavigating(false)
  }, [folders, files])

  // Browser back button closes file preview
  useEffect(() => {
    const handlePopState = () => {
      if (previewFile) setPreviewFile(null)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [previewFile])

  const isLoading = filesLoading

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = orderedItems.findIndex((item) => getSortId(item) === active.id)
    const newIndex = orderedItems.findIndex((item) => getSortId(item) === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = [...orderedItems]
    const [moved] = reordered.splice(oldIndex, 1)
    if (!moved) return
    reordered.splice(newIndex, 0, moved)
    setOrderedItems(reordered)

    const updates = reordered.map((item, i) => ({
      id: item.data.id,
      sort_order: i,
      type: item.type as 'folder' | 'file',
    }))
    try {
      await getStorageAdapter().updateSortOrder(updates)
    } catch {
      refreshFiles()
      onRefreshFolders()
    }
  }, [orderedItems, refreshFiles, onRefreshFolders])

  const handleDelete = async (id: string, type: 'file' | 'folder') => {
    if (!confirm('确定要删除吗？此操作不可恢复。')) return
    if (type === 'folder') {
      await onRemoveFolder(id)
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

  const handleFolderDownload = async (folder: import('@/types').Folder) => {
    try {
      const allFolders = await getStorageAdapter().getAllFolders()
      const allFiles = await getStorageAdapter().getFiles(folder.id)

      // Collect nested files
      const subFolders = allFolders.filter((f) => f.parent_id === folder.id)
      const allFolderFiles = [...allFiles]
      for (const sub of subFolders) {
        const subFiles = await getStorageAdapter().getFiles(sub.id)
        allFolderFiles.push(...subFiles)
      }

      const zip = new JSZip()
      for (const f of allFolderFiles) {
        try {
          const url = await getStorageAdapter().getDownloadUrl(f.storage_path)
          const resp = await fetch(url)
          const blob = await resp.blob()
          zip.file(f.name, blob)
        } catch { /* skip failed files */ }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const blobUrl = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${folder.name}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      alert('下载文件夹失败')
    }
  }

  const handleMove = async (targetFolderId: string | null) => {
    if (!moveItem) return
    if (moveItem.type === 'folder') {
      await getStorageAdapter().moveFolder(moveItem.id, targetFolderId)
      onRefreshFolders()
    } else {
      await getStorageAdapter().moveFile(moveItem.id, targetFolderId)
      refreshFiles()
    }
    setMoveItem(null)
  }

  const handleDrop = async (acceptedFiles: File[]) => {
    // Check for duplicate filenames
    const existingNames = new Set(files.map((f) => f.name))
    const newFiles = acceptedFiles.filter((f) => !existingNames.has(f.name))
    const dupFiles = acceptedFiles.filter((f) => existingNames.has(f.name))

    if (dupFiles.length > 0) {
      const first = dupFiles[0]
      if (first && confirm(`文件 "${first.name}" 已存在，是否覆盖？`)) {
        for (const dup of dupFiles) {
          const old = files.find((f) => f.name === dup.name)
          if (old) await removeFile(old.id)
        }
        newFiles.push(...dupFiles)
      }
    }

    if (newFiles.length > 0) {
      await uploadMultiple(newFiles)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Toolbar */}
      <div className="px-3 sm:px-4 lg:px-6 pt-3">
        <div className="bg-white rounded-[24px] px-4 py-2.5 shadow-[8px_8px_16px_rgba(160,150,180,0.1),-4px_-4px_12px_rgba(255,255,255,0.5)]">
          <div className="flex items-center">
            <div className="min-w-0 overflow-x-auto">
              <Breadcrumb crumbs={crumbs} onNavigate={onNavigate} />
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
        {isLoading || isNavigating ? (
          <div className="flex items-center justify-center py-16">
            <div className="clay-spinner" />
          </div>
        ) : orderedItems.length === 0 ? (
          <EmptyState onUploadClick={() => uploadInputRef.current?.click()} />
        ) : (
          <div className="bg-white rounded-[32px] shadow-[12px_12px_24px_rgba(160,150,180,0.12),-6px_-6px_16px_rgba(255,255,255,0.6)] p-4 sm:p-5">
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
                      onPreview={(file) => {
                        if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                          getStorageAdapter().getDownloadUrl(file.storage_path).then(url => window.open(url, '_blank'))
                        } else {
                          setPreviewFile(file); window.history.pushState({ previewFile: true }, '')
                        }
                      }}
                      onDownload={handleDownload}
                      onFolderDownload={handleFolderDownload}
                      onMove={(data) => setMoveItem({ id: data.id, name: data.name, type: item.type })}
                      onRename={(id, name) => {
                        const exists = item.type === 'folder'
                          ? folders.some((f) => f.id !== id && f.name === name)
                          : files.some((f) => f.id !== id && f.name === name)
                        if (exists) {
                          alert(`已存在同名${item.type === 'folder' ? '文件夹' : '文件'}`)
                          return
                        }
                        if (item.type === 'folder') onRenameFolder(id, name)
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
      {(uploadError || filesError) && (
        <div className="px-3 sm:px-4 lg:px-6 pb-2 space-y-1">
          {uploadError && <p className="text-xs text-red-500 dark:text-red-400">上传: {uploadError}</p>}
          {filesError && <p className="text-xs text-red-500 dark:text-red-400">文件: {filesError}</p>}
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
      {moveItem && (
        <MoveFileDialog
          isOpen={!!moveItem}
          onClose={() => setMoveItem(null)}
          onMove={handleMove}
        />
      )}
    </div>
  )
}
