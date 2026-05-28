import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#E0E5EC] rounded-[32px] shadow-[9px_9px_16px_rgb(163_177_198_/_0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:bg-[#1a1d23] dark:shadow-[9px_9px_16px_rgb(0_0_0_/_0.4),-9px_-9px_16px_rgba(255,255,255,0.05)]"
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 shrink-0">
            <h2 className="text-lg font-bold text-[#3D4852] dark:text-[#E8ECF1] font-display">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-[#6B7280] hover:text-[#3D4852] hover:shadow-[inset_3px_3px_6px_rgb(163_177_198_/_0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-auto p-6 scrollbar-thin">{children}</div>
      </div>
    </div>
  )
}
