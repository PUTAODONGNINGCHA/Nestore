import { useEffect, useRef, useState, type ReactNode } from 'react'

interface ContextMenuProps {
  isOpen: boolean
  onClose: () => void
  position: { x: number; y: number }
  children: ReactNode
}

export function ContextMenu({ isOpen, onClose, position, children }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [adjustedPos, setAdjustedPos] = useState(position)

  useEffect(() => {
    if (!isOpen || !ref.current) return
    const menu = ref.current
    const rect = menu.getBoundingClientRect()
    let x = position.x
    let y = position.y

    // Overflow right edge
    if (x + rect.width > window.innerWidth) {
      x = window.innerWidth - rect.width - 12
    }
    // Overflow bottom edge → open upward
    if (y + rect.height > window.innerHeight) {
      y = position.y - rect.height - 8
    }
    // Still off screen at top? clamp
    if (y < 4) y = 4

    setAdjustedPos({ x, y })
  }, [isOpen, position])

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
      className="fixed z-50 bg-white rounded-[24px] shadow-[12px_12px_24px_rgba(160,150,180,0.2),-6px_-6px_16px_rgba(255,255,255,0.5)] py-1.5 min-w-[170px]"
      style={{ left: adjustedPos.x, top: adjustedPos.y }}
    >
      {children}
    </div>
  )
}

export function ContextMenuItem({ children, onClick, danger }: { children: ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-200 font-bold ${
        danger
          ? 'text-red-500 hover:bg-red-50'
          : 'text-[#332F3A] hover:bg-[#7C3AED]/10 hover:text-[#7C3AED]'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
