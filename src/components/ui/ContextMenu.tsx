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
      className="fixed z-50 bg-[#E0E5EC] dark:bg-[#1a1d23] rounded-[16px] shadow-[9px_9px_16px_rgb(163_177_198_/_0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[9px_9px_16px_rgb(0_0_0_/_0.4),-9px_-9px_16px_rgba(255,255,255,0.05)] py-1 min-w-[160px] overflow-hidden"
      style={{ left: position.x, top: position.y }}
    >
      {children}
    </div>
  )
}

export function ContextMenuItem({ children, onClick, danger }: { children: ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-200 ${
        danger
          ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
          : 'text-[#3D4852] dark:text-[#E8ECF1] hover:shadow-[inset_3px_3px_6px_rgb(163_177_198_/_0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] dark:hover:shadow-[inset_3px_3px_6px_rgb(0_0_0_/_0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.05)]'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
