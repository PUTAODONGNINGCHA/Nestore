import { Folder } from 'lucide-react'
import type { Folder as FolderType } from '@/types'

interface SidebarProps {
  currentFolderId: string | null
  onNavigate: (folderId: string | null) => void
  folders: FolderType[]
}

export function Sidebar({ currentFolderId, onNavigate, folders }: SidebarProps) {
  return (
    <aside className="w-56 bg-[#E0E5EC] dark:bg-[#1a1d23] rounded-[32px] shadow-[9px_9px_16px_rgb(163_177_198_/_0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[9px_9px_16px_rgb(0_0_0_/_0.4),-9px_-9px_16px_rgba(255,255,255,0.05)] flex flex-col hidden md:flex overflow-hidden">
      <nav className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
        <button
          className={`w-full text-left px-3 py-2.5 rounded-[16px] text-sm transition-all duration-200 font-medium ${
            currentFolderId === null
              ? 'bg-[#E0E5EC] dark:bg-[#1a1d23] text-[#6C63FF] shadow-[inset_4px_4px_8px_rgb(163_177_198_/_0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] dark:shadow-[inset_4px_4px_8px_rgb(0_0_0_/_0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.05)]'
              : 'text-[#3D4852] dark:text-[#E8ECF1] hover:shadow-[inset_3px_3px_6px_rgb(163_177_198_/_0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] dark:hover:shadow-[inset_3px_3px_6px_rgb(0_0_0_/_0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.05)]'
          }`}
          onClick={() => onNavigate(null)}
        >
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 shrink-0" />
            全部文件
          </div>
        </button>
        {folders.map((folder) => (
          <button
            key={folder.id}
            className={`w-full text-left px-3 py-2.5 rounded-[16px] text-sm transition-all duration-200 ${
              currentFolderId === folder.id
                ? 'bg-[#E0E5EC] dark:bg-[#1a1d23] text-[#6C63FF] shadow-[inset_4px_4px_8px_rgb(163_177_198_/_0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] dark:shadow-[inset_4px_4px_8px_rgb(0_0_0_/_0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.05)]'
                : 'text-[#3D4852] dark:text-[#E8ECF1] hover:shadow-[inset_3px_3px_6px_rgb(163_177_198_/_0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] dark:hover:shadow-[inset_3px_3px_6px_rgb(0_0_0_/_0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.05)]'
            }`}
            onClick={() => onNavigate(folder.id)}
          >
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 shrink-0" />
              <span className="truncate">{folder.name}</span>
            </div>
          </button>
        ))}
      </nav>
    </aside>
  )
}
