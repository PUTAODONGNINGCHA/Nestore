import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbProps {
  crumbs: { id: string; name: string }[]
  onNavigate: (folderId: string | null) => void
}

export function Breadcrumb({ crumbs, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-sm">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
      >
        <Home className="w-4 h-4" />
      </button>
      {crumbs.map((crumb, i) => (
        <div key={crumb.id} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <button
            onClick={() => onNavigate(crumb.id)}
            className={`px-2 py-1 rounded-lg transition-colors ${
              i === crumbs.length - 1
                ? 'text-gray-900 dark:text-white font-medium'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            {crumb.name}
          </button>
        </div>
      ))}
    </nav>
  )
}
