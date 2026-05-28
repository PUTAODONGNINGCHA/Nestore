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
  GripVertical,
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

export function FileItemCard({ id, item, type, onNavigate, onPreview, onDownload, onMove, onRename, onDelete }: FileItemCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(item.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const moreRef = useRef<HTMLButtonElement>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    zIndex: isDragging ? 50 : undefined,
  }

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
        ref={setNodeRef}
        style={style}
        className="group relative bg-white rounded-[32px] shadow-[12px_12px_24px_rgba(160,150,180,0.15),-8px_-8px_16px_rgba(255,255,255,0.7)] hover:-translate-y-1 hover:shadow-[18px_18px_36px_rgba(160,150,180,0.2),-12px_-12px_24px_rgba(255,255,255,0.85)] active:scale-[0.92] active:shadow-[inset_8px_8px_16px_#d9d4e3,inset_-8px_-8px_16px_#ffffff] cursor-pointer transition-transform duration-200 clay-bounce p-3 sm:p-4 flex flex-col items-center gap-2"
        onContextMenu={handleContextMenu}
        onClick={handleClick}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded-full text-[#635F69] hover:text-[#7C3AED] bg-white/80 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing z-10 shadow-[4px_4px_8px_rgba(160,150,180,0.15),-4px_-4px_8px_rgba(255,255,255,0.8)]"
          title="拖拽排序"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        {/* Icon / Thumbnail area */}
        <div className="relative w-full aspect-square max-w-[88px] sm:max-w-20 shrink-0">
          {isImage ? (
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-[inset_6px_6px_12px_#d9d4e3,inset_-6px_-6px_12px_#ffffff]">
              <Thumbnail file={fileItem} />
            </div>
          ) : (
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#F0EDF7] to-[#F4F1FA] shadow-[inset_6px_6px_12px_#d9d4e3,inset_-6px_-6px_12px_#ffffff] flex items-center justify-center">
              <Icon className={`w-10 h-10 sm:w-10 sm:h-10 ${type === 'folder' ? 'text-[#10B981]' : 'text-[#7C3AED]'}`} />
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
            className="w-full px-2 py-1 text-xs text-center rounded-[16px] bg-[#EFEBF5] text-[#332F3A] shadow-[inset_6px_6px_12px_#d9d4e3,inset_-6px_-6px_12px_#ffffff] focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#7C3AED]/20"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="w-full text-center min-w-0">
            <p className="text-xs sm:text-xs font-bold text-[#332F3A] truncate leading-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>{item.name}</p>
            {isFile && (
              <p className="text-[10px] sm:text-[10px] text-[#635F69] mt-0.5">
                {formatFileSize(fileItem.size)}
              </p>
            )}
          </div>
        )}

        {/* Action buttons — bottom-right, visible on hover */}
        <div className="flex items-center justify-end gap-1 w-full sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 mt-auto pt-1">
          {isFile && onDownload && (
            <button
              onClick={(e) => { e.stopPropagation(); onDownload(fileItem) }}
              className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-[16px] text-[#635F69] hover:text-[#7C3AED] hover:bg-white/50 active:bg-white/70 active:shadow-[inset_4px_4px_8px_#d9d4e3,inset_-4px_-4px_8px_#ffffff] transition-all duration-200"
              title="下载"
            >
              <Download className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </button>
          )}
          <button
            ref={moreRef}
            onClick={handleOpenMenu}
            className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-[16px] text-[#635F69] hover:text-[#7C3AED] hover:bg-white/50 active:bg-white/70 active:shadow-[inset_4px_4px_8px_#d9d4e3,inset_-4px_-4px_8px_#ffffff] transition-all duration-200"
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
