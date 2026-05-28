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
        className="flex items-center gap-1 px-3 py-1.5 rounded-[16px] text-[#635F69] hover:text-[#7C3AED] hover:bg-[#7C3AED]/10 font-bold transition-all duration-200"
      >
        全部文件
      </button>
      {crumbs.map((crumb, i) => (
        <div key={crumb.id} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5 text-[#635F69]" />
          <button
            onClick={() => onNavigate(crumb.id)}
            className={`px-3 py-1.5 rounded-[16px] transition-all duration-200 font-bold cursor-pointer ${
              i === crumbs.length - 1
                ? 'text-[#7C3AED]'
                : 'text-[#635F69] hover:text-[#7C3AED] hover:bg-[#7C3AED]/10'
            }`}
          >
            {crumb.name}
          </button>
        </div>
      ))}
    </nav>
  )
}
