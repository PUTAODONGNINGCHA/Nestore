import { ChevronRight } from 'lucide-react'

interface BreadcrumbProps {
  crumbs: { id: string; name: string }[]
  onNavigate: (folderId: string | null) => void
}

export function Breadcrumb({ crumbs, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-sm">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#3D4852] dark:hover:text-[#E8ECF1] hover:shadow-[inset_3px_3px_6px_rgb(163_177_198_/_0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] dark:hover:shadow-[inset_3px_3px_6px_rgb(0_0_0_/_0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.05)] transition-all duration-200"
      >
        全部文件
      </button>
      {crumbs.map((crumb, i) => (
        <div key={crumb.id} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#9CA3AF]" />
          <button
            onClick={() => onNavigate(crumb.id)}
            className={`px-2 py-1.5 rounded-xl transition-all duration-200 ${
              i === crumbs.length - 1
                ? 'text-[#3D4852] dark:text-[#E8ECF1] font-bold'
                : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#3D4852] dark:hover:text-[#E8ECF1] hover:shadow-[inset_3px_3px_6px_rgb(163_177_198_/_0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] dark:hover:shadow-[inset_3px_3px_6px_rgb(0_0_0_/_0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.05)]'
            }`}
          >
            {crumb.name}
          </button>
        </div>
      ))}
    </nav>
  )
}
