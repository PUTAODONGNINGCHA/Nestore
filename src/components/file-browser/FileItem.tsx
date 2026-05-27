import { useState, useRef, useEffect } from 'react'
import {
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  FolderIcon,
  Download,
  Trash2,
  Move,
} from 'lucide-react'
import { ContextMenu, ContextMenuItem } from '@/components/ui/ContextMenu'
import { formatFileSize, getFileIcon } from '@/lib/utils'
import { getStorageAdapter } from '@/storage/factory'
import type { FileItem as FileItemType, Folder as FolderType } from '@/types'

interface FileItemProps {
  item: FileItemType | FolderType
  type: 'file' | 'folder'
  onNavigate?: (folderId: string) => void
  onPreview?: (file: FileItemType) => void
  onDownload?: (file: FileItemType) => void
  onMove?: (file: FileItemType) => void
  onRename?: (id: string, name: string) => void
  onDelete?: (id: string) => void
}

function getIcon(type: 'file' | 'folder', mimeType?: string) {
  if (type === 'folder') return FolderIcon
  const iconType = getFileIcon(mimeType ?? '')
  switch (iconType) {
    case 'image': return Image
    case 'video': return Video
    case 'audio': return Music
    case 'archive': return Archive
    case 'pdf':
    case 'document':
    case 'spreadsheet':
    case 'text': return FileText
    default: return File
  }
}

function Thumbnail({ file }: { file: FileItemType }) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null)

  useEffect(() => {
    if (file.mime_type.startsWith('image/')) {
      getStorageAdapter().getThumbnailUrl(file.storage_path).then(setThumbUrl).catch(() => {})
    }
  }, [file.storage_path, file.mime_type])

  if (thumbUrl) {
    return (
      <img
        src={thumbUrl}
        alt={file.name}
        className="w-8 h-8 rounded object-cover shrink-0"
        loading="lazy"
      />
    )
  }

  return null
}

export function FileItemRow({ item, type, onNavigate, onPreview, onDownload, onMove, onRename, onDelete }: FileItemProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(item.name)
  const inputRef = useRef<HTMLInputElement>(null)

  const Icon = getIcon(type, type === 'file' ? (item as FileItemType).mime_type : undefined)
  const isFile = type === 'file'
  const fileItem = item as FileItemType
  const isImage = isFile && fileItem.mime_type.startsWith('image/')

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setMenuPos({ x: e.clientX, y: e.clientY })
    setMenuOpen(true)
  }

  const handleDoubleClick = () => {
    if (type === 'folder') {
      onNavigate?.(item.id)
    } else if (isFile) {
      onPreview?.(fileItem)
    }
  }

  const handleRename = () => {
    setMenuOpen(false)
    setIsRenaming(true)
    setNewName(item.name)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const submitRename = () => {
    if (newName.trim() && newName !== item.name) {
      onRename?.(item.id, newName.trim())
    }
    setIsRenaming(false)
  }

  return (
    <>
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group transition-colors"
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
      >
        {isImage ? (
          <Thumbnail file={fileItem} />
        ) : (
          <Icon className={`w-5 h-5 shrink-0 ${type === 'folder' ? 'text-yellow-500' : 'text-gray-400'}`} />
        )}

        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={submitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitRename()
              if (e.key === 'Escape') setIsRenaming(false)
            }}
            className="flex-1 min-w-0 px-2 py-0.5 text-sm rounded border border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 min-w-0 text-sm text-gray-900 dark:text-white truncate">{item.name}</span>
        )}

        {isFile && (
          <>
            <span className="text-xs text-gray-400 dark:text-gray-500 w-16 text-right shrink-0 hidden sm:block">
              {formatFileSize(fileItem.size)}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 w-20 text-right shrink-0 hidden md:block">
              {new Date(fileItem.created_at).toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </>
        )}

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {isFile && onMove && (
            <button
              onClick={(e) => { e.stopPropagation(); onMove(fileItem) }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              title="移动"
            >
              <Move className="w-4 h-4" />
            </button>
          )}
          {isFile && onDownload && (
            <button
              onClick={(e) => { e.stopPropagation(); onDownload(fileItem) }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
              title="下载"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <ContextMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} position={menuPos}>
        {type === 'folder' && onNavigate && (
          <ContextMenuItem onClick={() => { setMenuOpen(false); onNavigate(item.id) }}>
            打开
          </ContextMenuItem>
        )}
        {isFile && onPreview && (
          <ContextMenuItem onClick={() => { setMenuOpen(false); onPreview(fileItem) }}>
            预览
          </ContextMenuItem>
        )}
        {isFile && onDownload && (
          <ContextMenuItem onClick={() => { setMenuOpen(false); onDownload(fileItem) }}>
            下载
          </ContextMenuItem>
        )}
        {isFile && onMove && (
          <ContextMenuItem onClick={() => { setMenuOpen(false); onMove(fileItem) }}>
            移动到...
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={handleRename}>
          重命名
        </ContextMenuItem>
        {onDelete && (
          <ContextMenuItem onClick={() => { setMenuOpen(false); onDelete(item.id) }} danger>
            删除
          </ContextMenuItem>
        )}
      </ContextMenu>
    </>
  )
}
