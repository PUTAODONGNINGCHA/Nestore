interface ProgressBarProps {
  progress: number
  className?: string
}

export function ProgressBar({ progress, className = '' }: ProgressBarProps) {
  return (
    <div className={`relative h-3 rounded-full bg-[#E0E5EC] dark:bg-[#1a1d23] shadow-[inset_3px_3px_6px_rgb(163_177_198_/_0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] dark:shadow-[inset_3px_3px_6px_rgb(0_0_0_/_0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.05)] overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] to-[#8B84FF] transition-all duration-300 ease-out shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  )
}
