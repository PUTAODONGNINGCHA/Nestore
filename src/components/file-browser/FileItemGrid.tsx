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
  MoreVertical,
} from 'lucide-react'
import { ContextMenu, ContextMenuItem } from '@/components/ui/ContextMenu'
import { formatFileSize, getFileIcon } from '@/lib/utils'
import { getStorageAdapter } from '@/storage/factory'
import type { FileItem as FileItemType, Folder as FolderType } from '@/types'

interface FileItemCardProps {
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
        className="w-full h-full object-cover"
        loading="lazy"
      />
    )
  }

  return null
}

export function FileItemCard({ item, type, onNavigate, onPreview, onDownload, onMove, onRename, onDelete }: FileItemCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(item.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const moreRef = useRef<HTMLButtonElement>(null)

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

  const handleOpenMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setMenuPos({ x: rect.left, y: rect.bottom + 4 })
    setMenuOpen(true)
  }

  const handleClick = () => {
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
        className="group relative bg-[#E0E5EC] dark:bg-[#1a1d23] rounded-[32px] shadow-[9px_9px_16px_rgb(163_177_198_/_0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[9px_9px_16px_rgb(0_0_0_/_0.4),-9px_-9px_16px_rgba(255,255,255,0.05)] hover:shadow-[12px_12px_20px_rgb(163_177_198_/_0.7),-12px_-12px_20px_rgba(255,255,255,0.6)] dark:hover:shadow-[12px_12px_20px_rgb(0_0_0_/_0.5),-12px_-12px_20px_rgba(255,255,255,0.05)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[inset_6px_6px_10px_rgb(163_177_198_/_0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] dark:active:shadow-[inset_6px_6px_10px_rgb(0_0_0_/_0.4),inset_-6px_-6px_10px_rgba(255,255,255,0.05)] cursor-pointer transition-all duration-300 p-3 sm:p-4 flex flex-col items-center gap-2"
        onContextMenu={handleContextMenu}
        onClick={handleClick}
      >
        {/* Icon / Thumbnail area */}
        <div className="relative w-full aspect-square max-w-[88px] sm:max-w-20 shrink-0">
          {isImage ? (
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-[inset_4px_4px_8px_rgb(163_177_198_/_0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] dark:shadow-[inset_4px_4px_8px_rgb(0_0_0_/_0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.05)]">
              <Thumbnail file={fileItem} />
            </div>
          ) : (
            <div className="w-full h-full rounded-2xl bg-[#E0E5EC] dark:bg-[#1a1d23] shadow-[inset_6px_6px_10px_rgb(163_177_198_/_0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] dark:shadow-[inset_6px_6px_10px_rgb(0_0_0_/_0.4),inset_-6px_-6px_10px_rgba(255,255,255,0.05)] flex items-center justify-center">
              <Icon className={`w-10 h-10 sm:w-10 sm:h-10 ${type === 'folder' ? 'text-[#38B2AC]' : 'text-[#6C63FF]'}`} />
            </div>
          )}
        </div>

        {/* Name / Rename input */}
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
            className="w-full px-2 py-1 text-xs text-center rounded-xl bg-[#E0E5EC] dark:bg-[#1a1d23] text-[#3D4852] dark:text-[#E8ECF1] shadow-[inset_4px_4px_8px_rgb(163_177_198_/_0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] dark:shadow-[inset_4px_4px_8px_rgb(0_0_0_/_0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="w-full text-center min-w-0">
            <p className="text-xs sm:text-xs font-medium text-[#3D4852] dark:text-[#E8ECF1] truncate leading-tight">{item.name}</p>
            {isFile && (
              <p className="text-[10px] sm:text-[10px] text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                {formatFileSize(fileItem.size)}
              </p>
            )}
          </div>
        )}

        {/* Action buttons — Download + More on mobile, all on hover on desktop */}
        <div className="flex items-center justify-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 mt-0.5">
          {isFile && onDownload && (
            <button
              onClick={(e) => { e.stopPropagation(); onDownload(fileItem) }}
              className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl text-[#6B7280] hover:text-[#6C63FF] hover:shadow-[inset_3px_3px_6px_rgb(163_177_198_/_0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] dark:hover:shadow-[inset_3px_3px_6px_rgb(0_0_0_/_0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.05)] active:shadow-[inset_3px_3px_6px_rgb(163_177_198_/_0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] transition-all duration-200"
              title="下载"
            >
              <Download className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </button>
          )}
          <button
            ref={moreRef}
            onClick={handleOpenMenu}
            className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl text-[#6B7280] hover:text-[#6C63FF] hover:shadow-[inset_3px_3px_6px_rgb(163_177_198_/_0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] dark:hover:shadow-[inset_3px_3px_6px_rgb(0_0_0_/_0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.05)] active:shadow-[inset_3px_3px_6px_rgb(163_177_198_/_0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] transition-all duration-200"
            title="更多"
          >
            <MoreVertical className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </button>
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
