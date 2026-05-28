interface ProgressBarProps {
  progress: number
  className?: string
}

export function ProgressBar({ progress, className = '' }: ProgressBarProps) {
  return (
    <div className={`relative h-3 rounded-full bg-[#EFEBF5] shadow-[inset_6px_6px_12px_#d9d4e3,inset_-6px_-6px_12px_#ffffff] overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] transition-all duration-300 ease-out shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  )
}
