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
        className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white/80 backdrop-blur-xl rounded-[32px] shadow-[16px_16px_32px_rgba(160,150,180,0.25),-10px_-10px_24px_rgba(255,255,255,0.9),inset_6px_6px_12px_rgba(139,92,246,0.03),inset_-6px_-6px_12px_rgba(255,255,255,1)]"
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 shrink-0">
            <h2 className="text-lg font-extrabold text-[#332F3A] font-display tracking-tight">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-[16px] text-[#635F69] hover:text-[#7C3AED] hover:bg-[#7C3AED]/10 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7C3AED]/30"
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
