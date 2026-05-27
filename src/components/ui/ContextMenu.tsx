import { useEffect, useRef, type ReactNode } from 'react'

interface ContextMenuProps {
  isOpen: boolean
  onClose: () => void
  position: { x: number; y: number }
  children: ReactNode
}

export function ContextMenu({ isOpen, onClose, position, children }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]"
      style={{ left: position.x, top: position.y }}
    >
      {children}
    </div>
  )
}

export function ContextMenuItem({ children, onClick, danger }: { children: ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
        danger
          ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
