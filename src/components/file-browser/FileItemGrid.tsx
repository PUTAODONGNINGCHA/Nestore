import { useState, useRef, useEffect } from 'react'
import {
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  FolderIcon,
} from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ContextMenu, ContextMenuItem } from '@/components/ui/ContextMenu'
import { formatFileSize, getFileIcon } from '@/lib/utils'
import { getStorageAdapter } from '@/storage/factory'
import type { FileItem as FileItemType, Folder as FolderType } from '@/types'

interface FileItemCardProps {
  id: string
  item: FileItemType | FolderType
  type: 'file' | 'folder'
  onNavigate?: (folderId: string) => void
  onPreview?: (file: FileItemType) => void
  onDownload?: (file: FileItemType) => void
  onMove?: (item: FileItemType | FolderType) => void
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

export function FileItemCard({ id, item, type, onNavigate, onPreview, onDownload, onMove, onRename, onDelete }: FileItemCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(item.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : 'transform 200ms ease-out',
    opacity: isDragging ? 0.5 : undefined,
    zIndex: isDragging ? 50 : undefined,
  }

  const Icon = getIcon(type, type === 'file' ? (item as FileItemType).mime_type : undefined)
  const isFile = type === 'file'
  const fileItem = item as FileItemType
  const isImage = isFile && fileItem.mime_type.startsWith('image/')

  const showMenu = (x: number, y: number) => {
    setMenuPos({ x, y })
    setMenuOpen(true)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    showMenu(e.clientX, e.clientY)
  }

  const handleClick = () => {
    if (type === 'folder') {
      onNavigate?.(item.id)
    } else if (isFile) {
      onPreview?.(fileItem)
    }
  }

  // Long press for mobile context menu
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    const x = touch.clientX
    const y = touch.clientY
    longPressTimer.current = setTimeout(() => {
      showMenu(x, y)
    }, 500)
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
  }

  const handleTouchMove = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
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
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="group relative bg-white rounded-[32px] shadow-[12px_12px_24px_rgba(160,150,180,0.15),-8px_-8px_16px_rgba(255,255,255,0.7)] hover:-translate-y-0.5 hover:shadow-[16px_16px_32px_rgba(160,150,180,0.2),-10px_-10px_20px_rgba(255,255,255,0.85)] active:scale-[0.96] cursor-pointer transition-[transform,box-shadow] duration-150 ease-out flex flex-col items-center py-3 sm:py-4 px-3 sm:px-4 touch-none"
        onContextMenu={handleContextMenu}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        {/* Icon */}
        <div className="relative w-full aspect-square max-w-[80px] sm:max-w-20 shrink-0">
          {isImage ? (
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-[inset_6px_6px_12px_#d9d4e3,inset_-6px_-6px_12px_#ffffff]">
              <Thumbnail file={fileItem} />
            </div>
          ) : (
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#F0EDF7] to-[#F4F1FA] shadow-[inset_6px_6px_12px_#d9d4e3,inset_-6px_-6px_12px_#ffffff] flex items-center justify-center">
              <Icon className={`w-9 h-9 sm:w-10 sm:h-10 ${type === 'folder' ? 'text-[#10B981]' : 'text-[#7C3AED]'}`} />
            </div>
          )}
        </div>
        {/* Name */}
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
            className="w-full px-2 py-1 text-xs text-center rounded-[16px] bg-[#EFEBF5] text-[#332F3A] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/30 mt-2"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="w-full text-center min-w-0 mt-2">
            <p className="text-xs sm:text-xs font-bold text-[#332F3A] truncate leading-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>{item.name}</p>
            {isFile && (
              <p className="text-[10px] sm:text-[10px] text-[#635F69] mt-0.5">
                {formatFileSize(fileItem.size)}
              </p>
            )}
          </div>
        )}
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
        {onMove && (
          <ContextMenuItem onClick={() => { setMenuOpen(false); onMove(item) }}>
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
